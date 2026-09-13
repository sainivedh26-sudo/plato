import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export function GuideHint({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "action" | "info";
}) {
  const variants = {
    default: "bg-primary/5 border-primary/20 text-primary",
    action: "bg-warning/5 border-warning/30 text-warning",
    info: "bg-info/5 border-info/20 text-info",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-medium shadow-sm backdrop-blur-sm transition-all",
        variants[variant],
        className,
      )}
    >
      <Sparkles className="size-3 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
