"use client";

import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  prevZ: number;
  size: number;
  color: string;
  speed: number;
}

export const StarfieldBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking for dynamic tilt & parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalized between -1 and 1
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleResize = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Star color palette (cosmic white, cyan, violet, indigo)
    const starColors = [
      "rgba(255, 255, 255, ",
      "rgba(199, 210, 254, ", // indigo-200
      "rgba(165, 243, 252, ", // cyan-200
      "rgba(216, 180, 254, ", // purple-300
      "rgba(129, 140, 248, ", // indigo-400
    ];

    const numStars = 220;
    const maxDepth = 1500;
    const stars: Star[] = [];

    const initStar = (star?: Star): Star => {
      const spread = Math.max(width, height) * 1.5;
      const z = star ? maxDepth : Math.random() * maxDepth + 1;
      return {
        x: (Math.random() - 0.5) * spread,
        y: (Math.random() - 0.5) * spread,
        z,
        prevZ: z,
        size: Math.random() * 1.4 + 0.6,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        speed: Math.random() * 2.2 + 1.2,
      };
    };

    for (let i = 0; i < numStars; i++) {
      stars.push(initStar());
    }

    const fov = 340;

    const render = () => {
      // Lerp mouse coordinates smoothly for cinematic drift
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Center with dynamic mouse tilt offset
      const cx = width / 2 + mouseX * 45;
      const cy = height / 2 + mouseY * 45;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.prevZ = star.z;
        star.z -= star.speed;

        // Recycle star when it passes the viewer
        if (star.z <= 0) {
          stars[i] = initStar(star);
          continue;
        }

        // Current projected position
        const k = fov / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        // Previous projected position for warp streak
        const pk = fov / star.prevZ;
        const prevPx = star.x * pk + cx;
        const prevPy = star.y * pk + cy;

        // Skip if outside visible viewport
        if (px < -50 || px > width + 50 || py < -50 || py > height + 50) {
          stars[i] = initStar(star);
          continue;
        }

        // Depth-based brightness & size
        const depthRatio = 1 - star.z / maxDepth;
        const alpha = Math.min(1, Math.max(0.1, depthRatio * depthRatio * 1.5));
        const currentSize = Math.max(0.7, (1 - star.z / maxDepth) * star.size * 2.2);

        // Draw micro warp-trail line
        ctx.beginPath();
        ctx.moveTo(prevPx, prevPy);
        ctx.lineTo(px, py);
        ctx.strokeStyle = `${star.color}${alpha * 0.8})`;
        ctx.lineWidth = currentSize * 0.75;
        ctx.lineCap = "round";
        ctx.stroke();

        // Draw glowing particle head
        ctx.beginPath();
        ctx.arc(px, py, currentSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = `${star.color}${alpha})`;
        ctx.fill();

        // Extra soft halo for close stars
        if (depthRatio > 0.75) {
          ctx.beginPath();
          ctx.arc(px, py, currentSize * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `${star.color}${alpha * 0.25})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
      {/* Deep Cosmic Ambient Glow Layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1d] via-[#100b24] to-[#1a0a2a] opacity-95" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-900/15 via-purple-900/10 to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-10 w-[700px] h-[500px] bg-gradient-to-t from-cyan-900/10 to-transparent blur-3xl" />

      {/* Interactive HTML5 Starfield Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
};

export default StarfieldBackground;
