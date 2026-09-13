"use client";

import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  distance: number;
  angle: number;
  speed: number;
  baseRadius: number;
  baseAlpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  color: string;
}

interface CosmicDust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  pulsePhase: number;
  pulseSpeed: number;
  color: string;
}

export const SpaceBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse parallax variables with smooth lerp
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
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

    const starPalettes = [
      "rgba(255, 255, 255, ",
      "rgba(199, 210, 254, ", // indigo-200
      "rgba(165, 243, 252, ", // cyan-200
      "rgba(216, 180, 254, ", // purple-300
      "rgba(129, 140, 248, ", // indigo-400
    ];

    const maxRadius = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2) * 1.35;
    const numStars = 260;
    const stars: Star[] = [];

    const initStar = (randomDistance = true): Star => {
      const angle = Math.random() * Math.PI * 2;
      const distance = randomDistance ? Math.random() * maxRadius : Math.random() * 40 + 5;
      return {
        x: 0,
        y: 0,
        distance,
        angle,
        speed: Math.random() * 1.6 + 0.6,
        baseRadius: Math.random() * 1.3 + 0.5,
        baseAlpha: Math.random() * 0.65 + 0.35,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.04 + 0.015,
        color: starPalettes[Math.floor(Math.random() * starPalettes.length)],
      };
    };

    for (let i = 0; i < numStars; i++) {
      stars.push(initStar(true));
    }

    // Cosmic Dust Particles
    const dustPalette = [
      "rgba(168, 85, 247, ", // purple
      "rgba(6, 182, 212, ",  // cyan
      "rgba(99, 102, 241, ", // indigo
    ];
    const numDust = 24;
    const dustMotes: CosmicDust[] = [];

    for (let i = 0; i < numDust; i++) {
      dustMotes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 6 + 3,
        alpha: Math.random() * 0.12 + 0.04,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        color: dustPalette[Math.floor(Math.random() * dustPalette.length)],
      });
    }

    // Animation Loop
    const render = () => {
      // Smooth cursor parallax interpolation
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2 + mouseX * 55;
      const cy = height / 2 + mouseY * 55;

      // 1. Render Cosmic Dust Motes
      for (let i = 0; i < dustMotes.length; i++) {
        const dust = dustMotes[i];
        dust.x += dust.vx + mouseX * 0.1;
        dust.y += dust.vy + mouseY * 0.1;
        dust.pulsePhase += dust.pulseSpeed;

        if (dust.x < -50) dust.x = width + 50;
        if (dust.x > width + 50) dust.x = -50;
        if (dust.y < -50) dust.y = height + 50;
        if (dust.y > height + 50) dust.y = -50;

        const currentAlpha = dust.alpha * (0.8 + 0.3 * Math.sin(dust.pulsePhase));

        const grad = ctx.createRadialGradient(
          dust.x,
          dust.y,
          0,
          dust.x,
          dust.y,
          dust.radius * 2
        );
        grad.addColorStop(0, `${dust.color}${currentAlpha})`);
        grad.addColorStop(1, `${dust.color}0)`);

        ctx.beginPath();
        ctx.arc(dust.x, dust.y, dust.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // 2. Render Deep-Space Twinkling Stars with Outward Drift
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Accelerate outward slightly as distance increases (3D depth warp)
        const acceleration = 1 + (star.distance / maxRadius) * 2;
        star.distance += star.speed * acceleration;
        star.twinklePhase += star.twinkleSpeed;

        if (star.distance > maxRadius) {
          stars[i] = initStar(false);
          continue;
        }

        // Project coordinate outward from center
        const screenX = cx + Math.cos(star.angle) * star.distance;
        const screenY = cy + Math.sin(star.angle) * star.distance;

        if (screenX < -20 || screenX > width + 20 || screenY < -20 || screenY > height + 20) {
          stars[i] = initStar(false);
          continue;
        }

        // Scale size and alpha with depth and twinkle
        const depthFactor = star.distance / maxRadius;
        const size = star.baseRadius * (0.6 + depthFactor * 1.5);
        const twinkle = 0.75 + 0.25 * Math.sin(star.twinklePhase);
        const alpha = Math.min(1, Math.max(0.15, star.baseAlpha * twinkle * (0.4 + depthFactor * 0.9)));

        // Micro streak trailing toward center
        const tailLength = Math.min(star.speed * depthFactor * 5, 12);
        const tailX = screenX - Math.cos(star.angle) * tailLength;
        const tailY = screenY - Math.sin(star.angle) * tailLength;

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(screenX, screenY);
        ctx.strokeStyle = `${star.color}${alpha * 0.5})`;
        ctx.lineWidth = size * 0.6;
        ctx.stroke();

        // Glowing Star Body
        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fillStyle = `${star.color}${alpha})`;
        ctx.fill();

        // Extra halo for prominent stars
        if (size > 1.8 && alpha > 0.6) {
          ctx.beginPath();
          ctx.arc(screenX, screenY, size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `${star.color}${alpha * 0.2})`;
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
      {/* Deep-Space Ambient Radial Gradients (Contrast Protective Layer) */}
      <div className="absolute inset-0 bg-[#0a0f1d] bg-gradient-to-b from-[#0a0f1d] via-[#100b24] to-[#1a0a2a] opacity-95" />

      {/* Cosmic Nebula Glow: Violet (#4c1d95/20) and Cyan (#0e7490/25) Blurs */}
      <div className="absolute top-[10%] left-[20%] w-[680px] h-[680px] rounded-full bg-[#4c1d95]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[15%] w-[720px] h-[720px] rounded-full bg-[#0e7490]/25 blur-[130px] pointer-events-none" />
      <div className="absolute top-[45%] right-[25%] w-[550px] h-[550px] rounded-full bg-indigo-900/15 blur-[110px] pointer-events-none" />

      {/* Deep-Space Canvas for Twinkling Stars & Cosmic Dust */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
};

export default SpaceBackground;
