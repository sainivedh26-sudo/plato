import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("panel", className)}>{children}</div>;
}

type Tone = "neutral" | "success" | "warning" | "info" | "danger" | "primary";

const toneMap: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  info: "bg-info/10 text-info border-info/30",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
  primary: "bg-primary/10 text-primary border-primary/30",
};

export function Pill({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        toneMap[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function LiveDot({ tone = "success" }: { tone?: "success" | "warning" }) {
  return (
    <span
      className={cn(
        "live-dot inline-block size-1.5 rounded-full",
        tone === "success" ? "bg-success" : "bg-warning",
      )}
    />
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </p>
  );
}

export function StageFrame({
  step,
  title,
  subtitle,
  right,
  children,
}: {
  step: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Panel className="overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface/40 px-4 py-3 sm:gap-3 sm:px-5 sm:py-3.5">
        <div className="flex items-baseline gap-2 sm:gap-3">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[11px]">
            {step}
          </span>
          <div>
            <h2 className="text-xs font-semibold text-foreground sm:text-sm">{title}</h2>
            {subtitle ? <p className="text-[10px] text-muted-foreground sm:text-xs">{subtitle}</p> : null}
          </div>
        </div>
        <div className="flex items-center gap-2">{right}</div>
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </Panel>
  );
}
