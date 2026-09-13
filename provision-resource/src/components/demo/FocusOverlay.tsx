import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface FocusOverlayProps {
  active: boolean;
  targetRef: React.RefObject<HTMLElement | null>;
  message?: string;
  onDismiss?: () => void;
  duration?: number;
}

export function FocusOverlay({
  active,
  targetRef,
  message,
  onDismiss,
  duration = 3000,
}: FocusOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }

    const updatePosition = () => {
      if (!targetRef.current) return;
      const rect = targetRef.current.getBoundingClientRect();
      const padding = 12;
      setSpotlightStyle({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
        borderRadius: "12px",
      });
    };

    updatePosition();
    setVisible(true);

    const resizeObserver = new ResizeObserver(updatePosition);
    if (targetRef.current) {
      resizeObserver.observe(targetRef.current);
    }

    if (duration > 0 && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);
      return () => {
        clearTimeout(timer);
        resizeObserver.disconnect();
      };
    }

    return () => resizeObserver.disconnect();
  }, [active, targetRef, duration, onDismiss]);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 focus-overlay-in"
      onClick={onDismiss}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" />
      
      <div
        className="absolute spotlight-in"
        style={spotlightStyle}
      >
        <div className="absolute inset-0 rounded-xl border-2 border-primary/80 highlight-glow" />
        <div className="absolute inset-0 rounded-xl bg-transparent" style={{
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
        }} />
      </div>

      {message && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 fade-in-up">
          <div className="liquid-glass-strong rounded-xl px-5 py-3 text-sm font-medium text-foreground shadow-xl">
            {message}
          </div>
        </div>
      )}
    </div>
  );
}

interface InlineHighlightProps {
  active: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: "pulse" | "glow" | "blink";
}

export function InlineHighlight({
  active,
  children,
  className,
  variant = "pulse",
}: InlineHighlightProps) {
  const animationClass = {
    pulse: "highlight-pulse",
    glow: "highlight-glow",
    blink: "blink-subtle",
  }[variant];

  return (
    <span className={cn("relative inline-block rounded-lg", active && animationClass, className)}>
      {children}
    </span>
  );
}
