"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Flame,
  Radio,
  Zap,
} from "lucide-react";
import { ExamTrap } from "@/types";
import MathRenderer from "./MathRenderer";

interface TrapRadarProps {
  traps?: ExamTrap[];
}

export const TrapRadar: React.FC<TrapRadarProps> = ({ traps = [] }) => {
  // Track open accordion indices (default: all open for quick cramming)
  const [openItems, setOpenItems] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    traps.forEach((_, idx) => {
      initial[idx] = true;
    });
    return initial;
  });

  if (!traps || traps.length === 0) {
    return null;
  }

  const toggleItem = (idx: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const toggleAll = () => {
    const allOpen = traps.every((_, idx) => openItems[idx]);
    const nextState: Record<number, boolean> = {};
    traps.forEach((_, idx) => {
      nextState[idx] = !allOpen;
    });
    setOpenItems(nextState);
  };

  const allOpen = traps.every((_, idx) => openItems[idx]);

  return (
    <section className="relative rounded-2xl spatial-glass-card p-6 shadow-2xl border border-amber-500/30 hover:border-rose-500/50 transition-all duration-300 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center space-x-3.5">
          {/* Radar Icon with Pulsing Ping Animation */}
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-purple-600/20 border border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/20">
            <Radio className="h-5 w-5 text-amber-300 animate-pulse" />
            {/* Pulsing radar ping wave */}
            <span className="absolute -inset-1 rounded-xl border border-amber-400/40 animate-ping opacity-30 pointer-events-none" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight font-display">
                Professor&apos;s Trap Radar
              </h2>
              <span className="inline-flex items-center space-x-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-rose-300">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                <span>{traps.length} Gotchas</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Exam Gotcha Warnings • Common Distractors &amp; Mark Savers
            </p>
          </div>
        </div>

        {/* Toggle Expand/Collapse All */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={toggleAll}
            className="inline-flex items-center space-x-1.5 rounded-xl glass-btn-tactile px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-all duration-200 cursor-pointer"
          >
            <span>{allOpen ? "Collapse All" : "Expand All"}</span>
          </button>
        </div>
      </div>

      {/* Traps Accordion List */}
      <div className="space-y-3.5">
        {traps.map((trap, idx) => {
          const isOpen = !!openItems[idx];
          const commonTrap = trap.commonTrap || trap.common_trap || "";
          const proTip = trap.proTip || trap.pro_tip || "";

          return (
            <div
              key={idx}
              className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? "border-amber-500/40 bg-slate-950/70 shadow-lg shadow-amber-950/30"
                  : "border-white/5 bg-slate-950/40 hover:border-amber-500/25 hover:bg-slate-900/50"
              }`}
            >
              {/* Accordion Trigger Header */}
              <button
                type="button"
                onClick={() => toggleItem(idx)}
                className="w-full flex items-center justify-between p-4 text-left cursor-pointer transition-colors"
                aria-expanded={isOpen}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-slate-100 font-display hover:text-white truncate block">
                      <MathRenderer text={trap.concept} />
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 ml-3">
                  <span className="hidden sm:inline-flex items-center space-x-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="h-3 w-3 text-amber-400" />
                    <span>Trap Warning</span>
                  </span>
                  <div
                    className={`p-1 text-slate-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-amber-300" : ""
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </button>

              {/* Accordion Body */}
              {isOpen && (
                <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/5 animate-in fade-in slide-in-from-top-1 duration-200">
                  {/* The Trap / Distractor */}
                  <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3.5 text-xs text-rose-200">
                    <div className="flex items-start space-x-2.5">
                      <div className="p-1 rounded-md bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
                        <Flame className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-rose-300 uppercase tracking-wider text-[10px] font-mono block mb-1">
                          The Professor&apos;s Trap / Common Distractor:
                        </span>
                        <div className="leading-relaxed text-slate-200 font-sans">
                          <MathRenderer text={commonTrap} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pro-Tip / Point Saver */}
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 text-xs text-emerald-200">
                    <div className="flex items-start space-x-2.5">
                      <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-emerald-300 uppercase tracking-wider text-[10px] font-mono block mb-1">
                          Pro-Tip / How to Secure Full Marks:
                        </span>
                        <div className="leading-relaxed text-slate-200 font-sans">
                          <MathRenderer text={proTip} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TrapRadar;
