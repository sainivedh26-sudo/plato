import { useEffect, useRef, useState } from "react";
import {
  ShieldAlert,
  Database,
  Activity,
  MessagesSquare,
  Loader2,
  CircleCheck,
  Check,
  Send,
  Terminal,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Pill, SectionLabel } from "./primitives";
import { CONVERSATION, DB_ROWS, TENANT, WORKER_EVENTS } from "./scenario";
import { MailboxApproval } from "./Mailbox";
import { LangGraphTrace } from "./LangGraphTrace";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimateDigits } from "@/components/ui/animate-digits";
import { StageProgress } from "@/components/ui/stage-progress";
import { ThinkingOrb } from "@/components/ui/thinking-orb";
import { TourCallout } from "@/components/demo/TourCallout";
import { useDemoTour } from "@/hooks/useDemoTour";

const TAB = {
  conversation: {
    label: "Conversation",
    icon: MessagesSquare,
    description: "Real-time dialogue between the agent and customer",
  },
  worker: {
    label: "Worker Activity",
    icon: Activity,
    description: "LangGraph execution traces showing agent reasoning steps",
  },
  db: {
    label: "Audit Log",
    icon: Database,
    description: "Tamper-evident record of every action in CockroachDB",
  },
} as const;

type TabKey = keyof typeof TAB;

const STAGE_ITEMS = [
  {
    label: "Tenant Context Loaded",
    description: "Hydrated from persistent memory",
    status: "completed" as const,
    duration: "0.3s",
  },
  {
    label: "Similar Incident Match",
    description: "INC-2291 matched at 0.91",
    status: "completed" as const,
    duration: "0.8s",
  },
  {
    label: "Sandbox Provisioned",
    description: "Read-only session sbx-7f21c",
    status: "completed" as const,
    duration: "1.2s",
  },
  {
    label: "Diagnostics Running",
    description: "docker ps, logs, inspect",
    status: "active" as const,
    duration: "2.4s",
  },
  {
    label: "Root Cause Identified",
    description: "Missing REQUIRED_API_KEY",
    status: "pending" as const,
  },
  {
    label: "Approval Requested",
    description: "Awaiting human approval",
    status: "pending" as const,
  },
  {
    label: "Fix Applied",
    description: "Container recreated",
    status: "pending" as const,
  },
  {
    label: "Verification Complete",
    description: "HTTP 200 · 3/3 healthy",
    status: "pending" as const,
  },
];

type DemoPhase =
  "idle" | "provisioning" | "diagnosing" | "approval" | "fixing" | "recovered" | "complete";

export function DiagnosisWorkspace({
  onComplete,
  onPhaseChange,
}: {
  onComplete: () => void;
  onPhaseChange?: (phase: DemoPhase) => void;
}) {
  const [view, setView] = useState<"live" | "diagnosis">("live");
  const [tab, setTab] = useState<TabKey>("conversation");
  const [cursor, setCursor] = useState(1);
  const [approved, setApproved] = useState(false);
  const [suggestionClicked, setSuggestionClicked] = useState<Record<string, boolean>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [agentState, setAgentState] = useState<"idle" | "thinking" | "solving" | "responding">(
    "idle",
  );
  const [showApprovalFocus, setShowApprovalFocus] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cmdScrollRef = useRef<HTMLDivElement>(null);
  const approvalRef = useRef<HTMLDivElement>(null);
  const suggestionRef = useRef<HTMLButtonElement>(null);
  const tourTriggered = useRef<Record<string, boolean>>({});
  const { highlightElement, startTour, hasSeenTour, callout, dismissCallout } = useDemoTour();

  const visible = CONVERSATION.slice(0, cursor);
  const current = CONVERSATION[cursor - 1];
  const isCustomerPause = current?.actor === "customer" && !suggestionClicked[current.id];
  const isApprovalPause = current?.approval && !approved;
  const finished = cursor >= CONVERSATION.length;

  // Timer
  useEffect(() => {
    if (finished) return;
    const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [finished]);

  // Agent state simulation
  useEffect(() => {
    if (finished || isCustomerPause || isApprovalPause) {
      setAgentState("idle");
      return;
    }
    const thinkTimer = setTimeout(() => setAgentState("thinking"), 300);
    const solveTimer = setTimeout(() => setAgentState("solving"), 1200);
    const respondTimer = setTimeout(() => setAgentState("responding"), 2000);
    return () => {
      clearTimeout(thinkTimer);
      clearTimeout(solveTimer);
      clearTimeout(respondTimer);
    };
  }, [cursor, finished, isCustomerPause, isApprovalPause]);

  useEffect(() => {
    if (finished || isCustomerPause || isApprovalPause) return;
    const timer = setTimeout(() => setCursor((c) => c + 1), 2800);
    return () => clearTimeout(timer);
  }, [cursor, finished, isCustomerPause, isApprovalPause]);

  // Phase change notifications
  useEffect(() => {
    if (!onPhaseChange) return;
    if (isApprovalPause) {
      onPhaseChange("approval");
    } else if (cursor > 14 && !approved && !finished) {
      onPhaseChange("fixing");
    } else if (approved && cursor > 15 && !finished) {
      onPhaseChange("recovered");
    } else if (!finished && !isCustomerPause) {
      onPhaseChange("diagnosing");
    }
  }, [cursor, isApprovalPause, approved, finished, isCustomerPause, onPhaseChange]);

  // Auto-scroll conversation
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [cursor, tab]);

  // Auto-scroll commands with slight delay for smooth effect
  useEffect(() => {
    const timer = setTimeout(() => {
      cmdScrollRef.current?.scrollTo({
        top: cmdScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [cursor]);

  // Auto-scroll to approval when it appears
  useEffect(() => {
    if (isApprovalPause && approvalRef.current) {
      setTimeout(() => {
        approvalRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setShowApprovalFocus(true);
        setTimeout(() => setShowApprovalFocus(false), 3000);
      }, 500);
    }
  }, [isApprovalPause]);

  // Auto-scroll to suggestion when it appears
  useEffect(() => {
    if (isCustomerPause && suggestionRef.current) {
      setTimeout(() => {
        suggestionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    }
  }, [isCustomerPause]);

  // Session intro tour on mount
  useEffect(() => {
    if (hasSeenTour()) return;
    if (tourTriggered.current["session-intro"]) return;

    const timer = setTimeout(() => {
      tourTriggered.current["session-intro"] = true;
      startTour("session-intro", [
        {
          element: "[data-tour='session-live-badge']",
          popover: {
            title: "Live session",
            description:
              "You're now in a live diagnosis session. The agent is actively investigating the incident in real-time.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "[data-tour='session-conversation-pane']",
          popover: {
            title: "Live diagnosis session",
            description:
              "Watch the agent diagnose the issue in real-time. The conversation shows the agent's analysis, while the panels on the right display the technical execution. You'll be prompted when your input is needed.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "[data-tour='session-command-pane']",
          popover: {
            title: "Command execution",
            description:
              "Every command the agent runs is shown here. Read-only commands run automatically; mutating actions are gated behind your approval.",
            side: "left",
            align: "start",
          },
        },
        {
          element: "[data-tour='session-stage-progress']",
          popover: {
            title: "Stage progress",
            description:
              "Track the agent's progress through the incident lifecycle — from context loading to verification.",
            side: "left",
            align: "start",
          },
        },
      ]);
    }, 600);

    return () => clearTimeout(timer);
  }, [hasSeenTour, startTour]);

  // Suggestion tour
  useEffect(() => {
    if (hasSeenTour()) return;
    if (!isCustomerPause) return;
    if (tourTriggered.current["session-suggestion"]) return;

    const timer = setTimeout(() => {
      tourTriggered.current["session-suggestion"] = true;
      highlightElement(
        "[data-tour='session-suggestion-btn']",
        "Respond as the customer",
        "Click this suggested response to continue the conversation. The agent will proceed with its analysis based on your input.",
        "top",
      );
    }, 600);

    return () => clearTimeout(timer);
  }, [isCustomerPause, highlightElement, hasSeenTour]);

  // Approval tour
  useEffect(() => {
    if (hasSeenTour()) return;
    if (!isApprovalPause) return;
    if (tourTriggered.current["session-approval"]) return;

    const timer = setTimeout(() => {
      tourTriggered.current["session-approval"] = true;
      highlightElement(
        "[data-tour='session-approval-box']",
        "Approval required",
        "The agent has identified the root cause and proposes a fix. Review the details and approve. This is the only mutating action in the workflow — all others are read-only.",
        "top",
      );
    }, 800);

    return () => clearTimeout(timer);
  }, [isApprovalPause, highlightElement, hasSeenTour]);

  // Diagnosis switch tour — appears after approval while still in live view
  useEffect(() => {
    if (hasSeenTour()) return;
    if (!approved) return;
    if (view !== "live") return;
    if (tourTriggered.current["session-diagnosis-switch"]) return;

    const timer = setTimeout(() => {
      tourTriggered.current["session-diagnosis-switch"] = true;
      highlightElement(
        "[data-tour='session-diagnosis-toggle']",
        "Explore diagnosis details",
        "Click the Diagnosis tab to see the full technical breakdown — conversation history, agent reasoning traces, and the tamper-evident audit log.",
        "bottom",
      );
    }, 600);

    return () => clearTimeout(timer);
  }, [approved, view, highlightElement, hasSeenTour]);

  // Diagnosis tabs tour — auto-cycles through tabs after switching to diagnosis
  useEffect(() => {
    if (hasSeenTour()) return;
    if (view !== "diagnosis") return;
    if (!approved) return;
    if (tourTriggered.current["session-diagnosis-tabs"]) return;

    const timer = setTimeout(() => {
      tourTriggered.current["session-diagnosis-tabs"] = true;
      startTour("session-diagnosis-tabs", [
        {
          element: "[data-tour='session-diagnosis-tabs']",
          onHighlighted: (_el, _step, _opts) => {
            setTab("conversation");
          },
          popover: {
            title: "Conversation",
            description:
              "Review the full dialogue between the agent and customer throughout the incident.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "[data-tour='session-diagnosis-tabs']",
          onHighlighted: (_el, _step, _opts) => {
            setTab("worker");
          },
          popover: {
            title: "Worker Activity",
            description:
              "See LangGraph execution traces showing every reasoning step the agent took.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "[data-tour='session-diagnosis-tabs']",
          onHighlighted: (_el, _step, _opts) => {
            setTab("db");
          },
          popover: {
            title: "Audit Log",
            description: "Every action is recorded to a tamper-evident CockroachDB audit trail.",
            side: "bottom",
            align: "start",
          },
        },
      ]);
    }, 400);

    return () => clearTimeout(timer);
  }, [view, approved, startTour, hasSeenTour]);

  // Report button tour
  useEffect(() => {
    if (hasSeenTour()) return;
    if (!finished) return;
    if (tourTriggered.current["session-report"]) return;

    const timer = setTimeout(() => {
      tourTriggered.current["session-report"] = true;
      highlightElement(
        "[data-tour='session-report-btn']",
        "Session complete",
        "Click to view the full session report with root cause, fix details, verification results, and audit trail.",
        "bottom",
      );
    }, 600);

    return () => clearTimeout(timer);
  }, [finished, highlightElement, hasSeenTour]);

  const visibleCommands = visible.filter((e) => e.command);
  const progress = Math.round((cursor / CONVERSATION.length) * 100);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSuggestionClick = (entryId: string) => {
    setSuggestionClicked((prev) => ({ ...prev, [entryId]: true }));
    setCursor((c) => c + 1);
  };

  const handleApprove = () => {
    setApproved(true);
    setCursor((c) => c + 1);
    if (onPhaseChange) onPhaseChange("fixing");
  };

  const updateStageStatus = (index: number): "completed" | "active" | "pending" => {
    if (cursor > index + 2) return "completed";
    if (cursor === index + 2) return "active";
    return "pending";
  };

  const stageItems = STAGE_ITEMS.map((item, i) => ({
    ...item,
    status: updateStageStatus(i),
  }));

  return (
    <div className="rounded-xl overflow-hidden bg-background">
      {/* Non-blocking tour callout for interactive single-step guides */}
      {callout?.show && (
        <TourCallout
          selector={callout.selector}
          title={callout.title}
          description={callout.description}
          side={callout.side}
          onDismiss={dismissCallout}
        />
      )}
      <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
        {/* Top control bar with liquid glass */}
        <div className="liquid-glass rounded-xl p-2 sm:p-3">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <div className="inline-flex rounded-full border border-border/50 bg-muted/50 p-0.5 sm:p-1">
              {(["live", "diagnosis"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  data-tour={v === "diagnosis" ? "session-diagnosis-toggle" : undefined}
                  className={cn(
                    "rounded-full px-3 py-1 text-[10px] font-medium capitalize transition-all sm:px-4 sm:py-1.5 sm:text-xs",
                    view === v
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {v === "live" ? "Live" : "Diagnosis"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-2 py-1 sm:gap-2 sm:px-3 sm:py-1.5">
                <Clock className="size-2.5 text-primary sm:size-3" />
                <AnimateDigits
                  value={formatTime(elapsedSeconds)}
                  className="font-mono text-[10px] text-foreground sm:text-xs"
                  digitClassName="text-foreground"
                  animationDelay={100}
                />
              </div>

              <Badge
                variant="success"
                data-tour="session-live-badge"
                className="gap-1 text-[9px] sm:gap-1.5 sm:text-[10px]"
              >
                <span className="live-dot inline-block size-1 rounded-full bg-success sm:size-1.5" />
                <span className="hidden sm:inline">sbx-7f21c</span>
                <span className="sm:hidden">live</span>
              </Badge>
              <Badge variant="info" className="text-[9px] sm:text-[10px]">
                {progress}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Left: Conversation / Worker / DB */}
          <div
            data-tour="session-conversation-pane"
            className="liquid-glass rounded-xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-border/50 bg-surface/30 px-3 py-2 sm:px-4 sm:py-2.5">
              {view === "diagnosis" ? (
                <div className="space-y-1">
                  <nav data-tour="session-diagnosis-tabs" className="flex gap-1 overflow-x-auto">
                    {(Object.keys(TAB) as TabKey[]).map((k) => {
                      const Icon = TAB[k].icon;
                      return (
                        <button
                          key={k}
                          onClick={() => setTab(k)}
                          className={cn(
                            "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all sm:px-3 sm:text-[11px]",
                            tab === k
                              ? "border-primary/40 bg-primary/10 text-primary shadow-sm"
                              : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground",
                          )}
                        >
                          <Icon className="size-3 shrink-0" />
                          <span className="hidden sm:inline">{TAB[k].label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MessagesSquare className="size-3.5 text-primary" />
                  <SectionLabel>Conversation</SectionLabel>
                </div>
              )}

              {/* Thinking orb */}
              <div className="flex items-center gap-2">
                <ThinkingOrb state={agentState} size={32} />
                <span className="text-[10px] text-muted-foreground capitalize">{agentState}</span>
              </div>
            </div>
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-3 max-h-[400px] custom-scrollbar sm:p-4 sm:max-h-[520px]"
            >
              {view === "live" || tab === "conversation" ? (
                <ConversationPane
                  entries={visible}
                  isCustomerPause={isCustomerPause}
                  suggestionClicked={suggestionClicked}
                  onSuggestionClick={handleSuggestionClick}
                  agentState={agentState}
                  suggestionRef={suggestionRef}
                />
              ) : null}
              {tab === "worker" && view === "diagnosis" ? (
                <LangGraphTrace
                  events={WORKER_EVENTS.slice(0, Math.max(1, Math.ceil(cursor * 0.75)))}
                />
              ) : null}
              {tab === "db" && view === "diagnosis" ? <DbPane count={cursor} /> : null}
            </div>
          </div>

          {/* Right: Command Execution + Stage Progress */}
          <div className="flex flex-col gap-4">
            <div
              data-tour="session-command-pane"
              className="liquid-glass rounded-xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center gap-2 border-b border-border/50 bg-surface/30 px-3 py-2 sm:px-4 sm:py-2.5">
                <Terminal className="size-3.5 text-accent" />
                <SectionLabel>Command Execution</SectionLabel>
              </div>
              <div
                ref={cmdScrollRef}
                className="flex-1 overflow-y-auto p-3 max-h-[280px] custom-scrollbar sm:p-4 sm:max-h-[320px]"
              >
                <CommandPane commands={visibleCommands} />
              </div>
            </div>

            <div
              data-tour="session-stage-progress"
              className="liquid-glass rounded-xl overflow-hidden"
            >
              <div className="flex items-center gap-2 border-b border-border/50 bg-surface/30 px-3 py-2 sm:px-4 sm:py-2.5">
                <Activity className="size-3.5 text-primary" />
                <SectionLabel>Stage Progress</SectionLabel>
              </div>
              <div className="p-2">
                <StageProgress items={stageItems} />
              </div>
            </div>
          </div>
        </div>

        {/* Approval mailbox overlay */}
        {isApprovalPause ? (
          <div
            ref={approvalRef}
            data-tour="session-approval-box"
            className={cn(
              "liquid-glass-strong rounded-xl overflow-hidden border-warning/40 transition-all",
              showApprovalFocus && "highlight-glow",
            )}
          >
            <div className="flex items-center justify-between border-b border-border/50 bg-surface/30 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 text-warning" />
                <SectionLabel>Approval Required</SectionLabel>
              </div>
              <Badge variant="warning">Awaiting Response</Badge>
            </div>
            <div className="p-4">
              <MailboxApproval onApprove={handleApprove} approved={approved} />
            </div>
          </div>
        ) : null}

        {/* Bottom status bar */}
        <div className="liquid-glass rounded-xl px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs">
            {isApprovalPause ? (
              <>
                <ShieldAlert className="size-3 text-warning sm:size-3.5" />
                <span className="text-muted-foreground">Waiting for approval</span>
              </>
            ) : isCustomerPause ? (
              <>
                <MessagesSquare className="size-3 text-primary sm:size-3.5" />
                <span className="text-muted-foreground">Waiting for response</span>
              </>
            ) : finished ? (
              <>
                <Check className="size-3 text-success sm:size-3.5" />
                <span className="text-success font-medium">Session complete</span>
              </>
            ) : (
              <>
                <Loader2 className="size-3 animate-spin text-primary sm:size-3.5" />
                <span className="text-muted-foreground">Session in progress</span>
              </>
            )}
          </div>
        </div>

        {finished ? (
          <Button
            data-tour="session-report-btn"
            onClick={onComplete}
            variant="success"
            size="lg"
            className="w-full liquid-glass"
          >
            <Check className="size-4" />
            View Session Report
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ConversationPane({
  entries,
  isCustomerPause,
  suggestionClicked,
  onSuggestionClick,
  agentState,
  suggestionRef,
}: {
  entries: typeof CONVERSATION;
  isCustomerPause: boolean;
  suggestionClicked: Record<string, boolean>;
  onSuggestionClick: (id: string) => void;
  agentState: "idle" | "thinking" | "solving" | "responding";
  suggestionRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const [typingMessage, setTypingMessage] = useState<string | null>(null);
  const [typedText, setTypedText] = useState("");
  const [typingEntryId, setTypingEntryId] = useState<string | null>(null);
  const onSuggestionClickRef = useRef(onSuggestionClick);
  onSuggestionClickRef.current = onSuggestionClick;

  useEffect(() => {
    if (typingMessage && typingEntryId) {
      let i = 0;
      const interval = setInterval(() => {
        if (i < typingMessage.length) {
          setTypedText(typingMessage.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            const entryId = typingEntryId;
            setTypingMessage(null);
            setTypedText("");
            setTypingEntryId(null);
            onSuggestionClickRef.current(entryId);
          }, 500);
        }
      }, 25);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [typingMessage, typingEntryId]);

  const handleSuggestionClick = (entryId: string, message: string) => {
    setTypingEntryId(entryId);
    setTypingMessage(message);
    setTypedText("");
  };

  return (
    <div className="space-y-4">
      {entries.map((e) => {
        // Skip customer entries that are currently being typed
        if (e.id === typingEntryId) return null;

        return (
          <div key={e.id} className="space-y-2">
            {e.actor === "system" ? (
              <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
                {e.text}
              </div>
            ) : (
              <div className={cn("flex gap-3", e.actor === "customer" && "flex-row-reverse")}>
                <span
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    e.actor === "agent"
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "bg-accent/15 text-accent border border-accent/30",
                  )}
                >
                  {e.actor === "agent" ? "DT" : "PN"}
                </span>
                <div
                  className={cn(
                    "max-w-[76%] text-sm leading-relaxed",
                    e.actor === "customer"
                      ? "rounded-2xl rounded-tr-sm bg-secondary/50 px-3.5 py-2.5 text-secondary-foreground"
                      : "text-foreground",
                  )}
                >
                  {e.text}
                </div>
              </div>
            )}

            {e.actor === "customer" &&
            e.suggestion &&
            !suggestionClicked[e.id] &&
            e.id !== typingEntryId ? (
              <div className="flex justify-end">
                <Button
                  ref={suggestionRef}
                  data-tour="session-suggestion-btn"
                  onClick={() => handleSuggestionClick(e.id, e.suggestion!)}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-2 border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 transition-all",
                    isCustomerPause && "highlight-pulse",
                  )}
                >
                  <Send className="size-3" />
                  {e.suggestion}
                </Button>
              </div>
            ) : null}
          </div>
        );
      })}

      {/* Typing animation for customer message */}
      {typingMessage && (
        <div className="flex gap-3 flex-row-reverse">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold bg-accent/15 text-accent border border-accent/30">
            PN
          </span>
          <div className="max-w-[76%] rounded-2xl rounded-tr-sm bg-secondary/50 px-3.5 py-2.5 text-secondary-foreground">
            <span>{typedText}</span>
            <span className="inline-block w-0.5 h-4 bg-foreground ml-0.5 animate-pulse" />
          </div>
        </div>
      )}

      {/* Agent thinking indicator */}
      {agentState !== "idle" &&
        !isCustomerPause &&
        !typingMessage &&
        !entries[entries.length - 1]?.approval && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <ThinkingOrb state={agentState} size={20} />
            <span className="capitalize">
              {agentState === "thinking"
                ? "Analyzing..."
                : agentState === "solving"
                  ? "Investigating..."
                  : "Responding..."}
            </span>
          </div>
        )}
    </div>
  );
}

function CommandPane({ commands }: { commands: typeof CONVERSATION }) {
  if (commands.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
        <Terminal className="size-8 opacity-20" />
        <span>No commands executed yet</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {commands.map((e) => {
        if (!e.command) return null;
        const cmd = e.command;
        return (
          <div
            key={e.id}
            className="rounded-xl border border-border/50 bg-surface/50 overflow-hidden shadow-sm"
          >
            <div className="flex items-center gap-2 border-b border-border/50 bg-surface/30 px-3.5 py-2.5">
              <span className="flex size-5 items-center justify-center rounded-md bg-accent/15 text-[10px] font-bold text-accent">
                $
              </span>
              <span className="font-mono text-[11px] text-accent font-medium flex-1 truncate">
                {cmd.name}
              </span>
              <Badge
                variant={
                  cmd.kind === "write" ? "warning" : cmd.kind === "verify" ? "success" : "secondary"
                }
                className="text-[9px]"
              >
                {cmd.kind === "write" ? "mutating" : cmd.kind === "verify" ? "verified" : "read"}
              </Badge>
            </div>
            {cmd.args ? (
              <div className="border-b border-border/50 px-3.5 py-2 bg-muted/20">
                <span className="font-mono text-[10px] text-muted-foreground">{cmd.args}</span>
              </div>
            ) : null}
            <div className="px-3.5 py-3">
              <pre className="whitespace-pre-wrap font-mono text-[11px] text-foreground leading-relaxed custom-scrollbar overflow-x-auto">
                {cmd.output}
              </pre>
            </div>
            <div className="flex items-center gap-1.5 border-t border-border/50 px-3.5 py-2 bg-success/5">
              <CircleCheck className="size-3 text-success" />
              <span className="text-[10px] text-success font-medium">Completed</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DbPane({ count }: { count: number }) {
  const rows = DB_ROWS.slice(0, Math.max(1, Math.ceil(count * 0.65)));
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2 font-mono text-[11px] text-muted-foreground">
        <span className="text-primary">SELECT</span> id, ts, actor, action, risk{" "}
        <span className="text-primary">FROM</span> audit_events{" "}
        <span className="text-primary">WHERE</span> ticket = &apos;
        {TENANT.ticket}
        &apos; <span className="text-primary">ORDER BY</span> ts;
      </div>
      <div className="overflow-x-auto rounded-xl border border-border/50 shadow-sm">
        <table className="w-full text-left font-mono text-[11px]">
          <thead className="bg-surface/50 text-muted-foreground border-b border-border/50">
            <tr>
              {["id", "ts", "actor", "action", "risk"].map((h) => (
                <th
                  key={h}
                  className="px-3.5 py-2.5 font-medium text-[10px] uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-3.5 py-2 text-muted-foreground">{r.id}</td>
                <td className="px-3.5 py-2 text-muted-foreground">{r.ts}</td>
                <td className="px-3.5 py-2">{r.actor}</td>
                <td className="px-3.5 py-2 text-accent">{r.action}</td>
                <td className="px-3.5 py-2">
                  <Badge
                    variant={r.risk === "medium" ? "warning" : "success"}
                    className="text-[9px]"
                  >
                    {r.risk}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
        <Database className="size-3" />
        {rows.length} of {DB_ROWS.length} audit rows replicated · CockroachDB Serverless ·
        nwl-orders
      </p>
    </div>
  );
}
