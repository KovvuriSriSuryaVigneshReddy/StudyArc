"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Brain, BookOpen, Layers, CheckCircle2 } from "lucide-react";

const STAGES = [
  { label: "Parsing lecture materials & tokenizing...", icon: BookOpen },
  { label: "Extracting foundational formulas & key concepts...", icon: Layers },
  { label: "Synthesizing executive summary & high-yield takeaways...", icon: Brain },
  { label: "Constructing active-recall practice quiz with explanations...", icon: Sparkles },
];

export const LoadingSkeleton: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 1100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6 md:px-8 animate-in fade-in duration-300">
      {/* Studio Header Processing Card */}
      <div className="mb-8 rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/25 via-slate-900/70 to-slate-950 p-5 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
                <Brain className="h-6 w-6 animate-pulse text-indigo-400" />
                <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 animate-ping" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2 font-display">
                  <span>Forging Revision Studio</span>
                  <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
                </h3>
                <p className="text-sm text-slate-400 font-sans">
                  Google Gemini AI is synthesizing your lecture content...
                </p>
              </div>
            </div>

            <div className="inline-flex items-center space-x-2 self-start rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
              <span>Step {currentStage + 1} of {STAGES.length}</span>
            </div>
          </div>

          {/* Dynamic Stage Indicator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isCompleted = idx < currentStage;
              const isCurrent = idx === currentStage;
              return (
                <div
                  key={idx}
                  className={`flex items-center space-x-3 rounded-xl border p-3 text-xs transition-all duration-300 ${
                    isCurrent
                      ? "border-indigo-500/60 bg-indigo-500/15 text-indigo-200 shadow-md shadow-indigo-500/10"
                      : isCompleted
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-slate-800/80 bg-slate-900/40 text-slate-500"
                  }`}
                >
                  <div className="shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Icon className={`h-4 w-4 ${isCurrent ? "text-indigo-400 animate-bounce" : "text-slate-500"}`} />
                    )}
                  </div>
                  <span className="font-medium line-clamp-1">{stage.label}</span>
                </div>
              );
            })}
          </div>

          {/* Shimmering Progress Bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 transition-all duration-700 ease-out"
              style={{ width: `${((currentStage + 1) / STAGES.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dual Pane Mock Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Pane A Skeleton: Revision Pack */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl linear-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-48 rounded-lg bg-slate-800/80 animate-pulse" />
              <div className="h-5 w-24 rounded-full bg-slate-800/80 animate-pulse" />
            </div>
            <div className="h-4 w-full rounded bg-slate-800/60 animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-slate-800/60 animate-pulse" />
            <div className="h-4 w-4/6 rounded bg-slate-800/60 animate-pulse" />
          </div>

          <div className="rounded-2xl linear-card p-6 space-y-3">
            <div className="h-5 w-40 rounded bg-slate-800/80 animate-pulse mb-3" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-5 w-5 rounded bg-slate-800 animate-pulse shrink-0" />
                <div className="h-4 w-full rounded bg-slate-800/60 animate-pulse" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 rounded-2xl linear-card p-4 space-y-2"
              >
                <div className="h-4 w-24 rounded bg-slate-800 animate-pulse" />
                <div className="h-3 w-full rounded bg-slate-800/50 animate-pulse" />
                <div className="h-3 w-4/5 rounded bg-slate-800/50 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Pane B Skeleton: Active Recall Quiz */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl linear-card p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="h-5 w-32 rounded bg-slate-800/80 animate-pulse" />
              <div className="h-4 w-16 rounded bg-slate-800/60 animate-pulse" />
            </div>
            <div className="h-12 w-full rounded-xl bg-slate-800/50 animate-pulse" />
            <div className="space-y-2.5 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-11 w-full rounded-xl border border-slate-800/60 bg-slate-850/50 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
