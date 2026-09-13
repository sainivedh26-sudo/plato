"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, Circle } from "lucide-react";

export interface StageProgressItem {
  label: string;
  description?: string;
  status: "completed" | "active" | "pending";
  duration?: string;
}

export interface StageProgressProps {
  items: StageProgressItem[];
  className?: string;
}

export function StageProgress({ items, className }: StageProgressProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <div className={cn("flex flex-col w-full", className)}>
      {items.map((item, i) => {
        const isHovered = hoveredIndex === i;
        const isOtherHovered = hoveredIndex !== null && !isHovered;

        return (
          <React.Fragment key={i}>
            <motion.div
              className="relative w-full overflow-hidden cursor-default"
              animate={{
                height: isHovered ? 80 : 48,
                opacity: isOtherHovered ? 0.4 : 1,
              }}
              transition={{
                height: { type: "spring", stiffness: 280, damping: 32, mass: 0.9 },
                opacity: { duration: 0.22, ease: "easeOut" },
              }}
              onHoverStart={() => setHoveredIndex(i)}
              onHoverEnd={() => setHoveredIndex(null)}
            >
              <div className="absolute inset-0 flex items-center px-4 gap-3">
                <motion.div
                  animate={{
                    scale: isHovered ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  {item.status === "completed" ? (
                    <CheckCircle2 className="size-4 text-success" />
                  ) : item.status === "active" ? (
                    <Loader2 className="size-4 text-primary animate-spin" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground" />
                  )}
                </motion.div>

                <div className="flex flex-col min-w-0 flex-1">
                  <motion.span
                    className="text-xs font-medium truncate"
                    animate={{
                      color: isHovered
                        ? "var(--color-foreground)"
                        : "var(--color-muted-foreground)",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>

                  {item.description && (
                    <motion.span
                      className="text-[10px] text-muted-foreground truncate"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: isHovered ? 1 : 0,
                        height: isHovered ? "auto" : 0,
                      }}
                      transition={{ duration: 0.2, delay: isHovered ? 0.1 : 0 }}
                    >
                      {item.description}
                    </motion.span>
                  )}
                </div>

                {item.duration && (
                  <motion.span
                    className="text-[10px] font-mono text-muted-foreground shrink-0"
                    animate={{
                      opacity: isHovered ? 1 : 0.5,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.duration}
                  </motion.span>
                )}
              </div>
            </motion.div>
            <div className="w-full border-t border-border/50" />
          </React.Fragment>
        );
      })}
    </div>
  );
}
