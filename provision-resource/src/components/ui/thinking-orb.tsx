"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ThinkingOrbProps {
  state?: "idle" | "thinking" | "solving" | "responding";
  size?: number;
  className?: string;
}

function ThinkingOrb({ state = "thinking", size = 48, className }: ThinkingOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const animate = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      const cx = size / 2;
      const cy = size / 2;
      const radius = Math.max(size * 0.2, size * 0.35);

      ctx.clearRect(0, 0, size, size);

      if (state === "idle") {
        const pulse = Math.sin(t * 2) * 0.1 + 0.9;
        const r = Math.max(radius * pulse, 1);
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        gradient.addColorStop(0, "rgba(28, 93, 95, 0.3)");
        gradient.addColorStop(1, "rgba(28, 93, 95, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      } else if (state === "thinking" || state === "solving") {
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2 + t * 2;
          const r = Math.max(radius * (0.5 + Math.sin(t * 3 + i) * 0.3), 1);
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          const particleSize = Math.max(2 + Math.sin(t * 4 + i * 0.5) * 1, 0.5);

          const gradient = ctx.createRadialGradient(x, y, 0, x, y, particleSize * 2);
          gradient.addColorStop(0, "rgba(28, 93, 95, 0.8)");
          gradient.addColorStop(1, "rgba(28, 93, 95, 0)");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, particleSize * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        const centerGradient = ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          Math.max(radius * 0.5, 1),
        );
        centerGradient.addColorStop(0, "rgba(28, 93, 95, 0.6)");
        centerGradient.addColorStop(1, "rgba(28, 93, 95, 0)");
        ctx.fillStyle = centerGradient;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(radius * 0.5, 1), 0, Math.PI * 2);
        ctx.fill();
      } else if (state === "responding") {
        for (let i = 0; i < 3; i++) {
          const ringRadius = Math.max(radius * (0.3 + i * 0.3) + Math.sin(t * 3 + i) * 5, 1);
          const alpha = Math.max(0.3 - i * 0.1, 0);
          ctx.strokeStyle = `rgba(28, 93, 95, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(radius * 0.4, 1));
        gradient.addColorStop(0, "rgba(28, 93, 95, 0.8)");
        gradient.addColorStop(1, "rgba(28, 93, 95, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(radius * 0.4, 1), 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [state, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className={cn("rounded-full", className)}
    />
  );
}

export { ThinkingOrb, type ThinkingOrbProps };
