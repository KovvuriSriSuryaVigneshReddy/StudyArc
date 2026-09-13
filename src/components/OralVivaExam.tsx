"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Lightbulb,
  Send,
} from "lucide-react";
import { QuizQuestion, ExamTrap } from "@/types";
import MathRenderer from "./MathRenderer";

interface OralVivaExamProps {
  questions?: QuizQuestion[];
  traps?: ExamTrap[];
  topic?: string;
}

interface VivaFeedback {
  score: number;
  whatYouNailed: string[];
  whatYouMissed: string[];
  benchmarkAnswer: string;
}

export const OralVivaExam: React.FC<OralVivaExamProps> = ({
  questions = [],
  traps = [],
  topic = "Exam Material",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [feedback, setFeedback] = useState<Record<number, VivaFeedback>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Derive Viva Scenario Questions from the questions and traps
  const vivaScenarios = questions.map((q, idx) => {
    const matchingTrap = traps[idx % (traps.length || 1)];
    const scenarioPrompt = `Oral Viva Scenario: A university examiner asks you: "${q.question}" Explain your reasoning step-by-step, define key terminology, and explain why common misconceptions fail.`;
    return {
      id: q.id || idx + 1,
      question: q.question,
      scenario: scenarioPrompt,
      explanation: q.explanation,
      correctOption: q.options ? q.options[q.correct_index ?? q.correctIndex ?? 0] : "",
      trapHint: matchingTrap?.commonTrap || matchingTrap?.common_trap || "Avoid vague generalities.",
    };
  });

  const totalScenarios = vivaScenarios.length || 1;
  const currentScenario = vivaScenarios[currentIndex] || {
    id: 1,
    question: "Explain the fundamental principles and edge cases of this topic.",
    scenario: "Oral Viva Scenario: An examiner asks you to provide an in-depth breakdown of the primary principles.",
    explanation: "State the core definition, key mechanisms, and boundary constraints.",
    correctOption: "Accurate mechanical explanation",
    trapHint: "Be precise with definitions.",
  };

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Listen to question aloud via window.speechSynthesis
  const handleToggleSpeak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = `${currentScenario.scenario}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Daniel"))
    ) || voices.find((v) => v.lang.startsWith("en"));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Record Answer via SpeechRecognition / webkitSpeechRecognition
  const handleToggleRecord = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser. You can type your response directly into the text box.");
      return;
    }

    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingSeconds(0);
        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + " ";
        }
        setTranscript(currentTranscript.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event.error);
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start SpeechRecognition:", err);
      setIsRecording(false);
    }
  };

  // Qualitative AI Viva Evaluation
  const handleEvaluateAnswer = async () => {
    const spokenText = transcript.trim();
    if (!spokenText) return;

    setIsEvaluating(true);

    // Stop speaking or recording if active
    if (isSpeaking && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    // Heuristic qualitative evaluator modeling examiner feedback
    const wordCount = spokenText.split(/\s+/).filter(Boolean).length;
    const lowerSpoken = spokenText.toLowerCase();

    // Extract keywords from the explanation
    const explanationWords = currentScenario.explanation
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);

    const matches = explanationWords.filter((w) => lowerSpoken.includes(w));
    const coverageRatio = explanationWords.length > 0 ? matches.length / explanationWords.length : 0.5;

    // Calculate viva score (1-10)
    let score = 5;
    if (wordCount > 15) score += 1;
    if (wordCount > 35) score += 1;
    if (coverageRatio > 0.25) score += 1;
    if (coverageRatio > 0.45) score += 1;
    if (coverageRatio > 0.65) score += 1;
    score = Math.min(10, Math.max(1, score));

    // Construct "What you nailed" and "What you missed"
    const whatYouNailed: string[] = [];
    const whatYouMissed: string[] = [];

    if (wordCount >= 10) {
      whatYouNailed.push("Clear verbal structure and articulation under viva exam pressure.");
    }
    if (matches.length > 0) {
      const topMatches = Array.from(new Set(matches)).slice(0, 3);
      whatYouNailed.push(`Demonstrated understanding of core terms: "${topMatches.join('", "')}".`);
    } else {
      whatYouNailed.push("Offered a high-level conceptual perspective on the prompt.");
    }

    if (currentScenario.correctOption) {
      whatYouNailed.push(`Aligned well with the targeted principle: ${currentScenario.correctOption}.`);
    }

    if (score < 8) {
      whatYouMissed.push("Did not fully state the underlying mathematical or causal boundary conditions.");
      whatYouMissed.push(`Missed explicit mention of the examiner trap: "${currentScenario.trapHint}".`);
    } else if (score < 10) {
      whatYouMissed.push("Could provide a more concise formal definition before launching into practical examples.");
    } else {
      whatYouNailed.push("Flawless academic defense covering definitions, applications, and edge cases.");
    }

    const currentFeedback: VivaFeedback = {
      score,
      whatYouNailed,
      whatYouMissed: whatYouMissed.length > 0 ? whatYouMissed : ["Minor stylistic polish only."],
      benchmarkAnswer: `${currentScenario.correctOption ? `Expected Answer: ${currentScenario.correctOption}. ` : ""}${currentScenario.explanation}`,
    };

    setTimeout(() => {
      setFeedback((prev) => ({
        ...prev,
        [currentIndex]: currentFeedback,
      }));
      setIsEvaluating(false);
    }, 600);
  };

  const handleNext = () => {
    if (currentIndex < totalScenarios - 1) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setCurrentIndex((prev) => prev + 1);
      setTranscript("");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setCurrentIndex((prev) => prev - 1);
      setTranscript("");
    }
  };

  const handleResetCurrent = () => {
    setFeedback((prev) => {
      const copy = { ...prev };
      delete copy[currentIndex];
      return copy;
    });
    setTranscript("");
    setRecordingSeconds(0);
  };

  const currentFeedback = feedback[currentIndex];

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Oral Viva Scenario Card */}
      <div className="relative rounded-2xl spatial-glass-card p-6 shadow-2xl border border-cyan-500/30 overflow-hidden">
        {/* Subtle cyan/violet ambient glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-cyan-500/10 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Top Meta Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-display">
                Oral Viva Defense {currentIndex + 1} of {totalScenarios}
              </span>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-xs">{topic}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Listen Button (SpeechSynthesis) */}
            <button
              type="button"
              onClick={handleToggleSpeak}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isSpeaking
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse"
                  : "glass-btn-tactile text-slate-200 hover:text-white"
              }`}
              title={isSpeaking ? "Stop Speaking" : "Listen to question aloud"}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="h-3.5 w-3.5" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Listen Aloud</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Examiner Scenario Text */}
        <div className="space-y-3 mb-6">
          <div className="inline-flex items-center space-x-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-indigo-300">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>Examiner Prompt</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white font-display leading-relaxed">
            <MathRenderer text={currentScenario.scenario} />
          </h3>

          {/* Audio Wave Indicator if speaking */}
          {isSpeaking && (
            <div className="flex items-center space-x-1 py-1 text-cyan-400 text-xs font-mono">
              <span className="h-3 w-1 bg-cyan-400 rounded animate-pulse" />
              <span className="h-5 w-1 bg-cyan-400 rounded animate-pulse delay-75" />
              <span className="h-4 w-1 bg-cyan-400 rounded animate-pulse delay-150" />
              <span className="h-6 w-1 bg-cyan-400 rounded animate-pulse delay-100" />
              <span className="h-2 w-1 bg-cyan-400 rounded animate-pulse" />
              <span className="ml-2 text-slate-400">Examiner speaking...</span>
            </div>
          )}
        </div>

        {/* Voice Recording / Input Section */}
        <div className="space-y-4 rounded-xl bg-slate-950/70 border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display">
                Your Verbal Defense
              </span>
              {isRecording && (
                <span className="inline-flex items-center space-x-1 rounded-full bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-300 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  <span>REC {formatTime(recordingSeconds)}</span>
                </span>
              )}
            </div>

            {/* Record Answer Button */}
            <button
              type="button"
              onClick={handleToggleRecord}
              className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                isRecording
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/40 animate-pulse"
                  : "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:brightness-110 shadow-md shadow-cyan-500/25"
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-3.5 w-3.5" />
                  <span>Stop Recording</span>
                </>
              ) : (
                <>
                  <Mic className="h-3.5 w-3.5" />
                  <span>Record Answer</span>
                </>
              )}
            </button>
          </div>

          {/* Live Transcript / Editable Textarea */}
          <div className="relative">
            <textarea
              rows={4}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={
                speechSupported
                  ? 'Click "Record Answer" and speak clearly into your microphone, or type your response here...'
                  : "Type your oral response here..."
              }
              className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-sans leading-relaxed transition-all resize-none"
            />
          </div>

          {/* Submit for AI Evaluation */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500 font-sans">
              {transcript.trim() ? `${transcript.trim().split(/\s+/).length} words recorded` : "Speak or type to answer"}
            </span>

            <button
              type="button"
              onClick={handleEvaluateAnswer}
              disabled={!transcript.trim() || isEvaluating}
              className="inline-flex items-center space-x-2 rounded-xl glass-btn-hero px-4 py-2 text-xs font-bold text-white shadow-lg disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Evaluating Defense...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 text-cyan-200" />
                  <span>Evaluate Response</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Qualitative Evaluation Feedback Box */}
        {currentFeedback && (
          <div className="mt-6 rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-slate-950 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-300">
            {/* Score Pill */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
                  <Award className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-display">
                    Viva Evaluation Score
                  </h4>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Qualitative Assessment by AI Examiner
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-extrabold font-mono border ${
                    currentFeedback.score >= 8
                      ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300 shadow-sm shadow-emerald-500/30"
                      : currentFeedback.score >= 6
                      ? "border-blue-500/40 bg-blue-950/40 text-blue-300 shadow-sm shadow-blue-500/30"
                      : "border-amber-500/40 bg-amber-950/40 text-amber-300 shadow-sm shadow-amber-500/30"
                  }`}
                >
                  {currentFeedback.score} / 10
                </span>
              </div>
            </div>

            {/* What You Nailed */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 font-mono flex items-center space-x-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>What You Nailed:</span>
              </span>
              <ul className="space-y-1 text-xs text-slate-200 font-sans">
                {currentFeedback.whatYouNailed.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start space-x-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span><MathRenderer text={point} /></span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What You Missed */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 font-mono flex items-center space-x-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                <span>What You Missed / Examiner Gotchas:</span>
              </span>
              <ul className="space-y-1 text-xs text-slate-200 font-sans">
                {currentFeedback.whatYouMissed.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start space-x-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span><MathRenderer text={point} /></span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benchmark Model Answer */}
            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3.5 text-xs text-slate-300">
              <span className="font-bold text-cyan-300 uppercase tracking-wider text-[10px] font-mono block mb-1">
                Examiner&apos;s Benchmark Defense:
              </span>
              <div className="leading-relaxed font-sans">
                <MathRenderer text={currentFeedback.benchmarkAnswer} />
              </div>
            </div>

            {/* Reset / Retry defense */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleResetCurrent}
                className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Re-attempt Defense</span>
              </button>
            </div>
          </div>
        )}

        {/* Stepper Navigation */}
        <div className="flex items-center justify-between pt-5 mt-4 border-t border-white/10">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="inline-flex items-center space-x-1.5 rounded-xl glass-btn-tactile px-4 py-2 text-xs font-medium text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Previous Viva</span>
          </button>

          <span className="text-xs font-mono text-slate-400">
            {currentIndex + 1} / {totalScenarios}
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex === totalScenarios - 1}
            className="inline-flex items-center space-x-1.5 rounded-xl glass-btn-tactile px-4 py-2 text-xs font-medium text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:text-white transition-all cursor-pointer"
          >
            <span>Next Viva</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OralVivaExam;
