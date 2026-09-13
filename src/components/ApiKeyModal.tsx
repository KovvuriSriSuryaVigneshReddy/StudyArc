"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Key,
  ShieldCheck,
  ExternalLink,
  Eye,
  EyeOff,
  Check,
  Sparkles,
  AlertCircle,
} from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey?: (key: string) => void;
  onSave?: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveKey,
  onSave,
}) => {
  const [inputKey, setInputKey] = useState(apiKey || "");
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputKey(apiKey || "");
      setValidationError(null);
      setSavedSuccess(false);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, apiKey]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setValidationError("Please enter your Gemini API key to enter the revision studio.");
      return;
    }
    setValidationError(null);
    const saveFn = onSaveKey || onSave;
    if (saveFn) {
      saveFn(trimmed);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  const handleDismiss = () => {
    if (!apiKey) {
      setValidationError("A valid Gemini API key is required to use StudyArc.ai. Please enter your key below.");
      return;
    }
    onClose();
  };

  const handleClear = () => {
    setInputKey("");
    const saveFn = onSaveKey || onSave;
    if (saveFn) {
      saveFn("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-indigo-500/40 bg-slate-950/95 p-6 sm:p-7 shadow-2xl shadow-indigo-500/25 backdrop-blur-2xl ring-1 ring-white/10">
        {/* Ambient Glows */}
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 opacity-25 blur-xl pointer-events-none -z-10" />

        {/* Close Button: Strictly requires active key to dismiss */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          title={apiKey ? "Close modal" : "API key required"}
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start space-x-3.5 mb-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/25 via-purple-500/20 to-cyan-500/25 border border-indigo-500/40 text-cyan-300 shadow-lg shadow-indigo-500/20">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white font-display tracking-tight flex items-center gap-2">
              <span>🔑 Enter Gemini API Key to Begin</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              To generate custom study guides, active-recall cards, and quizzes, StudyArc.ai requires a free Google Gemini API key.
            </p>
          </div>
        </div>

        {/* Direct Link to Google AI Studio */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-3.5 py-2.5">
          <span className="text-xs text-slate-300">Don&apos;t have a key? It takes 15 seconds:</span>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center space-x-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/25 hover:text-white transition-all shadow-sm"
          >
            <span>Get a free Gemini key at Google AI Studio</span>
            <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-300 font-display">
                Gemini API Key
              </label>
              {apiKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:underline"
                >
                  Clear Key
                </button>
              )}
            </div>

            <div className="relative">
              <input
                ref={inputRef}
                type={showKey ? "text" : "password"}
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="AIzaSy..."
                className={`w-full rounded-xl border bg-black/60 px-4 py-3 pr-11 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 font-mono transition-all ${
                  validationError
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/30"
                    : "border-white/15 focus:border-cyan-400 focus:ring-cyan-400/30"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                aria-label={showKey ? "Hide API key" : "Show API key"}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {validationError && (
              <div className="mt-2 flex items-center space-x-1.5 text-xs text-rose-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          {/* Privacy & Security Note */}
          <div className="flex items-start space-x-2.5 rounded-xl bg-indigo-950/25 border border-indigo-500/20 p-3 text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Your key is kept strictly in client session memory, never written to disk, and transmitted exclusively via encrypted HTTPS headers.
            </p>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center space-x-2 rounded-xl glass-btn-hero py-3.5 text-sm font-bold text-white shadow-xl active:scale-[0.98] transition-all"
          >
            {savedSuccess ? (
              <>
                <Check className="h-4 w-4 text-emerald-300" />
                <span>Key Saved! Entering Studio...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-cyan-200" />
                <span>Save & Enter Studio</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;
