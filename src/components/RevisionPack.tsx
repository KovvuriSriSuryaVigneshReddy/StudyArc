"use client";

import React, { useState } from "react";
import {
  BookOpen,
  CheckSquare,
  Square,
  Sparkles,
  Download,
  Printer,
  Copy,
  Check,
  Clock,
  RotateCw,
  Eye,
  Layers,
  FileText,
} from "lucide-react";
import { StudyStudioData } from "@/types";
import TrapRadar from "./TrapRadar";
import MathRenderer from "./MathRenderer";

interface RevisionPackProps {
  data: StudyStudioData;
}

export const RevisionPack: React.FC<RevisionPackProps> = ({ data }) => {
  // Checkbox state for high-yield takeaways
  const [checkedTakeaways, setCheckedTakeaways] = useState<Record<number, boolean>>({});
  // Flashcard flip states: cardIndex -> isFlipped
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [allFlipped, setAllFlipped] = useState(false);
  // Copy notification states
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedCardIndex, setCopiedCardIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedAnki, setCopiedAnki] = useState(false);
  const [copiedNotion, setCopiedNotion] = useState(false);
  const [copiedPrint, setCopiedPrint] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);

  // Toggle single takeaway
  const toggleTakeaway = (idx: number) => {
    setCheckedTakeaways((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const takeaways = data.high_yield_takeaways || data.highYieldTakeaways || [];
  const formulas = data.key_formulas_or_definitions || data.keyFormulasOrDefinitions || [];
  const summary = data.executive_summary || data.executiveSummary || "";
  const topic = data.topic || "Revision Materials";
  const readTime = data.read_time_minutes || data.readTimeMinutes || 5;

  const masteredCount = Object.values(checkedTakeaways).filter(Boolean).length;
  const totalTakeaways = takeaways.length;
  const progressPercent = totalTakeaways > 0 ? Math.round((masteredCount / totalTakeaways) * 100) : 0;

  // Toggle flashcard flip
  const toggleCard = (idx: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Flip all cards at once
  const handleToggleFlipAll = () => {
    const nextState = !allFlipped;
    setAllFlipped(nextState);
    const newFlips: Record<number, boolean> = {};
    formulas.forEach((_, idx) => {
      newFlips[idx] = nextState;
    });
    setFlippedCards(newFlips);
  };

  // Universal clipboard writer with fallback for all browser contexts
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      console.warn("navigator.clipboard failed, attempting fallback:", err);
    }

    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      textArea.setAttribute("readonly", "");
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    } catch (fallbackErr) {
      console.error("document.execCommand fallback also failed:", fallbackErr);
      return false;
    }
  };

  // Copy executive summary
  const copySummary = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    await copyToClipboard(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // Copy single card
  const copyCard = async (idx: number, term: string, definition: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await copyToClipboard(`${term}\n${definition}`);
    setCopiedCardIndex(idx);
    setTimeout(() => setCopiedCardIndex(null), 1800);
  };

  // 1. Export to Anki (CSV) — Downloads StudyArc_Anki_Cards.csv
  const handleExportAnki = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const quizQuestions = data.practice_quiz || data.practiceQuiz || [];
    const trapItems = data.trapsAndGotchas || data.traps_and_gotchas || [];

    const lines: string[] = [
      "#separator:Tab",
      "#html:true",
      "#tags:StudyArc Anki Deck",
    ];

    // Key Formulas & Definitions
    formulas.forEach((item) => {
      const front = item.term.replace(/\t/g, " ").replace(/\n/g, "<br>");
      const back = item.definition.replace(/\t/g, " ").replace(/\n/g, "<br>");
      lines.push(`${front}\t${back}`);
    });

    // High-Yield Takeaways
    takeaways.forEach((pt, idx) => {
      lines.push(`Takeaway #${idx + 1}\t${pt.replace(/\t/g, " ")}`);
    });

    // Professor's Traps
    trapItems.forEach((t) => {
      const front = `⚠️ Exam Trap: ${t.concept.replace(/\t/g, " ")}`;
      const back = `🚨 <b>Common Distractor:</b> ${t.commonTrap || t.common_trap || ""}<br><br>🛡️ <b>Pro-Tip:</b> ${t.proTip || t.pro_tip || ""}`.replace(/\t/g, " ");
      lines.push(`${front}\t${back}`);
    });

    // Practice Quiz
    quizQuestions.forEach((q) => {
      const correctOpt = q.options ? q.options[q.correct_index ?? q.correctIndex ?? 0] : "";
      const front = `<b>Exam Question:</b> ${q.question.replace(/\t/g, " ")}`;
      const back = `<b>Correct Answer:</b> ${correctOpt}<br><br><b>Pedagogical Insight:</b> ${q.explanation.replace(/\t/g, " ")}`;
      lines.push(`${front}\t${back}`);
    });

    const csvContent = lines.join("\n");
    const blob = new Blob([csvContent], { type: "text/tab-separated-values;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "StudyArc_Anki_Cards.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCopiedAnki(true);
    setTimeout(() => setCopiedAnki(false), 2000);
  };

  // 2. Copy Notion Template (Markdown Toggle Blocks)
  const handleCopyNotion = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const quizQuestions = data.practice_quiz || data.practiceQuiz || [];
    const trapItems = data.trapsAndGotchas || data.traps_and_gotchas || [];

    let notionMd = `# 📚 ${topic} — StudyArc.ai Notion Study Guide\n*Estimated Read Time: ${readTime} min*\n\n`;

    notionMd += `> ### 💡 Executive Summary\n> ${summary.replace(/\n\n/g, "\n>\n> ")}\n\n`;

    notionMd += `> ### ⚡ High-Yield Takeaways\n`;
    takeaways.forEach((pt) => {
      notionMd += `> - [ ] ${pt}\n`;
    });
    notionMd += `\n`;

    if (trapItems.length > 0) {
      notionMd += `> ### ⚠️ Professor's Trap Radar (Exam Gotchas)\n`;
      trapItems.forEach((t) => {
        notionMd += `> - **${t.concept}**\n>   - 🚨 *Common Trap:* ${t.commonTrap || t.common_trap}\n>   - 🛡️ *Pro-Tip:* ${t.proTip || t.pro_tip}\n`;
      });
      notionMd += `\n`;
    }

    if (formulas.length > 0) {
      notionMd += `> ### 🗂️ Flashcards & Core Definitions\n`;
      formulas.forEach((item) => {
        notionMd += `> ### ${item.term}\n> ${item.definition}\n>\n`;
      });
      notionMd += `\n`;
    }

    if (quizQuestions.length > 0) {
      notionMd += `> ### ❓ Practice Quiz Questions\n`;
      quizQuestions.forEach((q, idx) => {
        const correctOpt = q.options ? q.options[q.correct_index ?? q.correctIndex ?? 0] : "";
        notionMd += `> - **Q${idx + 1}: ${q.question}**\n>   - Options: ${q.options.join(" | ")}\n>   - *Correct:* ${correctOpt}\n>   - *Pedagogical Insight:* ${q.explanation}\n`;
      });
    }

    await copyToClipboard(notionMd);
    setCopiedNotion(true);
    setTimeout(() => setCopiedNotion(false), 2000);
  };

  // 3. Copy All (Entire study payload)
  const handleCopyAll = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const quizQuestions = data.practice_quiz || data.practiceQuiz || [];
    const trapItems = data.trapsAndGotchas || data.traps_and_gotchas || [];

    const fullPayload = `STUDYARC.AI REVISION GUIDE: ${topic}
Estimated Read Time: ${readTime} minutes

==================================================
EXECUTIVE SUMMARY
==================================================
${summary}

==================================================
HIGH-YIELD TAKEAWAYS
==================================================
${takeaways.map((t, idx) => `${idx + 1}. ${t}`).join("\n")}

==================================================
PROFESSOR'S TRAP RADAR (EXAM GOTCHAS)
==================================================
${trapItems.map((trap, idx) => `${idx + 1}. ${trap.concept}\n   Common Trap: ${trap.commonTrap || trap.common_trap}\n   Pro-Tip: ${trap.proTip || trap.pro_tip}`).join("\n\n")}

==================================================
KEY FORMULAS & DEFINITIONS
==================================================
${formulas.map((f, idx) => `${idx + 1}. ${f.term}: ${f.definition}`).join("\n\n")}

==================================================
PRACTICE QUIZ
==================================================
${quizQuestions.map((q, idx) => `Q${idx + 1}: ${q.question}\nOptions:\n${q.options.map((opt, i) => `  ${String.fromCharCode(65 + i)}. ${opt}`).join("\n")}\nCorrect: ${q.options[q.correct_index ?? q.correctIndex ?? 0]}\nExplanation: ${q.explanation}`).join("\n\n")}
`;

    await copyToClipboard(fullPayload);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // 4. Print Sheet
  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCopiedPrint(true);
    setTimeout(() => setCopiedPrint(false), 2000);
    window.print();
  };

  // 5. Generate and download Markdown (.md)
  const handleExportMarkdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const quizQuestions = data.practice_quiz || data.practiceQuiz || [];
    const mdContent = `# ${topic}
*Estimated Read Time: ${readTime} minutes*
*Generated by StudyArc.ai: AI Student Revision Studio*

---

## Executive Summary
${summary}

---

## High-Yield Takeaways
${takeaways.map((point) => `- [ ] ${point}`).join("\n")}

---

## Key Formulas & Core Definitions
${formulas
  .map((item, idx) => `### ${idx + 1}. ${item.term}\n${item.definition}\n`)
  .join("\n")}

---

## Practice Quiz & Active Recall
${quizQuestions
  .map(
    (q, idx) => `### Question ${idx + 1}
**${q.question}**

${q.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join("\n")}

*Correct Answer: Option ${String.fromCharCode(65 + (q.correct_index ?? q.correctIndex ?? 0))}*
*Explanation:* ${q.explanation}
`
  )
  .join("\n---\n")}
`;

    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeTopicName = (topic || "lecture").toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 30);
    link.download = `StudyArc_${safeTopicName}_Revision_Pack.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  // Helper to generate contextual application example for formulas/concepts
  const getApplicationExample = (term: string, definition: string) => {
    // If definition already has example or e.g., extract or highlight
    if (definition.toLowerCase().includes("example:") || definition.toLowerCase().includes("e.g.")) {
      return null;
    }
    // Contextual academic derivation/application cues
    return `In exam scenarios, apply to compute output states or analyze edge-case constraints for ${term}.`;
  };

  const getAcademicIcon = (index: number) => {
    const icons = [Sparkles, Layers, BookOpen, Clock];
    const IconComp = icons[index % icons.length];
    return <IconComp className="h-5 w-5 text-cyan-400" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Sleek Spatial Glass Action Bar for Revision Pack */}
      <div
        className="relative z-30 pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl spatial-glass-pane p-4 no-print"
        style={{ pointerEvents: "auto" }}
      >
        <div className="flex items-center space-x-2.5 self-start sm:self-center">
          <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse shadow-md shadow-cyan-400/60" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display">
            Spatial Revision Studio
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-400 font-mono">
            {totalTakeaways} Takeaways • {formulas.length} 3D Cards
          </span>
        </div>

        <div
          className="relative z-40 pointer-events-auto flex flex-wrap items-center justify-center sm:justify-start gap-2 w-full sm:w-auto"
          style={{ pointerEvents: "auto" }}
        >
          {/* Export to Anki (CSV) */}
          <button
            type="button"
            onClick={handleExportAnki}
            style={{ pointerEvents: "auto", cursor: "pointer" }}
            className={`relative z-40 pointer-events-auto inline-flex items-center space-x-1.5 rounded-xl px-2.5 py-1 text-[11px] sm:text-xs sm:px-3.5 sm:py-1.5 font-semibold transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
              copiedAnki
                ? "bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400/50"
                : "glass-btn-tactile text-slate-300 hover:text-white hover:border-cyan-500/50"
            }`}
            title="Export flashcards and quiz as Anki-compatible CSV"
          >
            {copiedAnki ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span className="text-emerald-300 font-bold">Downloaded!</span>
              </>
            ) : (
              <>
                <Layers className="h-3.5 w-3.5 text-cyan-400" />
                <span>Export to Anki (CSV)</span>
              </>
            )}
          </button>

          {/* Copy Notion Template */}
          <button
            type="button"
            onClick={handleCopyNotion}
            style={{ pointerEvents: "auto", cursor: "pointer" }}
            className={`relative z-40 pointer-events-auto inline-flex items-center space-x-1.5 rounded-xl px-2.5 py-1 text-[11px] sm:text-xs sm:px-3.5 sm:py-1.5 font-semibold transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
              copiedNotion
                ? "bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400/50"
                : "glass-btn-tactile text-slate-300 hover:text-white hover:border-purple-500/50"
            }`}
            title="Copy Notion toggle-block markdown template"
          >
            {copiedNotion ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span className="text-emerald-300 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <FileText className="h-3.5 w-3.5 text-purple-400" />
                <span>Copy Notion Template</span>
              </>
            )}
          </button>

          {/* Copy All Button */}
          <button
            type="button"
            onClick={handleCopyAll}
            style={{ pointerEvents: "auto", cursor: "pointer" }}
            className={`relative z-40 pointer-events-auto inline-flex items-center space-x-1.5 rounded-xl px-2.5 py-1 text-[11px] sm:text-xs sm:px-3.5 sm:py-1.5 font-medium transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
              copiedAll
                ? "bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400/50"
                : "glass-btn-tactile text-slate-300 hover:text-white"
            }`}
            title="Copy Revision Pack text to clipboard"
          >
            {copiedAll ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span className="text-emerald-300 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>Copy All</span>
              </>
            )}
          </button>

          {/* Printable Sheet */}
          <button
            type="button"
            onClick={handlePrint}
            style={{ pointerEvents: "auto", cursor: "pointer" }}
            className={`relative z-40 pointer-events-auto inline-flex items-center space-x-1.5 rounded-xl px-2.5 py-1 text-[11px] sm:text-xs sm:px-3.5 sm:py-1.5 font-medium transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
              copiedPrint
                ? "bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400/50"
                : "glass-btn-tactile text-slate-300 hover:text-white"
            }`}
            title="Print or Save as PDF"
          >
            {copiedPrint ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span className="text-emerald-300 font-bold">Printed!</span>
              </>
            ) : (
              <>
                <Printer className="h-3.5 w-3.5 text-slate-400" />
                <span>Print Sheet</span>
              </>
            )}
          </button>

          {/* Prominent Export Guide Button */}
          <button
            type="button"
            onClick={handleExportMarkdown}
            style={{ pointerEvents: "auto", cursor: "pointer" }}
            className={`relative z-40 pointer-events-auto inline-flex items-center space-x-1.5 rounded-xl px-2.5 py-1 text-[11px] sm:text-xs sm:px-3.5 sm:py-1.5 font-bold tracking-wide text-white shadow-lg transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
              copiedMd
                ? "bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400/50"
                : "glass-btn-hero hover:brightness-110"
            }`}
            title="Download formatted Study Guide Markdown file"
          >
            {copiedMd ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span className="text-emerald-300 font-bold">Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5 text-cyan-200" />
                <span>Export Guide</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Section 1: Executive Summary */}
      <section className="relative rounded-2xl spatial-glass-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 shadow-md shadow-indigo-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight font-display">Executive Summary</h2>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-slate-500" />
                  <span>{readTime} min read</span>
                </span>
                <span>•</span>
                <span className="text-cyan-400 font-medium truncate max-w-xs">{topic}</span>
              </div>
            </div>
          </div>

          <button
            onClick={copySummary}
            className="no-print rounded-xl border border-white/10 bg-slate-900/80 p-2 text-slate-400 hover:border-cyan-500/40 hover:text-white transition-all duration-300 ease-in-out active:scale-95 shadow-sm"
            title="Copy Executive Summary"
          >
            {copiedSummary ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        {/* Dense 2-paragraph blockquote */}
        <blockquote className="relative rounded-xl border-l-4 border-indigo-500 bg-indigo-950/25 px-5 py-4 text-sm leading-relaxed text-slate-200 shadow-inner">
          {summary.split("\n\n").map((para, pIdx) => (
            <p key={pIdx} className={pIdx > 0 ? "mt-3" : ""}>
              <MathRenderer text={para} />
            </p>
          ))}
        </blockquote>
      </section>

      {/* Professor's Trap Radar (Exam Gotcha Warnings) */}
      <TrapRadar traps={data.trapsAndGotchas || data.traps_and_gotchas || []} />

      {/* Section 2: High-Yield Takeaways with Interactive Completion Checkboxes */}
      <section className="rounded-2xl spatial-glass-card p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight font-display">
                High-Yield Takeaways
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Check off core concepts as you master them
              </p>
            </div>
          </div>

          {/* Mastery Progress Indicator */}
          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-300">
                {masteredCount} of {totalTakeaways} Mastered
              </span>
              <span className="text-xs text-cyan-400 font-mono ml-1.5 font-bold">({progressPercent}%)</span>
            </div>
            <div className="h-2.5 w-24 overflow-hidden rounded-full bg-slate-800 ring-1 ring-white/10">
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  progressPercent === 100
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/60"
                    : "bg-gradient-to-r from-cyan-500 to-indigo-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-2.5">
          {takeaways.map((takeaway, idx) => {
            const isChecked = !!checkedTakeaways[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleTakeaway(idx)}
                className={`group flex items-start space-x-3 rounded-xl border p-3.5 text-sm transition-all duration-300 ease-in-out cursor-pointer ${
                  isChecked
                    ? "border-emerald-500/40 bg-emerald-950/20 text-slate-300"
                    : "border-white/5 bg-slate-950/40 text-slate-200 hover:border-indigo-500/40 hover:bg-slate-900/60"
                }`}
              >
                <div className="mt-0.5 shrink-0 transition-transform duration-300 group-hover:scale-110">
                  {isChecked ? (
                    <CheckSquare className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Square className="h-5 w-5 text-slate-500 group-hover:text-cyan-400" />
                  )}
                </div>
                <div className="flex-1">
                  <span
                    className={`transition-all duration-300 leading-relaxed ${
                      isChecked ? "text-slate-400 line-through decoration-emerald-500/60" : "text-slate-100"
                    }`}
                  >
                    <MathRenderer text={takeaway} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 3: 3D Flippable Formulas & Core Definition Cards */}
      <section className="rounded-2xl spatial-glass-card p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 shadow-md shadow-purple-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight font-display">
                Formulas & Core Definitions
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Interactive 3D Cards • Tap or hover to flip 180°
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 no-print">
            <button
              onClick={handleToggleFlipAll}
              className="inline-flex items-center space-x-1.5 rounded-xl glass-btn-tactile px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition-all duration-300 ease-in-out hover:text-white"
            >
              <RotateCw className="h-3.5 w-3.5 text-cyan-400" />
              <span>{allFlipped ? "Flip to Terms" : "Flip All to Definitions"}</span>
            </button>
          </div>
        </div>

        {/* 3D Flashcard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {formulas.map((item, idx) => {
            const isFlipped = !!flippedCards[idx];
            const isCopied = copiedCardIndex === idx;
            const appExample = getApplicationExample(item.term, item.definition);

            return (
              <div
                key={idx}
                onClick={() => toggleCard(idx)}
                className="group relative min-h-[190px] sm:min-h-[220px] h-[220px] sm:h-[240px] cursor-pointer perspective-1200 select-none"
              >
                <div
                  className={`relative h-full w-full rounded-2xl transition-transform duration-500 transform-style-preserve-3d shadow-xl ${
                    isFlipped ? "rotate-y-180" : "group-hover:-translate-y-1"
                  }`}
                >
                  {/* FRONT: Academic Icon, Term / Formula Name */}
                  <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-[#101528] p-4 sm:p-5 backface-hidden group-hover:border-cyan-400/60 group-hover:shadow-xl group-hover:shadow-cyan-500/15 transition-all duration-300 ease-in-out">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
                          {getAcademicIcon(idx)}
                        </div>
                        <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[11px] font-mono font-semibold text-indigo-300">
                          Card #{idx + 1}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => copyCard(idx, item.term, item.definition, e)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-cyan-300 no-print transition-colors duration-200"
                        title="Copy formula/term"
                      >
                        {isCopied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="my-auto text-center px-2 py-2">
                      <h3 className="text-sm sm:text-base font-bold text-white font-mono tracking-tight group-hover:text-cyan-300 transition-colors duration-300 line-clamp-3">
                        <MathRenderer text={item.term} />
                      </h3>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
                      <span className="inline-flex items-center space-x-1.5 text-[10px] sm:text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors">
                        <Eye className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Tap or hover to flip</span>
                      </span>
                      <RotateCw className="h-3.5 w-3.5 text-slate-500 transition-transform group-hover:rotate-180 duration-500" />
                    </div>
                  </div>

                  {/* BACK: Detailed Definition & Explicit Application Example */}
                  <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-indigo-500/50 bg-gradient-to-br from-[#0c1224] to-[#150e28] p-4 sm:p-5 rotate-y-180 backface-hidden shadow-2xl shadow-indigo-950/60">
                    <div className="flex items-start justify-between border-b border-white/10 pb-1.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                        <span className="text-xs font-mono font-bold text-cyan-300 line-clamp-1">
                          <MathRenderer text={item.term} />
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => copyCard(idx, item.term, item.definition, e)}
                        className="rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-200 no-print transition-colors duration-200"
                      >
                        {isCopied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="my-auto overflow-y-auto max-h-28 sm:max-h-32 pr-1 py-1 space-y-1.5">
                      <div className="text-[11px] sm:text-xs leading-relaxed text-slate-200 font-sans">
                        <MathRenderer text={item.definition} />
                      </div>
                      {appExample && (
                        <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/30 p-2 text-[10px] sm:text-[11px] text-cyan-200/90 font-sans">
                          <span className="font-bold text-cyan-300 uppercase tracking-wider text-[9px] block mb-0.5">
                            Application Example:
                          </span>
                          <MathRenderer text={appExample} />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 pt-1.5 border-t border-white/10">
                      <span>Click to flip back</span>
                      <RotateCw className="h-3.5 w-3.5 text-cyan-400" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default RevisionPack;
