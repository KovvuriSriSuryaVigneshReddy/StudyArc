"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  GraduationCap,
  Zap,
  Target,
  FileUp,
  Cpu,
  Plus,
  Trash2,
} from "lucide-react";
import { SubjectMode, DifficultyLevel } from "@/types";
import { parseUploadedFile, ParsedFileResult } from "@/lib/fileParsers";
import { SAMPLE_STEM_LECTURE, SAMPLE_HUMANITIES_LECTURE } from "@/lib/sampleData";

interface InputStudioProps {
  onGenerate?: (content: string, subjectMode: SubjectMode, difficultyLevel: DifficultyLevel) => void;
  onSubmit?: (content: string) => void;
  isLoading?: boolean;
  subjectMode?: SubjectMode;
  setSubjectMode?: (mode: SubjectMode) => void;
  difficultyLevel?: DifficultyLevel;
  setDifficultyLevel?: (lvl: DifficultyLevel) => void;
}

const MAX_CONTENT_LIMIT = 25000;

export const InputStudio: React.FC<InputStudioProps> = ({
  onGenerate,
  onSubmit,
  isLoading = false,
  subjectMode: extSubjectMode,
  setSubjectMode: extSetSubjectMode,
  difficultyLevel: extDifficultyLevel,
  setDifficultyLevel: extSetDifficultyLevel,
}) => {
  // Input mode tab: "upload" or "paste"
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  // Aggregated pasted / parsed text
  const [rawText, setRawText] = useState("");
  // Multi-file queue state
  const [uploadedFiles, setUploadedFiles] = useState<ParsedFileResult[]>([]);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [dropzoneTilt, setDropzoneTilt] = useState<{ x: number; y: number; isResetting: boolean }>({
    x: 0,
    y: 0,
    isResetting: true,
  });

  const handleDropzoneMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setDropzoneTilt({
      x: -y * 12,
      y: x * 14,
      isResetting: false,
    });
  };

  const handleDropzoneMouseLeave = () => {
    setIsDragOver(false);
    setDropzoneTilt({ x: 0, y: 0, isResetting: true });
  };

  // Personalization settings
  const [internalSubjectMode, setInternalSubjectMode] = useState<SubjectMode>("stem");
  const [internalDifficultyLevel, setInternalDifficultyLevel] = useState<DifficultyLevel>("quick_cram");

  const subjectMode = extSubjectMode !== undefined ? extSubjectMode : internalSubjectMode;
  const setSubjectMode = extSetSubjectMode || setInternalSubjectMode;
  const difficultyLevel = extDifficultyLevel !== undefined ? extDifficultyLevel : internalDifficultyLevel;
  const setDifficultyLevel = extSetDifficultyLevel || setInternalDifficultyLevel;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileInfo = (type: string, fileName: string) => {
    const ext = fileName.split(".").pop()?.toUpperCase() || type.toUpperCase();
    if (type === "pptx" || ext === "PPTX") {
      return {
        icon: <Layers className="h-4 w-4 text-amber-300" />,
        badgeColor: "border-amber-500/40 bg-amber-500/10 text-amber-300",
        badgeText: ".PPTX",
      };
    }
    if (type === "pdf" || ext === "PDF") {
      return {
        icon: <FileText className="h-4 w-4 text-rose-300" />,
        badgeColor: "border-rose-500/40 bg-rose-500/10 text-rose-300",
        badgeText: ".PDF",
      };
    }
    if (ext === "MD") {
      return {
        icon: <FileText className="h-4 w-4 text-purple-300" />,
        badgeColor: "border-purple-500/40 bg-purple-500/10 text-purple-300",
        badgeText: ".MD",
      };
    }
    return {
      icon: <FileText className="h-4 w-4 text-cyan-300" />,
      badgeColor: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
      badgeText: `.${ext || "TXT"}`,
    };
  };

  // Recompute aggregated content from all queued files with demarcation headers
  const updateAggregatedText = (files: ParsedFileResult[]) => {
    if (files.length === 0) {
      setRawText("");
      return;
    }

    let aggregated = "";
    if (files.length === 1) {
      aggregated = `--- SOURCE FILE 1: ${files[0].fileName} ---\n${files[0].text}`;
    } else {
      aggregated = files
        .map((file, idx) => `--- SOURCE FILE ${idx + 1}: ${file.fileName} ---\n${file.text}`)
        .join("\n\n");
    }

    if (aggregated.length > MAX_CONTENT_LIMIT) {
      aggregated = aggregated.slice(0, MAX_CONTENT_LIMIT);
    }
    setRawText(aggregated);
  };

  // Asynchronous multi-file processing with duplicate avoidance
  const handleProcessFiles = async (incomingFiles: FileList | File[]) => {
    const fileArray = Array.from(incomingFiles);
    if (fileArray.length === 0) return;

    setParsingError(null);
    setIsParsingFile(true);
    setIsIngesting(true);

    try {
      // Filter out duplicate files by name and size
      const existingKeys = new Set(uploadedFiles.map((f) => `${f.fileName}_${f.fileSize}`));
      const newFiles = fileArray.filter((f) => !existingKeys.has(`${f.name}_${f.size}`));

      if (newFiles.length === 0 && fileArray.length > 0) {
        setParsingError("The selected file(s) are already in the upload queue.");
        setIsParsingFile(false);
        setIsIngesting(false);
        return;
      }

      // Process all uploaded files asynchronously via Promise.all
      const parsedResults = await Promise.all(
        newFiles.map(async (file) => {
          return await parseUploadedFile(file);
        })
      );

      const updatedQueue = [...uploadedFiles, ...parsedResults];
      setUploadedFiles(updatedQueue);
      updateAggregatedText(updatedQueue);

      setTimeout(() => setIsIngesting(false), 850);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to parse one or more files.";
      setParsingError(msg);
      setIsIngesting(false);
    } finally {
      setIsParsingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFiles(e.target.files);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const updated = uploadedFiles.filter((_, idx) => idx !== indexToRemove);
    setUploadedFiles(updated);
    updateAggregatedText(updated);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearAllFiles = () => {
    setUploadedFiles([]);
    setRawText("");
    setParsingError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Quick Preset Sample Loaders
  const handleLoadSample = (type: "stem" | "humanities") => {
    setParsingError(null);
    if (type === "stem") {
      const mockFile: ParsedFileResult = {
        text: SAMPLE_STEM_LECTURE,
        fileName: "CS_Lecture_07_Neural_Optimization.txt",
        fileSize: SAMPLE_STEM_LECTURE.length,
        type: "txt",
      };
      setUploadedFiles([mockFile]);
      setRawText(SAMPLE_STEM_LECTURE);
      setSubjectMode("stem");
      setDifficultyLevel("quick_cram");
      setActiveTab("paste");
    } else {
      const mockFile: ParsedFileResult = {
        text: SAMPLE_HUMANITIES_LECTURE,
        fileName: "PHIL_210_Social_Contract_Theory.txt",
        fileSize: SAMPLE_HUMANITIES_LECTURE.length,
        type: "txt",
      };
      setUploadedFiles([mockFile]);
      setRawText(SAMPLE_HUMANITIES_LECTURE);
      setSubjectMode("humanities");
      setDifficultyLevel("deep_mastery");
      setActiveTab("paste");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveContent = rawText.trim();
    if (!effectiveContent) {
      setParsingError("Please upload one or more lecture files or paste lecture notes first.");
      return;
    }
    if (effectiveContent.length < 30) {
      setParsingError("Content is too short. Please provide at least a couple of lecture paragraphs.");
      return;
    }
    if (onGenerate) {
      onGenerate(effectiveContent, subjectMode, difficultyLevel);
    } else if (onSubmit) {
      onSubmit(effectiveContent);
    }
  };

  const totalBytes = uploadedFiles.reduce((acc, f) => acc + f.fileSize, 0);
  const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
  const isContentCapped = rawText.length >= MAX_CONTENT_LIMIT;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 relative">
      {/* Decorative ambient backdrop lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 mb-5 shadow-lg shadow-indigo-500/15 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
          <span>Zero Busywork • Single Upload-to-Revision Loop</span>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-center text-white font-display">
          Convert Lecture Materials into{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
            Exam Mastery
          </span>
        </h1>
        <p className="mt-4 text-sm sm:text-base md:text-lg max-w-2xl mx-auto text-slate-300 text-center leading-relaxed font-sans">
          Upload lecture slides or paste course notes. StudyArc.ai synthesizes executive summaries, tangible flippable flashcards, and an active-recall practice quiz in seconds.
        </p>

        {/* Quick Sample Chips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs text-slate-400 font-semibold font-display tracking-wider uppercase">
            1-Click Presets:
          </span>
          <button
            type="button"
            onClick={() => handleLoadSample("stem")}
            className="group inline-flex items-center space-x-2 rounded-xl glass-btn-tactile px-4 py-2 text-xs font-semibold text-slate-200 transition-all duration-300 ease-in-out hover:text-white hover:border-cyan-400/60"
          >
            <Cpu className="h-3.5 w-3.5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
            <span>Load STEM: Neural Networks</span>
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample("humanities")}
            className="group inline-flex items-center space-x-2 rounded-xl glass-btn-tactile px-4 py-2 text-xs font-semibold text-slate-200 transition-all duration-300 ease-in-out hover:text-white hover:border-purple-400/60"
          >
            <GraduationCap className="h-3.5 w-3.5 text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
            <span>Load Humanities: Social Contract</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Input Methods (Tabs) */}
        <div className="rounded-2xl spatial-glass-pane overflow-hidden shadow-2xl transition-all duration-300 ease-in-out">
          {/* Tab Navigation */}
          <div className="flex border-b border-white/10 bg-slate-950/70 p-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`flex-1 flex items-center justify-center space-x-2 rounded-xl py-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 ease-in-out ${
                activeTab === "upload"
                  ? "glass-btn-tactile text-white border-cyan-500/50 shadow-md shadow-cyan-500/15"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileUp className="h-4 w-4 text-cyan-400" />
              <span>Upload File (PDF, PPTX, TXT)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("paste")}
              className={`flex-1 flex items-center justify-center space-x-2 rounded-xl py-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 ease-in-out ${
                activeTab === "paste"
                  ? "glass-btn-tactile text-white border-cyan-500/50 shadow-md shadow-cyan-500/15"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="h-4 w-4 text-cyan-400" />
              <span>Pasted Lecture Notes</span>
              {wordCount > 0 && (
                <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
                  {wordCount} words
                </span>
              )}
            </button>
          </div>

          <div className="p-6">
            {/* Tab 1: Drag-and-Drop File Upload */}
            {activeTab === "upload" && (
              <div className="interactive-tilt-container space-y-4">
                {/* Hidden Multi-File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.pptx,.txt,.md"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {uploadedFiles.length === 0 ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={handleDropzoneMouseLeave}
                    onMouseMove={handleDropzoneMouseMove}
                    onMouseLeave={handleDropzoneMouseLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      transform: `perspective(800px) rotateX(${dropzoneTilt.x}deg) rotateY(${dropzoneTilt.y}deg) translateZ(${dropzoneTilt.isResetting ? 0 : 8}px)`,
                    }}
                    className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 sm:p-10 min-h-[180px] sm:min-h-[220px] text-center cursor-pointer interactive-tilt-card ${
                      dropzoneTilt.isResetting ? "is-resetting" : ""
                    } ${
                      isIngesting
                        ? "card-ingestion-active"
                        : isDragOver
                        ? "border-cyan-400 bg-cyan-500/15 shadow-2xl shadow-cyan-500/40 scale-[1.01]"
                        : "dropzone-neon-pulse spatial-glass-card hover:border-indigo-400/80 hover:bg-slate-900/60"
                    }`}
                  >
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-indigo-500/20">
                      {isParsingFile ? (
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                      ) : (
                        <UploadCloud className="h-7 w-7 text-cyan-300" />
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white font-display">
                      {isParsingFile ? "Ingesting & parsing materials..." : "Drop your lecture slides, notes, or syllabi here"}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-400 font-sans max-w-sm">
                      Upload multiple files simultaneously: PDF lecture packs, PowerPoint (.pptx), Markdown, and TXT files
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-slate-300 font-mono">
                      <span className="rounded-lg border border-white/10 bg-slate-800/80 px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-sm">.pdf</span>
                      <span className="rounded-lg border border-white/10 bg-slate-800/80 px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-sm">.pptx</span>
                      <span className="rounded-lg border border-white/10 bg-slate-800/80 px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-sm">.txt</span>
                      <span className="rounded-lg border border-white/10 bg-slate-800/80 px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-sm">.md</span>
                    </div>
                  </div>
                ) : (
                  /* Multi-File Queue Card */
                  <div className={`space-y-3.5 ${isIngesting ? "card-ingestion-active" : ""}`}>
                    {/* Header with summary pill and queue actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 sm:p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-950/20 backdrop-blur-md shadow-md">
                      <div className="inline-flex items-center space-x-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-mono text-cyan-200">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>
                          {uploadedFiles.length} {uploadedFiles.length === 1 ? "file" : "files"} selected (Total: {formatFileSize(totalBytes)}) • Ready to Synthesize
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-xs">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center space-x-1.5 rounded-lg glass-btn-tactile px-3 py-1.5 text-slate-200 hover:text-white"
                        >
                          <Plus className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Add More Files</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab("paste")}
                          className="inline-flex items-center space-x-1.5 rounded-lg glass-btn-tactile px-3 py-1.5 text-slate-200 hover:text-white"
                        >
                          <FileText className="h-3.5 w-3.5 text-indigo-400" />
                          <span>Preview Text</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleClearAllFiles}
                          className="inline-flex items-center space-x-1 rounded-lg px-2.5 py-1.5 text-slate-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
                          title="Remove all files"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Clear All</span>
                        </button>
                      </div>
                    </div>

                    {/* Queued Files List */}
                    <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                      {uploadedFiles.map((file, idx) => {
                        const fileBadge = getFileInfo(file.type, file.fileName);
                        return (
                          <div
                            key={`${file.fileName}_${file.fileSize}_${idx}`}
                            className="rounded-xl border border-white/10 bg-slate-900/70 p-3 sm:p-3.5 flex items-center justify-between shadow-md hover:border-indigo-500/40 transition-all duration-200"
                          >
                            <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800/90 border border-white/10 shadow-sm">
                                {fileBadge.icon}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-2">
                                  <p className="text-xs sm:text-sm font-bold text-white truncate font-display" title={file.fileName}>
                                    {file.fileName}
                                  </p>
                                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-mono border ${fileBadge.badgeColor}`}>
                                    {fileBadge.badgeText}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                  {formatFileSize(file.fileSize)}
                                  {file.slideCount ? ` • ${file.slideCount} slides extracted` : ""}
                                  {` • ~${file.text.split(/\s+/).length} words parsed`}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveFile(idx)}
                              className="ml-3 shrink-0 rounded-lg p-2 text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 transition-colors"
                              title={`Remove ${file.fileName}`}
                              aria-label={`Remove ${file.fileName}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Active Drag-and-Drop Strip for adding more files */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={handleDropzoneMouseLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex items-center justify-center space-x-2 rounded-xl border border-dashed py-3 px-4 text-center cursor-pointer transition-all duration-200 ${
                        isDragOver
                          ? "border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/20 text-cyan-200"
                          : "border-indigo-500/30 bg-slate-950/40 hover:border-cyan-500/60 hover:bg-slate-900/60 text-slate-300"
                      }`}
                    >
                      <Plus className="h-4 w-4 text-cyan-400 shrink-0" />
                      <span className="text-xs font-medium font-sans">
                        Drop additional files here or click to browse (.pdf, .pptx, .txt, .md)
                      </span>
                    </div>

                    {/* 25k Content Cap Notice */}
                    {isContentCapped && (
                      <div className="flex items-center space-x-2 rounded-xl border border-amber-500/40 bg-amber-950/30 p-2.5 text-xs text-amber-200">
                        <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                        <span>
                          Aggregated lecture text reached the 25,000-character safety threshold and was cleanly capped for optimal AI synthesis.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Pasted Lecture Notes */}
            {activeTab === "paste" && (
              <div className="space-y-2">
                <textarea
                  value={rawText}
                  onChange={(e) => {
                    setRawText(e.target.value);
                    if (parsingError) setParsingError(null);
                  }}
                  rows={8}
                  placeholder="Paste raw lecture transcripts, textbook passages, lecture slide notes, or bulleted summaries here..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono leading-relaxed transition-all"
                />
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>Minimum 30 characters recommended for high-yield synthesis</span>
                  <span>{wordCount} words | {rawText.length} chars</span>
                </div>
              </div>
            )}

            {/* Parsing error display */}
            {parsingError && (
              <div className="mt-4 flex items-center space-x-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{parsingError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Light Personalization Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Subject Mode Selector */}
          <div className="rounded-2xl spatial-glass-card p-5 shadow-xl">
            <div className="flex items-center space-x-2 mb-3">
              <GraduationCap className="h-4 w-4 text-cyan-400" />
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display">
                Subject Mode
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSubjectMode("stem")}
                className={`flex flex-col items-start p-3 sm:p-4 rounded-xl border text-left transition-all duration-300 ease-in-out active:scale-[0.98] ${
                  subjectMode === "stem"
                    ? "border-cyan-400/70 bg-cyan-950/30 text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/40"
                    : "glass-btn-tactile text-slate-300 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1 font-semibold text-xs text-cyan-300">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>STEM / Quant</span>
                </div>
                <span className="text-[11px] text-slate-400 leading-tight">
                  Formulas, derivations & algorithmic problem solving
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSubjectMode("humanities")}
                className={`flex flex-col items-start p-3 sm:p-4 rounded-xl border text-left transition-all duration-300 ease-in-out active:scale-[0.98] ${
                  subjectMode === "humanities"
                    ? "border-purple-400/70 bg-purple-950/30 text-white shadow-md shadow-purple-500/20 ring-1 ring-purple-400/40"
                    : "glass-btn-tactile text-slate-300 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1 font-semibold text-xs text-purple-300">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Humanities</span>
                </div>
                <span className="text-[11px] text-slate-400 leading-tight">
                  Core concepts, definitions, critique & debate
                </span>
              </button>
            </div>
          </div>

          {/* Difficulty Level Selector */}
          <div className="rounded-2xl spatial-glass-card p-5 shadow-xl">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="h-4 w-4 text-purple-400" />
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display">
                Difficulty Level
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDifficultyLevel("quick_cram")}
                className={`flex flex-col items-start p-3 sm:p-4 rounded-xl border text-left transition-all duration-300 ease-in-out active:scale-[0.98] ${
                  difficultyLevel === "quick_cram"
                    ? "border-emerald-400/70 bg-emerald-950/30 text-white shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/40"
                    : "glass-btn-tactile text-slate-300 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1 font-semibold text-xs text-emerald-300">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Quick Cram</span>
                </div>
                <span className="text-[11px] text-slate-400 leading-tight">
                  High-yield essentials & rapid retention formulas
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDifficultyLevel("deep_mastery")}
                className={`flex flex-col items-start p-3 sm:p-4 rounded-xl border text-left transition-all duration-300 ease-in-out active:scale-[0.98] ${
                  difficultyLevel === "deep_mastery"
                    ? "border-amber-400/70 bg-amber-950/30 text-white shadow-md shadow-amber-500/20 ring-1 ring-amber-400/40"
                    : "glass-btn-tactile text-slate-300 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1 font-semibold text-xs text-amber-300">
                  <Target className="h-3.5 w-3.5" />
                  <span>Deep Mastery</span>
                </div>
                <span className="text-[11px] text-slate-400 leading-tight">
                  Exam-level synthesis with tricky distractors
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Step 3: Hero Action Button */}
        <div className="text-center pt-3">
          <button
            type="submit"
            disabled={isLoading || isParsingFile}
            className="group relative inline-flex items-center justify-center space-x-3 rounded-xl glass-btn-hero px-10 py-4.5 text-base font-bold tracking-wide text-white shadow-2xl disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto min-w-[300px]"
          >
            <Sparkles className="h-5 w-5 text-cyan-200 animate-pulse" />
            <span>Generate Study Studio</span>
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 opacity-25 blur-lg group-hover:opacity-50 transition-opacity duration-300 -z-10" />
          </button>
          <p className="mt-3 text-xs text-slate-400 font-sans">
            Powered by Google Gemini AI • Developed by SriSuryaVigneshReddy
          </p>
        </div>
      </form>
    </div>
  );
};

export default InputStudio;
