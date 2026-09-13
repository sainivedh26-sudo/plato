import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface TourCalloutProps {
  selector: string;
  title: string;
  description: string;
  side?: "top" | "bottom" | "left" | "right";
  onDismiss: () => void;
}

export function TourCallout({ selector, title, description, side = "bottom", onDismiss }: TourCalloutProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const dismissedRef = useRef(false);

  // Measure target position and add highlight class
  useEffect(() => {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const popoverWidth = 340;
    const gap = 12;

    let top = 0;
    let left = 0;

    switch (side) {
      case "top":
        top = rect.top - gap;
        left = rect.left + rect.width / 2;
        break;
      case "bottom":
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2;
        left = rect.left - gap;
        break;
      case "right":
        top = rect.top + rect.height / 2;
        left = rect.right + gap;
        break;
    }

    // Keep within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (side === "bottom" || side === "top") {
      left = Math.max(popoverWidth / 2 + 8, Math.min(left, viewportWidth - popoverWidth / 2 - 8));
    }
    if (side === "left" || side === "right") {
      top = Math.max(100, Math.min(top, viewportHeight - 160));
    }

    setPosition({ top, left });

    // Add highlight animation to target
    el.classList.add("tour-target-pulse");

    // Fade in
    requestAnimationFrame(() => setVisible(true));

    return () => {
      el.classList.remove("tour-target-pulse");
    };
  }, [selector, side]);

  // Dismiss on click outside or on target element
  useEffect(() => {
    if (dismissedRef.current) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const el = document.querySelector(selector);
      const popover = popoverRef.current;

      if (!el || !popover) return;

      // Click on target element dismisses callout
      if (el === target || el.contains(target)) {
        dismissedRef.current = true;
        onDismiss();
        return;
      }

      // Click outside popover dismisses it
      if (!popover.contains(target)) {
        dismissedRef.current = true;
        onDismiss();
      }
    };

    // Use capture phase so we run before any other handlers
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [selector, onDismiss]);

  // Re-measure on resize
  useEffect(() => {
    const handleResize = () => {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const gap = 12;
      let top = 0;
      let left = 0;

      switch (side) {
        case "top":
          top = rect.top - gap;
          left = rect.left + rect.width / 2;
          break;
        case "bottom":
          top = rect.bottom + gap;
          left = rect.left + rect.width / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2;
          left = rect.left - gap;
          break;
        case "right":
          top = rect.top + rect.height / 2;
          left = rect.right + gap;
          break;
      }

      const viewportWidth = window.innerWidth;
      if (side === "bottom" || side === "top") {
        left = Math.max(170 + 8, Math.min(left, viewportWidth - 170 - 8));
      }

      setPosition({ top, left });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selector, side]);

  if (!position) return null;

  const transformOrigin =
    side === "bottom"
      ? "top center"
      : side === "top"
        ? "bottom center"
        : side === "left"
          ? "right center"
          : "left center";

  return (
    <div
      ref={popoverRef}
      className="tour-callout"
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        transform: `translate(${side === "bottom" || side === "top" ? "-50%" : side === "left" ? "-100%" : "0%"}, ${side === "bottom" ? "0%" : side === "top" ? "-100%" : "-50%"})`,
        zIndex: 1000000001,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.25s cubic-bezier(0.25, 1, 0.5, 1)",
        transformOrigin,
        pointerEvents: "auto",
      }}
    >
      <div className="tour-callout-inner">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="tour-callout-close"
          aria-label="Dismiss"
        >
          <X className="size-3" />
        </button>
        <h3 className="tour-callout-title">{title}</h3>
        <p className="tour-callout-desc">{description}</p>
        <div className="tour-callout-footer">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="tour-callout-btn"
          >
            Got it
          </button>
        </div>
      </div>
      {/* Arrow */}
      <div
        className="tour-callout-arrow"
        style={{
          position: "absolute",
          ...(side === "bottom"
            ? { top: "-6px", left: "50%", transform: "translateX(-50%) rotate(45deg)" }
            : side === "top"
              ? { bottom: "-6px", left: "50%", transform: "translateX(-50%) rotate(45deg)" }
              : side === "left"
                ? { right: "-6px", top: "50%", transform: "translateY(-50%) rotate(45deg)" }
                : { left: "-6px", top: "50%", transform: "translateY(-50%) rotate(45deg)" }),
        }}
      />
    </div>
  );
}
