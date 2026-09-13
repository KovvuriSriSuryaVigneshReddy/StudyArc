"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

export default function SpatialCursor() {
  const [mounted, setMounted] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for touch / mobile viewports (< 768px or coarse pointer / no hover)
    const checkDisabled = () => {
      if (typeof window === "undefined") return true;
      const isCoarse = window.matchMedia("(pointer: coarse)").matches;
      const isNoHover = window.matchMedia("(hover: none)").matches;
      const isMobileWidth = window.innerWidth < 768;
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      return (isCoarse && isNoHover) || isMobileWidth || hasTouch;
    };

    if (checkDisabled()) {
      setIsDisabled(true);
      return;
    }

    setMounted(true);

    let targetX = -100;
    let targetY = -100;
    let ringX = -100;
    let ringY = -100;
    let animId: number;
    let hasMoved = false;

    const onMouseMove = (e: MouseEvent) => {
      // Use strictly e.clientX and e.clientY with zero scroll offset
      targetX = e.clientX;
      targetY = e.clientY;

      if (!hasMoved) {
        // Initialize ring instantly at pointer position on first move
        ringX = targetX;
        ringY = targetY;
        hasMoved = true;
      }

      // Real-time dot translation exactly centered at pointer (8x8 -> offset by 4px)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX - 4}px, ${targetY - 4}px, 0)`;
      }
    };

    const renderLoop = () => {
      if (hasMoved) {
        // High lerp factor (0.35) so it tracks tightly without floating away
        ringX += (targetX - ringX) * 0.35;
        ringY += (targetY - ringY) * 0.35;

        // Follower ring translation exactly centered at pointer (32x32 -> offset by 16px)
        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${ringX - 16}px, ${ringY - 16}px, 0)`;
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    const handleResize = () => {
      if (checkDisabled()) {
        setIsDisabled(true);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    animId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Avoid hydration mismatch during Next.js SSR or disable on mobile / touch
  if (!mounted || isDisabled || typeof document === "undefined") {
    return null;
  }

  // Mount directly into document.body to break free from ancestor CSS transforms & perspective contexts
  return createPortal(
    <div
      className="spatial-cursor-portal pointer-events-none fixed inset-0 overflow-hidden"
      style={{
        zIndex: 999999,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      {/* Center Dot: 8px x 8px cyan circle with absolute zero-anchor points and NO CSS transition */}
      <div
        ref={dotRef}
        className="spatial-cursor-dot pointer-events-none rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "8px",
          height: "8px",
          margin: 0,
          padding: 0,
          pointerEvents: "none",
          willChange: "transform",
          transition: "none",
          transform: "translate3d(-100px, -100px, 0)",
          zIndex: 999999,
        }}
      />

      {/* Follower Ring: 32px x 32px circle with absolute zero-anchor points and NO CSS transition */}
      <div
        ref={ringRef}
        className="spatial-cursor-ring pointer-events-none rounded-full border border-cyan-400/60 bg-indigo-500/10 shadow-[0_0_16px_rgba(99,102,241,0.35)] backdrop-blur-[0.5px]"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "32px",
          height: "32px",
          margin: 0,
          padding: 0,
          pointerEvents: "none",
          willChange: "transform",
          transition: "none",
          transform: "translate3d(-100px, -100px, 0)",
          zIndex: 999999,
        }}
      />
    </div>,
    document.body
  );
}

export { SpatialCursor };