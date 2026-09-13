"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export interface HoverExpandItem {
  label: string;
  description?: string;
  status?: "completed" | "active" | "pending";
}

export interface HoverExpandProps {
  items: HoverExpandItem[];
  onItemClick?: (index: number) => void;
  className?: string;
}

export function HoverExpand({ items, onItemClick, className }: HoverExpandProps) {
  const isInteractive = !!onItemClick;
  
  return (
    <div className={cn("liquid-glass rounded-full px-2 py-1.5 flex items-center gap-0.5 overflow-x-auto custom-scrollbar", className)}>
      {items.map((item, i) => {
        const isActive = item.status === "active";
        const isCompleted = item.status === "completed";
        const isPending = item.status === "pending";

        const content = (
          <>
            {isCompleted ? (
              <CheckCircle2 className="size-2.5 sm:size-3" />
            ) : isActive ? (
              <Loader2 className="size-2.5 animate-spin sm:size-3" />
            ) : (
              <Circle className="size-2.5 sm:size-3" />
            )}
            <span className="truncate">{item.label}</span>
          </>
        );

        if (!isInteractive) {
          return (
            <div
              key={i}
              className={cn(
                "flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs",
                isActive && "bg-primary text-primary-foreground shadow-sm",
                isCompleted && "text-success",
                isPending && "text-muted-foreground/50",
              )}
            >
              {content}
            </div>
          );
        }

        return (
          <button
            key={i}
            onClick={() => onItemClick?.(i)}
            disabled={isPending}
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium transition-all sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs",
              "hover:bg-muted/50 active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isActive && "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
              isCompleted && "text-success hover:bg-success/10",
              isPending && "text-muted-foreground/50",
            )}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
