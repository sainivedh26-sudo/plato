import { useEffect, useState, useMemo } from "react";
import { Sparkline } from "@/components/ui/sparkline";
import { cn } from "@/lib/utils";

type DemoPhase = "idle" | "provisioning" | "diagnosing" | "approval" | "fixing" | "recovered" | "complete";

const PHASE_CPU_DATA: Record<DemoPhase, number[]> = {
  idle: [12, 14, 13, 15, 12, 14, 13, 11, 13, 14, 12, 13],
  provisioning: [15, 22, 35, 48, 55, 62, 58, 50, 45, 40, 38, 35],
  diagnosing: [35, 42, 48, 52, 55, 50, 48, 52, 55, 58, 55, 50],
  approval: [50, 48, 45, 42, 40, 38, 35, 38, 40, 42, 40, 38],
  fixing: [38, 45, 65, 78, 85, 72, 60, 52, 48, 45, 42, 40],
  recovered: [40, 35, 28, 22, 18, 15, 14, 13, 12, 13, 14, 12],
  complete: [12, 13, 12, 11, 13, 12, 14, 12, 13, 11, 12, 13],
};

function getColor(phase: DemoPhase): { stroke: string; fill: string; text: string } {
  switch (phase) {
    case "idle":
    case "complete":
      return { stroke: "#059669", fill: "#059669", text: "text-success" };
    case "provisioning":
    case "diagnosing":
      return { stroke: "#0284c7", fill: "#0284c7", text: "text-info" };
    case "approval":
      return { stroke: "#d97706", fill: "#d97706", text: "text-warning" };
    case "fixing":
      return { stroke: "#dc2626", fill: "#dc2626", text: "text-destructive" };
    case "recovered":
      return { stroke: "#059669", fill: "#059669", text: "text-success" };
    default:
      return { stroke: "#059669", fill: "#059669", text: "text-success" };
  }
}

function getLabel(phase: DemoPhase): string {
  switch (phase) {
    case "idle": return "CPU · idle";
    case "provisioning": return "CPU · provisioning";
    case "diagnosing": return "CPU · diagnostics";
    case "approval": return "CPU · awaiting";
    case "fixing": return "CPU · applying fix";
    case "recovered": return "CPU · recovered";
    case "complete": return "CPU · stable";
    default: return "CPU · idle";
  }
}

function getCurrentUsage(phase: DemoPhase): number {
  const data = PHASE_CPU_DATA[phase];
  return data[data.length - 1] ?? 0;
}

export function CpuSparkline({ phase, className }: { phase: DemoPhase; className?: string }) {
  const [animatedData, setAnimatedData] = useState(PHASE_CPU_DATA[phase]);
  const colors = getColor(phase);

  useEffect(() => {
    const target = PHASE_CPU_DATA[phase];
    const start = animatedData;
    const steps = 12;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedData(
        target.map((t, i) => {
          const s = start[i] ?? t;
          return Math.round(s + (t - s) * eased);
        })
      );

      if (step >= steps) clearInterval(interval);
    }, 30);

    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    const jitterInterval = setInterval(() => {
      setAnimatedData(prev => {
        const base = PHASE_CPU_DATA[phase];
        return prev.map((val, i) => {
          const target = base[i] ?? val;
          const drift = Math.round((Math.random() - 0.5) * 6);
          const next = val + drift;
          const clamped = Math.max(2, Math.min(98, next));
          const pull = Math.round((target - clamped) * 0.3);
          return clamped + pull;
        });
      });
    }, 800);

    return () => clearInterval(jitterInterval);
  }, [phase]);

  const usage = animatedData[animatedData.length - 1] ?? 0;

  return (
    <div className={cn(
      "flex items-center gap-1.5 rounded-lg border border-border/50 bg-background/95 backdrop-blur-sm px-1.5 py-1 shadow-lg",
      "sm:gap-2 sm:px-2.5 sm:py-1.5",
      className
    )}>
      <div className="flex flex-col gap-0.5">
        <span className={cn("font-mono text-[8px] font-medium leading-none sm:text-[10px]", colors.text)}>
          {usage}%
        </span>
        <span className="hidden text-[8px] leading-none text-muted-foreground sm:block sm:text-[9px]">
          {getLabel(phase)}
        </span>
      </div>
      <Sparkline
        data={animatedData}
        width={48}
        height={20}
        strokeColor={colors.stroke}
        fillColor={colors.fill}
        strokeWidth={1.5}
      />
    </div>
  );
}
