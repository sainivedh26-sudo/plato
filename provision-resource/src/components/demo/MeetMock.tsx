import {
  Mic,
  MicOff,
  VideoIcon,
  MonitorUp,
  Hand,
  MoreVertical,
  PhoneOff,
  Users,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { TENANT } from "./scenario";
import { LiveDot } from "./primitives";

/** Stage S3 — the customer joins the meeting with the assigned FDE sub-agent. */
export function MeetMock() {
  return (
    <div className="overflow-hidden rounded-lg border border-border-strong bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <LiveDot />
          <span className="font-medium text-foreground">
            meet.pingram.io/dlt-4821-nwl
          </span>
          <span>· recording on · 12:04</span>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3.5 text-success" /> Audited session
        </span>
      </div>

      <div className="grid gap-3 bg-background/60 p-3 md:grid-cols-[1.35fr_1fr]">
        <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-elevated sm:aspect-video">
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="relative flex h-full flex-col items-center justify-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary sm:size-16 sm:text-lg">
              DT
            </div>
            <p className="text-xs font-medium sm:text-sm">Plato · FDE sub-agent</p>
            <p className="text-[10px] text-muted-foreground sm:text-[11px]">
              agent-c0fa10e0 · presenting diagnostics
            </p>
          </div>
          <span className="absolute bottom-2 left-2 rounded bg-background/80 px-2 py-0.5 text-[10px]">
            Plato
          </span>
        </div>

        <div className="space-y-3">
          <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-elevated sm:aspect-video">
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent sm:size-11 sm:text-sm">
                PN
              </div>
              <p className="text-[11px] sm:text-xs">Thala · {TENANT.name}</p>
            </div>
            <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-background/80 px-2 py-0.5 text-[10px]">
              <Mic className="size-3" /> Thala
            </span>
          </div>
          <div className="rounded-lg border border-border bg-elevated/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Shared context
            </p>
            <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
              <li>Ticket {TENANT.ticket} · P1 · checkout impacted</li>
              <li>Cluster {TENANT.cluster} · {TENANT.region}</li>
              <li>Sandbox sbx-7f21c · read-only · 28m left</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 overflow-x-auto border-t border-border px-2 py-2.5 sm:gap-2 sm:px-4 sm:py-3">
        {[Mic, VideoIcon, MonitorUp, Hand, MessageSquare, Users, MoreVertical].map(
          (Icon, i) => (
            <span
              key={i}
              className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-elevated text-muted-foreground sm:size-8"
            >
              <Icon className="size-3 sm:size-3.5" />
            </span>
          ),
        )}
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-destructive/90 text-destructive-foreground sm:size-8">
          <PhoneOff className="size-3 sm:size-3.5" />
        </span>
        <span className="sr-only">
          <MicOff />
        </span>
      </div>
    </div>
  );
}
