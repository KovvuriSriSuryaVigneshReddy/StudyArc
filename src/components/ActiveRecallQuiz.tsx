"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Award,
  AlertTriangle,
  Lightbulb,
  Mic,
} from "lucide-react";
import { QuizQuestion, ExamTrap } from "@/types";
import OralVivaExam from "./OralVivaExam";
import MathRenderer from "./MathRenderer";

interface ActiveRecallQuizProps {
  questions?: QuizQuestion[];
  quiz?: QuizQuestion[];
  traps?: ExamTrap[];
  topic?: string;
}

export const ActiveRecallQuiz: React.FC<ActiveRecallQuizProps> = ({
  questions: questionsProp,
  quiz,
  traps = [],
  topic = "Revision Material",
}) => {
  const [activeQuizTab, setActiveQuizTab] = useState<"mcq" | "viva">("mcq");
  const questions = questionsProp || quiz || [];
  // Current active question index (0-based)
  const [currentIndex, setCurrentIndex] = useState(0);
  // User answers map: questionId -> selectedOptionIndex
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  // Whether question is answered/submitted: questionId -> boolean
  const [revealedQuestions, setRevealedQuestions] = useState<Record<number, boolean>>({});
  // View mode: single question stepper vs all questions list
  const [viewMode, setViewMode] = useState<"stepper" | "all">("stepper");
  // Confetti fired flag
  const [confettiFired, setConfettiFired] = useState(false);
  // Stacked deck fly-out animation state
  const [isFlyingOut, setIsFlyingOut] = useState(false);

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(revealedQuestions).length;
  const isQuizCompleted = answeredCount === totalQuestions && totalQuestions > 0;

  // Calculate live score
  const correctCount = questions.reduce((acc, q) => {
    const correctIdx = q.correct_index ?? q.correctIndex ?? 0;
    if (revealedQuestions[q.id] && selectedAnswers[q.id] === correctIdx) {
      return acc + 1;
    }
    return acc;
  }, 0);

  // Trigger confetti when completed with high score (score >= 80% or >=4/5)
  useEffect(() => {
    if (isQuizCompleted && !confettiFired) {
      setConfettiFired(true);
      const scoreRatio = totalQuestions > 0 ? correctCount / totalQuestions : 0;
      if (scoreRatio >= 0.8) {
        confetti({
          particleCount: 130,
          spread: 85,
          origin: { y: 0.6 },
          colors: ["#a855f7", "#6366f1", "#06b6d4", "#10b981", "#ec4899", "#f59e0b"],
        });
      }
    }
  }, [isQuizCompleted, confettiFired, correctCount, totalQuestions]);

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    // If already revealed for this question, keep it locked
    if (revealedQuestions[questionId]) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
    setRevealedQuestions((prev) => ({
      ...prev,
      [questionId]: true,
    }));
  };

  // Stacked deck smooth fly-out to next card
  const handleNextCard = () => {
    if (currentIndex < totalQuestions - 1) {
      setIsFlyingOut(true);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsFlyingOut(false);
      }, 380);
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setRevealedQuestions({});
    setCurrentIndex(0);
    setConfettiFired(false);
    setIsFlyingOut(false);
  };

  // Readiness evaluation text
  const getReadinessDiagnostic = () => {
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    if (percentage >= 80) {
      return {
        title: "Ready for Exam — Elite Mastery",
        desc: "You demonstrated outstanding command of high-yield concepts and nuanced edge cases.",
        color: "text-emerald-400",
        badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
        icon: Trophy,
      };
    } else if (percentage >= 60) {
      return {
        title: "Ready for Exam — Strong Foundation",
        desc: "Solid retention of core formulas and principles. Review the 1-2 missed explanations to lock in a top score.",
        color: "text-blue-400",
        badge: "bg-blue-500/10 border-blue-500/30 text-blue-300",
        icon: Award,
      };
    } else {
      return {
        title: "Revision Recommended — Revisit Key Concepts",
        desc: "Check off the high-yield takeaways in the Revision Pack and re-attempt the quiz to solidify recall.",
        color: "text-amber-400",
        badge: "bg-amber-500/10 border-amber-500/30 text-amber-300",
        icon: AlertTriangle,
      };
    }
  };

  const diagnostic = getReadinessDiagnostic();
  const currentQuestion = questions[currentIndex] || questions[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Primary Quiz Mode Tab Switcher */}
      <div className="flex items-center p-1.5 rounded-2xl bg-black/50 border border-white/10 shadow-xl backdrop-blur-md">
        <button
          type="button"
          onClick={() => setActiveQuizTab("mcq")}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
            activeQuizTab === "mcq"
              ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/25"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <HelpCircle className="h-4 w-4 text-cyan-300" />
          <span>Multiple Choice</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/15">
            {totalQuestions}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveQuizTab("viva")}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
            activeQuizTab === "viva"
              ? "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white shadow-md shadow-purple-500/25"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Mic className="h-4 w-4 text-cyan-300 animate-pulse" />
          <span>🎙️ Oral Viva Exam</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 font-semibold border border-cyan-400/30">
            Voice AI
          </span>
        </button>
      </div>

      {/* Mode 1: Oral Viva Voice Exam */}
      {activeQuizTab === "viva" && (
        <OralVivaExam questions={questions} traps={traps} topic={topic} />
      )}

      {/* Mode 2: Standard Multiple Choice Deck */}
      {activeQuizTab === "mcq" && (
        <>
          {/* Header Bar with Corner Progress Ring */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl spatial-glass-pane p-4 shadow-xl">
        <div className="flex items-center space-x-3.5">
          {/* Circular Progress Ring */}
          <div className="relative flex items-center justify-center w-11 h-11 shrink-0">
            <svg className="w-11 h-11 -rotate-90" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r="15.5"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="3.5"
              />
              <circle
                cx="20"
                cy="20"
                r="15.5"
                fill="none"
                stroke="url(#quizProgressGrad)"
                strokeWidth="3.5"
                strokeDasharray={97.4}
                strokeDashoffset={97.4 - (totalQuestions > 0 ? (answeredCount / totalQuestions) * 97.4 : 0)}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
              <defs>
                <linearGradient id="quizProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute text-[10px] font-mono font-bold text-slate-200">
              {Math.round(totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0)}%
            </span>
          </div>

          <div>
            <h2 className="text-sm font-bold text-white tracking-tight font-display">Active Recall Deck</h2>
            <p className="text-xs text-slate-400 font-sans">
              Stacked deck recall • Cards fly out on progression
            </p>
          </div>
        </div>

        {/* View Mode & Reset Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex rounded-xl border border-white/10 bg-slate-950/80 p-1 text-xs backdrop-blur-md">
            <button
              onClick={() => setViewMode("stepper")}
              className={`rounded-lg px-3 py-1 font-semibold transition-all duration-300 ease-in-out ${
                viewMode === "stepper"
                  ? "glass-btn-tactile text-white border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Stacked Deck
            </button>
            <button
              onClick={() => setViewMode("all")}
              className={`rounded-lg px-3 py-1 font-semibold transition-all duration-300 ease-in-out ${
                viewMode === "all"
                  ? "glass-btn-tactile text-white border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All ({totalQuestions})
            </button>
          </div>

          <button
            onClick={handleResetQuiz}
            className="inline-flex items-center space-x-1 rounded-xl glass-btn-tactile px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white transition-all duration-300 active:scale-95"
            title="Reset Quiz"
          >
            <RotateCcw className="h-3 w-3 text-cyan-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Progress & Live Score Bar */}
      <div className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/60 px-4 py-2.5 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-slate-300">Answered:</span>
          <span className="font-mono text-cyan-400 font-bold">
            {answeredCount}/{totalQuestions}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-medium text-slate-300">Live Score:</span>
          <span className="font-mono text-emerald-400 font-bold">
            {correctCount}/{answeredCount || 0}
          </span>
        </div>
      </div>

      {/* Mode 1: Stacked Deck Single Question View */}
      {viewMode === "stepper" && currentQuestion && (
        <div className="space-y-4">
          {/* Stacked Deck Physical Container */}
          <div className="relative min-h-[460px]">
            {/* Background Deck Layer 2 (Deepest peeking card) */}
            {currentIndex + 2 < totalQuestions && (
              <div
                className="absolute inset-0 translate-y-5 scale-[0.93] rounded-2xl border border-white/5 bg-slate-950/80 pointer-events-none z-0 shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out"
                aria-hidden="true"
              />
            )}

            {/* Background Deck Layer 1 (Middle peeking card) */}
            {currentIndex + 1 < totalQuestions && (
              <div
                className="absolute inset-0 translate-y-2.5 scale-[0.965] rounded-2xl border border-white/10 bg-slate-900/60 pointer-events-none z-10 shadow-xl backdrop-blur-md transition-all duration-300 ease-in-out"
                aria-hidden="true"
              />
            )}

            {/* Active Question Card (Top of Stacked Deck) */}
            <div
              className={`relative z-20 rounded-2xl spatial-glass-card p-6 shadow-2xl transition-all duration-300 ease-in-out ${
                isFlyingOut ? "animate-card-flyout-right pointer-events-none" : ""
              }`}
            >
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-display">
                  Deck Card {currentIndex + 1} of {totalQuestions}
                </span>
                {revealedQuestions[currentQuestion.id] && (
                  <span
                    className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      selectedAnswers[currentQuestion.id] === (currentQuestion.correct_index ?? currentQuestion.correctIndex ?? 0)
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/20"
                    }`}
                  >
                    {selectedAnswers[currentQuestion.id] === (currentQuestion.correct_index ?? currentQuestion.correctIndex ?? 0) ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Correct</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5 text-rose-400" />
                        <span>Incorrect</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Question Text */}
              <h3 className="text-base font-bold text-white leading-relaxed mb-6 font-display">
                <MathRenderer text={currentQuestion.question} />
              </h3>

              {/* Options */}
              <div className="space-y-2.5 w-full">
                {currentQuestion.options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === optIdx;
                  const isRevealed = revealedQuestions[currentQuestion.id];
                  const correctIdx = currentQuestion.correct_index ?? currentQuestion.correctIndex ?? 0;
                  const isCorrectOption = optIdx === correctIdx;

                  let borderStyle = "border-white/5 hover:border-cyan-500/50 bg-slate-950/40 text-slate-200 hover:bg-slate-900/60";
                  let badgeStyle = "border-slate-700 bg-slate-900 text-slate-400";

                  if (isRevealed) {
                    if (isCorrectOption) {
                      borderStyle = "border-emerald-500 bg-emerald-950/40 text-emerald-200 shadow-md shadow-emerald-500/30 ring-1 ring-emerald-500/40";
                      badgeStyle = "border-emerald-400 bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/50";
                    } else if (isSelected && !isCorrectOption) {
                      borderStyle = "border-rose-500 bg-rose-950/40 text-rose-200 shadow-md shadow-rose-500/30 ring-1 ring-rose-500/40";
                      badgeStyle = "border-rose-400 bg-rose-500 text-slate-950 font-bold shadow-sm shadow-rose-500/50";
                    } else {
                      borderStyle = "border-white/5 bg-slate-950/20 text-slate-500 opacity-40";
                      badgeStyle = "border-slate-800 bg-slate-900 text-slate-600";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isRevealed}
                      onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                      className={`w-full flex items-start justify-between rounded-xl border p-3 sm:p-4 text-left text-xs sm:text-sm transition-all duration-300 ease-in-out gap-3 ${borderStyle} ${
                        !isRevealed ? "cursor-pointer active:scale-[0.99]" : "cursor-default"
                      }`}
                    >
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold mt-0.5 ${badgeStyle}`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="font-medium leading-relaxed break-words">
                          <MathRenderer text={option} />
                        </span>
                      </div>

                      {isRevealed && isCorrectOption && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 ml-2 mt-0.5" />
                      )}
                      {isRevealed && isSelected && !isCorrectOption && (
                        <XCircle className="h-5 w-5 text-rose-400 shrink-0 ml-2 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Pedagogical Explanation (Revealed immediately upon selection) */}
              {revealedQuestions[currentQuestion.id] && (
                <div className="mt-6 rounded-xl border border-indigo-500/40 bg-indigo-950/30 p-4 text-xs text-slate-200 shadow-lg shadow-indigo-950/40 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shrink-0 mt-0.5">
                      <Lightbulb className="h-4 w-4 text-cyan-300" />
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-cyan-300 mr-2 tracking-wide uppercase text-[11px] font-display">
                        Pedagogical Insight:
                      </span>
                      <p className="leading-relaxed text-slate-200 font-sans mt-1">
                        <MathRenderer text={currentQuestion.explanation} />
                      </p>
                    </div>
                  </div>

                  {/* Next Card Fly-out Trigger */}
                  {currentIndex < totalQuestions - 1 && (
                    <div className="mt-3.5 pt-3 border-t border-white/10 flex justify-end">
                      <button
                        type="button"
                        onClick={handleNextCard}
                        className="inline-flex items-center space-x-2 rounded-xl glass-btn-hero px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 active:scale-95 transition-all duration-300 ease-in-out"
                      >
                        <span>Fly to Next Card</span>
                        <ArrowRight className="h-3.5 w-3.5 text-cyan-200" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stepper Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrevCard}
              disabled={currentIndex === 0}
              className="inline-flex items-center space-x-1.5 rounded-xl glass-btn-tactile px-4 py-2 text-xs font-medium text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:text-white transition-all duration-300 active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            {/* Dots */}
            <div className="flex items-center space-x-1.5">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = revealedQuestions[q.id];
                const correctIdx = q.correct_index ?? q.correctIndex ?? 0;
                const isCorrect = isAnswered && selectedAnswers[q.id] === correctIdx;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      isCurrent
                        ? "w-6 bg-cyan-400 shadow-sm shadow-cyan-400/50"
                        : isAnswered
                        ? isCorrect
                          ? "w-2.5 bg-emerald-500 shadow-sm shadow-emerald-500/50"
                          : "w-2.5 bg-rose-500 shadow-sm shadow-rose-500/50"
                        : "w-2.5 bg-slate-700"
                    }`}
                    title={`Card ${idx + 1}`}
                  />
                );
              })}
            </div>

            <button
              onClick={handleNextCard}
              disabled={currentIndex === totalQuestions - 1}
              className="inline-flex items-center space-x-1.5 rounded-xl glass-btn-tactile px-4 py-2 text-xs font-medium text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:text-white transition-all duration-300 active:scale-95"
            >
              <span>Next</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: All Questions in One View */}
      {viewMode === "all" && (
        <div className="space-y-6">
          {questions.map((q, idx) => {
            const isRevealed = revealedQuestions[q.id];
            const correctIdx = q.correct_index ?? q.correctIndex ?? 0;
            const isCorrect = isRevealed && selectedAnswers[q.id] === correctIdx;

            return (
              <div
                key={q.id}
                className="rounded-2xl linear-card p-5 shadow-md"
              >
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                  <span className="text-xs font-semibold text-indigo-400 font-display">
                    Question {idx + 1}
                  </span>
                  {isRevealed && (
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        isCorrect
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-white mb-4 leading-relaxed font-display">
                  <MathRenderer text={q.question} />
                </h4>

                <div className="space-y-2.5 w-full">
                  {q.options.map((option, optIdx) => {
                    const isOptionSelected = selectedAnswers[q.id] === optIdx;
                    const isCorrectOption = optIdx === correctIdx;

                    let btnStyle = "border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-200";
                    let badgeStyle = "border-slate-700 bg-slate-900 text-slate-400";

                    if (isRevealed) {
                      if (isCorrectOption) {
                        btnStyle = "border-emerald-500 bg-emerald-950/30 text-emerald-200 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500/30";
                        badgeStyle = "border-emerald-400 bg-emerald-500 text-slate-950 font-bold";
                      } else if (isOptionSelected && !isCorrectOption) {
                        btnStyle = "border-rose-500 bg-rose-950/30 text-rose-200 shadow-md shadow-rose-500/20 ring-1 ring-rose-500/30";
                        badgeStyle = "border-rose-400 bg-rose-500 text-slate-950 font-bold";
                      } else {
                        btnStyle = "border-slate-800/80 bg-slate-950/20 text-slate-500 opacity-50";
                        badgeStyle = "border-slate-800 bg-slate-900 text-slate-600";
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={isRevealed}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`w-full flex items-start justify-between rounded-xl border p-3 sm:p-4 text-left text-xs sm:text-sm transition-all duration-200 gap-3 ${btnStyle} ${
                          !isRevealed ? "cursor-pointer active:scale-[0.99]" : "cursor-default"
                        }`}
                      >
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold mt-0.5 ${badgeStyle}`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="leading-relaxed break-words">
                            <MathRenderer text={option} />
                          </span>
                        </div>
                        {isRevealed && isCorrectOption && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 ml-2 mt-0.5" />}
                        {isRevealed && isOptionSelected && !isCorrectOption && <XCircle className="h-4 w-4 text-rose-400 shrink-0 ml-2 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>

                {isRevealed && (
                  <div className="mt-4 rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-3 text-xs text-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start space-x-2.5">
                      <Lightbulb className="h-4 w-4 text-indigo-300 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-indigo-300 mr-1.5 font-display text-[11px] uppercase">Pedagogical Insight:</span>
                        <span className="text-slate-200">
                          <MathRenderer text={q.explanation} />
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* End of Quiz Readiness Diagnostic & Score Counter */}
      {isQuizCompleted && (
        <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 p-6 text-center shadow-2xl shadow-indigo-950/50 animate-in zoom-in-95 duration-500">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/20">
            <Trophy className="h-7 w-7 text-indigo-400" />
          </div>

          <div className="mb-2 inline-flex items-center space-x-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Active Recall Diagnostic</span>
          </div>

          <h3 className="text-2xl font-extrabold text-white tracking-tight mt-2 font-display">
            {correctCount} / {totalQuestions} Questions Correct
          </h3>

          <div className="mt-2 inline-block">
            <span className={`text-base font-bold font-display ${diagnostic.color}`}>
              {diagnostic.title}
            </span>
          </div>

          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-400 font-sans">
            {diagnostic.desc}
          </p>

          <div className="mt-6 flex items-center justify-center space-x-3">
            <button
              onClick={handleResetQuiz}
              className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:brightness-110 active:scale-95 transition-all duration-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retake Practice Quiz</span>
            </button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default ActiveRecallQuiz;
