"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import InputStudio from "@/components/InputStudio";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import RevisionPack from "@/components/RevisionPack";
import ActiveRecallQuiz from "@/components/ActiveRecallQuiz";
import ApiKeyModal from "@/components/ApiKeyModal";
import SpaceBackground from "@/components/SpaceBackground";
import { StudyStudioData, SubjectMode, DifficultyLevel } from "@/types";
import { Columns, BookOpen, HelpCircle, ArrowLeft, Sparkles, Clock } from "lucide-react";

export default function Home() {
  const [data, setData] = useState<StudyStudioData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [subjectMode, setSubjectMode] = useState<SubjectMode>("stem");
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>("quick_cram");
  const [apiKey, setApiKey] = useState<string>("");
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [workspaceLayout, setWorkspaceLayout] = useState<"split" | "revision" | "quiz">("split");
  const [scrollY, setScrollY] = useState<number>(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check if a Gemini API key exists in session
    const savedKey = typeof window !== "undefined"
      ? sessionStorage.getItem("studyarc_gemini_api_key") || sessionStorage.getItem("examforge_gemini_api_key")
      : null;

    if (savedKey) {
      setApiKey(savedKey);
    } else {
      // Auto-popup trigger logic: if no active key is detected on load/reload, automatically open ApiKeyModal immediately
      setIsKeyModalOpen(true);
    }
  }, []);

  // Secure In-Memory Credential Lifecycle: Store client API key in temporary state + sessionStorage
  const handleSaveApiKey = (key: string) => {
    const trimmed = key.trim();
    setApiKey(trimmed);
    if (typeof window !== "undefined") {
      if (trimmed) {
        sessionStorage.setItem("studyarc_gemini_api_key", trimmed);
      } else {
        sessionStorage.removeItem("studyarc_gemini_api_key");
        sessionStorage.removeItem("examforge_gemini_api_key");
      }
    }
    if (trimmed) {
      setBannerMessage("✨ Gemini API Key saved successfully. Ready to generate revision materials!");
    }
  };

  const handleGenerate = async (
    content: string,
    mode?: SubjectMode,
    difficulty?: DifficultyLevel
  ) => {
    setIsLoading(true);
    setBannerMessage(null);

    const activeMode = mode || subjectMode;
    const activeDifficulty = difficulty || difficultyLevel;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          subjectMode: activeMode,
          difficulty: activeDifficulty,
          apiKey: apiKey.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Generation failed");
      }

      setData(json.data || json);
      if (json.message) {
        setBannerMessage(json.message);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error(err);
      setBannerMessage(err.message || "An error occurred while generating study materials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setBannerMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const inputScrollTilt = Math.min(Math.max(scrollY * 0.008, 0), 3.5);
  const inputScrollScale = Math.max(1 - scrollY * 0.0001, 0.988);
  const outputScrollTilt = Math.max(0, 2.5 - scrollY * 0.006);

  return (
    <main className="w-full max-w-full overflow-x-hidden min-h-screen bg-[#0a0f1d] bg-gradient-to-b from-[#0a0f1d] via-[#100b24] to-[#1a0a2a] text-[#f1f5f9] flex flex-col font-sans relative selection:bg-purple-500/30 selection:text-purple-200 perspective-viewport">
      {/* Deep-Space Cosmic Background (Twinkling Stars, 3D Drift & Nebula Glow) */}
      <SpaceBackground />

      {/* Deep-Space Constellation & Schematic Overlay */}
      <div className="constellation-overlay" aria-hidden="true" />

      {/* Bokeh Glow Multi-layer Light Orbs */}
      <div className="bokeh-glow-container" aria-hidden="true">
        <div className="bokeh-orb-1" />
        <div className="bokeh-orb-2" />
        <div className="bokeh-orb-3" />
      </div>

      <Header
        hasResults={Boolean(data)}
        subjectMode={subjectMode}
        difficultyLevel={difficultyLevel}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onReset={handleReset}
        hasKey={Boolean(apiKey)}
      />

      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 md:px-8 md:py-12 space-y-6 sm:space-y-8 relative z-10">
        {bannerMessage && (
          <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-xs flex items-center justify-between shadow-lg backdrop-blur-md">
            <span>{bannerMessage}</span>
            <button
              onClick={() => setBannerMessage(null)}
              className="text-indigo-400 hover:text-white underline ml-3"
            >
              Dismiss
            </button>
          </div>
        )}

        {!data && !isLoading && (
          <div
            className="scroll-depth-card"
            style={{
              transform: `perspective(1000px) rotateX(${inputScrollTilt}deg) scale(${inputScrollScale})`,
            }}
          >
            <InputStudio
              subjectMode={subjectMode}
              setSubjectMode={setSubjectMode}
              difficultyLevel={difficultyLevel}
              setDifficultyLevel={setDifficultyLevel}
              onGenerate={handleGenerate}
              onSubmit={(content) => handleGenerate(content, subjectMode, difficultyLevel)}
              isLoading={isLoading}
            />
          </div>
        )}

        {isLoading && <LoadingSkeleton />}

        {data && !isLoading && (
          <div
            className="space-y-8 animate-in fade-in duration-300 scroll-depth-card"
            style={{
              transform: `perspective(1200px) rotateX(${outputScrollTilt}deg)`,
            }}
          >
            {/* Topic & View Mode Switcher Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl spatial-glass-pane no-print">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-xl glass-btn-tactile text-slate-200 hover:text-white"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Analyze Another</span>
                  </button>
                  <span className="inline-flex items-center space-x-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-0.5 text-xs font-mono font-medium text-indigo-300">
                    <Clock className="h-3 w-3 text-indigo-400" />
                    <span>{data.read_time_minutes || data.readTimeMinutes || 5} min read</span>
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white font-display">
                  {data.topic || "Analysis Complete"}
                </h2>
              </div>

              {/* View Layout Controls */}
              <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10 w-full sm:w-auto justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => setWorkspaceLayout("split")}
                  className={`flex items-center justify-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    workspaceLayout === "split"
                      ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Columns className="h-3.5 w-3.5" />
                  <span>Split View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWorkspaceLayout("revision")}
                  className={`flex items-center justify-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    workspaceLayout === "revision"
                      ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Revision Pack</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWorkspaceLayout("quiz")}
                  className={`flex items-center justify-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    workspaceLayout === "quiz"
                      ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Active Recall Quiz</span>
                </button>
              </div>
            </div>

            {/* Layout Rendering */}
            {workspaceLayout === "split" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-8">
                  <RevisionPack data={data} />
                </div>
                <div className="lg:col-span-5 lg:sticky lg:top-24">
                  <ActiveRecallQuiz
                    questions={data.practice_quiz || data.practiceQuiz || []}
                    quiz={data.practice_quiz || data.practiceQuiz || []}
                    traps={data.trapsAndGotchas || data.traps_and_gotchas || []}
                    topic={data.topic}
                  />
                </div>
              </div>
            )}

            {workspaceLayout === "revision" && (
              <div className="max-w-4xl mx-auto">
                <RevisionPack data={data} />
              </div>
            )}

            {workspaceLayout === "quiz" && (
              <div className="max-w-2xl mx-auto">
                <ActiveRecallQuiz
                  questions={data.practice_quiz || data.practiceQuiz || []}
                  quiz={data.practice_quiz || data.practiceQuiz || []}
                  traps={data.trapsAndGotchas || data.traps_and_gotchas || []}
                  topic={data.topic}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        apiKey={apiKey}
        onSave={handleSaveApiKey}
        onSaveKey={handleSaveApiKey}
      />
    </main>
  );
}