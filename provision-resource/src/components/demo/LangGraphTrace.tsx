import { cn } from "@/lib/utils";
import { SectionLabel } from "./primitives";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Cpu, Terminal, Clock } from "lucide-react";
import type { WorkerEvent } from "./scenario";

/** LangGraph trace-style worker activity viewer */
export function LangGraphTrace({ events }: { events: WorkerEvent[] }) {
  const grouped = groupByTurn(events);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Cpu className="size-3.5 text-primary" />
        <SectionLabel>LangGraph Traces</SectionLabel>
        <Badge variant="primary" className="gap-1">
          <span className="live-dot inline-block size-1.5 rounded-full bg-primary" />
          live
        </Badge>
      </div>

      <div className="space-y-3">
        {grouped.map((turn) => (
          <TraceTurn key={turn.turn} turn={turn} />
        ))}
      </div>
    </div>
  );
}

type TurnGroup = {
  turn: number;
  nodes: WorkerEvent[];
};

function groupByTurn(events: WorkerEvent[]): TurnGroup[] {
  const map = new Map<number, WorkerEvent[]>();
  for (const e of events) {
    if (!map.has(e.turn)) map.set(e.turn, []);
    map.get(e.turn)!.push(e);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([turn, nodes]) => ({ turn, nodes }));
}

function TraceTurn({ turn }: { turn: TurnGroup }) {
  return (
    <div className="rounded-xl border border-border bg-surface/60 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-border bg-surface px-3.5 py-2.5">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary border border-primary/30">
          {turn.turn}
        </span>
        <span className="text-xs font-semibold text-foreground">Turn {turn.turn}</span>
        <span className="ml-auto text-[11px] text-muted-foreground flex items-center gap-1">
          <Clock className="size-3" />
          {turn.nodes.length} node{turn.nodes.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="divide-y divide-border">
        {turn.nodes.map((node, i) => (
          <TraceNode key={i} node={node} />
        ))}
      </div>
    </div>
  );
}

function TraceNode({ node }: { node: WorkerEvent }) {
  const isModel = node.node === "model";
  const isTools = node.node === "tools";

  return (
    <div className="px-3.5 py-3">
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-lg text-[10px] font-bold border",
            isModel
              ? "bg-info/15 text-info border-info/30"
              : "bg-accent/15 text-accent border-accent/30",
          )}
        >
          {isModel ? "M" : "T"}
        </span>
        <span className="text-xs font-medium text-foreground">{node.node}</span>
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Clock className="size-3" />
          {node.duration}
        </span>
        {node.tokens ? (
          <span className="text-[11px] text-muted-foreground">· {node.tokens} tokens</span>
        ) : null}
        <span className="ml-auto">
          <Badge variant={node.status === "warn" ? "warning" : "success"} className="text-[9px]">
            {node.status}
          </Badge>
        </span>
      </div>

      {isModel && node.model ? (
        <p className="mt-2 ml-8 font-mono text-[11px] text-muted-foreground bg-muted/30 rounded-lg px-2.5 py-1.5 border border-border">
          {node.model}
        </p>
      ) : null}

      {isTools && node.command ? (
        <div className="mt-2 ml-8 space-y-1.5">
          <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-sm">
            <span className="font-mono text-[11px] text-foreground">
              <span className="text-muted-foreground">$ </span>
              {node.command}
            </span>
          </div>
          {node.output ? (
            <div className="rounded-lg border border-success/30 bg-success/5 px-3 py-2">
              <span className="font-mono text-[11px] text-success">{node.output}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
