"use client";

import React from "react";
import { Check, Copy, Eye, RotateCw } from "lucide-react";
import MathRenderer from "./MathRenderer";

export interface FlashcardProps {
  idx: number;
  term: string;
  definition: string;
  isFlipped: boolean;
  isCopied: boolean;
  appExample?: string | null;
  onToggle: (idx: number) => void;
  onCopy: (idx: number, term: string, definition: string, e: React.MouseEvent) => void;
  academicIcon: React.ReactNode;
}

/**
 * Tangible 3D Flippable Flashcard Component.
 * Wrapped in React.memo to ensure individual card flips do not trigger re-renders of adjacent cards.
 */
export const Flashcard: React.FC<FlashcardProps> = React.memo(
  ({
    idx,
    term,
    definition,
    isFlipped,
    isCopied,
    appExample,
    onToggle,
    onCopy,
    academicIcon,
  }) => {
    return (
      <div
        onClick={() => onToggle(idx)}
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
                  {academicIcon}
                </div>
                <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[11px] font-mono font-semibold text-indigo-300">
                  Card #{idx + 1}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => onCopy(idx, term, definition, e)}
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
                <MathRenderer text={term} />
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
                  <MathRenderer text={term} />
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => onCopy(idx, term, definition, e)}
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
                <MathRenderer text={definition} />
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
  }
);

Flashcard.displayName = "Flashcard";

export default Flashcard;
