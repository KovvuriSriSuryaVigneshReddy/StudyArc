"use client";

import React from "react";
import { Key, RotateCcw, GraduationCap, Flame } from "lucide-react";
import { SubjectMode, DifficultyLevel } from "@/types";

interface HeaderProps {
  hasResults?: boolean;
  subjectMode?: SubjectMode;
  difficultyLevel?: DifficultyLevel;
  hasCustomKey?: boolean;
  hasKey?: boolean;
  onOpenKeyModal: () => void;
  onReset?: () => void;
  isMockEngine?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  hasResults = false,
  subjectMode = "stem",
  difficultyLevel = "quick_cram",
  hasCustomKey: customKeyProp,
  hasKey,
  onOpenKeyModal,
  onReset,
}) => {
  const hasCustomKey = customKeyProp !== undefined ? customKeyProp : Boolean(hasKey);
  return (
    <header className="sticky top-0 z-40 w-full linear-glass-nav backdrop-blur-xl transition-all duration-300 ease-in-out">
      <div className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 py-3 sm:py-0 sm:h-16 max-w-6xl px-4 sm:px-6 md:px-8 w-full">
        {/* Brand & Tagline */}
        <div
          onClick={onReset}
          className={`flex items-center justify-between sm:justify-start w-full sm:w-auto space-x-3 ${onReset && hasResults ? "cursor-pointer group" : ""}`}
        >
          <div className="flex items-center space-x-3">
            <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 shadow-md shadow-indigo-500/30 ring-1 ring-white/20 transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-cyan-500/40">
              <Flame className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-white" />
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-purple-400 to-cyan-400 opacity-30 blur-sm pointer-events-none" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-display">StudyArc.ai</span>
                <span className="rounded-md border border-indigo-500/40 bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-mono font-semibold tracking-wider text-indigo-300 shadow-sm shadow-indigo-500/20">
                  STUDIO
                </span>
              </div>
              <p className="hidden text-xs text-slate-400 sm:block font-sans">
                AI Student Revision Studio • Developed by SriSuryaVigneshReddy
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Context Badges (When Results are Active) */}
        {hasResults && (
          <div className="hidden items-center space-x-2.5 md:flex">
            <div className="flex items-center space-x-1.5 rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-xs text-slate-300 backdrop-blur-md shadow-sm">
              <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
              <span className="font-medium">
                {subjectMode === "stem" ? "STEM Mode" : "Humanities Mode"}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-xs text-slate-300 backdrop-blur-md shadow-sm">
              <span
                className={`h-2 w-2 rounded-full ${
                  difficultyLevel === "deep_mastery" ? "bg-amber-400 shadow-sm shadow-amber-400/60" : "bg-emerald-400 shadow-sm shadow-emerald-400/60"
                }`}
              />
              <span className="font-medium">
                {difficultyLevel === "deep_mastery" ? "Deep Mastery" : "Quick Cram"}
              </span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
          {/* API Key / Engine Status */}
          <button
            type="button"
            onClick={onOpenKeyModal}
            className={`group relative flex items-center space-x-2 rounded-xl px-3 py-1.5 text-[11px] sm:text-xs font-semibold transition-all duration-300 ease-in-out active:scale-[0.98] ${
              hasCustomKey
                ? "border border-emerald-500/50 bg-emerald-950/40 text-emerald-300 hover:border-emerald-400/80 shadow-md shadow-emerald-500/20"
                : "border border-amber-500/50 bg-amber-950/40 text-amber-300 hover:border-amber-400/80 shadow-md shadow-amber-500/20 animate-pulse"
            }`}
            title={hasCustomKey ? "Gemini Key Active • Click to view or edit" : "Configure Gemini API Key"}
          >
            {hasCustomKey ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                <span>Gemini Key Active</span>
              </>
            ) : (
              <>
                <span className="text-amber-400 text-xs">⚠️</span>
                <span>Configure Gemini Key</span>
              </>
            )}
          </button>

          {/* Reset button when viewing study pack */}
          {hasResults && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center space-x-1.5 rounded-xl glass-btn-tactile px-2.5 py-1 text-[11px] sm:text-xs sm:px-3.5 sm:py-1.5 font-medium text-slate-200 transition-all duration-300 ease-in-out hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-400" />
              <span>New Material</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
