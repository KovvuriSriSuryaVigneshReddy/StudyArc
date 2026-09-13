"use client";

import React, { useState } from "react";
import { Download, FileCode, Copy, Printer, Check } from "lucide-react";
import { StudyStudioData } from "@/types";

export interface ActionDeckProps {
  data: StudyStudioData;
  onExportAnki?: () => void;
  onCopyNotion?: () => void;
  onCopyAll?: () => void;
  onPrint?: () => void;
  onExportMarkdown?: () => void;
  className?: string;
}

/**
 * Generates an Anki-compatible Tab-Separated Value (CSV) string
 * formatted with HTML tags and metadata for flashcard decks.
 */
export function generateAnkiCsv(data: StudyStudioData): string {
  const formulas = data.key_formulas_or_definitions || data.keyFormulasOrDefinitions || [];
  const takeaways = data.high_yield_takeaways || data.highYieldTakeaways || [];
  const quizQuestions = data.practice_quiz || data.practiceQuiz || [];
  const trapItems = data.trapsAndGotchas || data.traps_and_gotchas || [];

  const lines: string[] = [
    "#separator:Tab",
    "#html:true",
    "#tags:StudyArc Anki Deck",
  ];

  // 1. Key Formulas & Definitions
  formulas.forEach((item) => {
    const front = item.term.replace(/\t/g, " ").replace(/\n/g, "<br>");
    const back = item.definition.replace(/\t/g, " ").replace(/\n/g, "<br>");
    lines.push(`${front}\t${back}`);
  });

  // 2. High-Yield Takeaways
  takeaways.forEach((pt, idx) => {
    lines.push(`Takeaway #${idx + 1}\t${pt.replace(/\t/g, " ")}`);
  });

  // 3. Professor's Traps
  trapItems.forEach((t) => {
    const front = `⚠️ Exam Trap: ${t.concept.replace(/\t/g, " ")}`;
    const back = `🚨 <b>Common Distractor:</b> ${t.commonTrap || t.common_trap || ""}<br><br>🛡️ <b>Pro-Tip:</b> ${t.proTip || t.pro_tip || ""}`.replace(/\t/g, " ");
    lines.push(`${front}\t${back}`);
  });

  // 4. Practice Quiz
  quizQuestions.forEach((q) => {
    const correctOpt = q.options ? q.options[q.correct_index ?? q.correctIndex ?? 0] : "";
    const front = `<b>Exam Question:</b> ${q.question.replace(/\t/g, " ")}`;
    const back = `<b>Correct Answer:</b> ${correctOpt}<br><br><b>Pedagogical Insight:</b> ${q.explanation.replace(/\t/g, " ")}`;
    lines.push(`${front}\t${back}`);
  });

  return lines.join("\n");
}

export const ActionDeck: React.FC<ActionDeckProps> = ({
  data,
  onExportAnki,
  onCopyNotion,
  onCopyAll,
  onPrint,
  onExportMarkdown,
  className = "",
}) => {
  const [copiedAnki, setCopiedAnki] = useState(false);
  const [copiedNotion, setCopiedNotion] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedPrint, setCopiedPrint] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);

  const handleAnkiClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onExportAnki) {
      onExportAnki();
    } else {
      const csvContent = generateAnkiCsv(data);
      const blob = new Blob([csvContent], { type: "text/tab-separated-values;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "StudyArc_Anki_Cards.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    setCopiedAnki(true);
    setTimeout(() => setCopiedAnki(false), 2000);
  };

  const handleNotionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onCopyNotion) {
      onCopyNotion();
    }
    setCopiedNotion(true);
    setTimeout(() => setCopiedNotion(false), 2000);
  };

  const handleCopyAllClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onCopyAll) {
      onCopyAll();
    }
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handlePrintClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
    setCopiedPrint(true);
    setTimeout(() => setCopiedPrint(false), 2000);
  };

  const handleMdClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onExportMarkdown) {
      onExportMarkdown();
    }
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <div className={`flex flex-wrap items-center justify-center sm:justify-start gap-2 ${className}`}>
      {/* 1. Export to Anki (CSV) */}
      <button
        type="button"
        onClick={handleAnkiClick}
        className="glass-btn-tactile inline-flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200 transition-all hover:text-white"
        title="Export study cards to Anki (CSV format)"
      >
        {copiedAnki ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-300">Exported!</span>
          </>
        ) : (
          <>
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>Export to Anki (CSV)</span>
          </>
        )}
      </button>

      {/* 2. Copy Notion Template */}
      <button
        type="button"
        onClick={handleNotionClick}
        className="glass-btn-tactile inline-flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200 transition-all hover:text-white"
        title="Copy as Notion toggle blocks markdown"
      >
        {copiedNotion ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-300">Copied Notion!</span>
          </>
        ) : (
          <>
            <FileCode className="h-3.5 w-3.5 text-purple-400" />
            <span>Copy Notion Template</span>
          </>
        )}
      </button>

      {/* 3. Copy All */}
      <button
        type="button"
        onClick={handleCopyAllClick}
        className="glass-btn-tactile inline-flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200 transition-all hover:text-white"
        title="Copy complete study guide payload to clipboard"
      >
        {copiedAll ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-300">All Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-indigo-400" />
            <span>Copy All</span>
          </>
        )}
      </button>

      {/* 4. Print Sheet */}
      <button
        type="button"
        onClick={handlePrintClick}
        className="glass-btn-tactile inline-flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200 transition-all hover:text-white"
        title="Print clean high-yield cheat sheet (Ctrl/Cmd + P)"
      >
        {copiedPrint ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-300">Printing...</span>
          </>
        ) : (
          <>
            <Printer className="h-3.5 w-3.5 text-slate-400" />
            <span>Print Sheet</span>
          </>
        )}
      </button>

      {/* 5. Download Markdown */}
      <button
        type="button"
        onClick={handleMdClick}
        className="glass-btn-hero inline-flex items-center space-x-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold text-white shadow-lg transition-all"
        title="Download formatted Study Guide Markdown file"
      >
        {copiedMd ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span className="text-emerald-300">Downloaded!</span>
          </>
        ) : (
          <>
            <Download className="h-3.5 w-3.5 text-cyan-200" />
            <span>Export Guide</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ActionDeck;
