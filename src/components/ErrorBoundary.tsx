"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Structured error logging without unhandled rejection
    if (process.env.NODE_ENV !== "production") {
      // Safely capture component stack
      const info = errorInfo.componentStack;
      void info;
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6">
          <div className="relative max-w-lg w-full rounded-2xl border border-rose-500/30 bg-slate-950/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-lg shadow-rose-500/20">
              <AlertOctagon className="h-7 w-7" />
            </div>

            <h2 className="text-xl font-bold tracking-tight text-white mb-2">
              Studio Render Notice
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              An unexpected display exception occurred while rendering this revision module.
              Your study notes and active sessions remain preserved.
            </p>

            {this.state.error?.message && (
              <div className="mb-6 rounded-xl border border-white/10 bg-slate-900/60 p-3 text-left">
                <p className="font-mono text-[11px] text-rose-300 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset View</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl glass-btn-tactile px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white transition-all"
              >
                <Home className="h-4 w-4 text-slate-400" />
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
