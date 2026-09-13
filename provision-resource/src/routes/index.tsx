import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Cpu,
  Mail,
  Video,
  Stethoscope,
  FileCheck2,
  RotateCcw,
  Monitor,
  Play,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LiveDot, Panel, Pill, SectionLabel, StageFrame } from "@/components/demo/primitives";
import { BOOT_STEPS, SCENARIO, TENANT } from "@/components/demo/scenario";
import { GmailAssignment, GmailCompose } from "@/components/demo/GmailMock";
import { DiagnosisWorkspace } from "@/components/demo/DiagnosisWorkspace";
import { HoverExpand } from "@/components/ui/hover-expand";
import { Button } from "@/components/ui/button";
import { CpuSparkline } from "@/components/demo/CpuSparkline";
import { TourCallout } from "@/components/demo/TourCallout";
import { useDemoTour } from "@/hooks/useDemoTour";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Plato — FDE Support Agent Demo Console" },
      {
        name: "description",
        content:
          "Interactive enterprise demo: an FDE support agent diagnoses and safely remediates a live container incident with audited tooling, approvals and persistent memory.",
      },
      { property: "og:title", content: "Plato — FDE Support Agent Demo Console" },
      {
        property: "og:description",
        content:
          "Walk the full support workflow: ticket intake, sandbox provisioning, live diagnosis, human approval, verification and audit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DemoConsole,
});

const STEPS = [
  { key: "welcome", label: "Overview", icon: ShieldCheck },
  { key: "scenario", label: "Scenario", icon: Cpu },
  { key: "provision", label: "Environment", icon: Loader2 },
  { key: "ticket", label: "Ticket intake", icon: Mail },
  { key: "assign", label: "Agent assigned", icon: Video },
  { key: "session", label: "Live diagnosis", icon: Stethoscope },
  { key: "report", label: "Session report", icon: FileCheck2 },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

type DemoPhase = "idle" | "provisioning" | "diagnosing" | "approval" | "fixing" | "recovered" | "complete";

function DemoConsole() {
  const [step, setStep] = useState<StepKey>("welcome");
  const [demoPhase, setDemoPhase] = useState<DemoPhase>("idle");
  const index = STEPS.findIndex((s) => s.key === step);
  const { highlightElement, hasSeenTour, callout, dismissCallout } = useDemoTour();
  const tourTriggered = useRef<Record<string, boolean>>({});

  useEffect(() => {
    switch (step) {
      case "welcome":
      case "scenario":
        setDemoPhase("idle");
        break;
      case "provision":
        setDemoPhase("provisioning");
        break;
      case "ticket":
      case "assign":
        setDemoPhase("idle");
        break;
      case "session":
        if (demoPhase !== "fixing" && demoPhase !== "recovered") {
          setDemoPhase("diagnosing");
        }
        break;
      case "report":
        setDemoPhase("complete");
        break;
    }
  }, [step]);

  // Trigger tours when steps change — single-step callouts use highlightElement (driver.js highlight API)
  // multi-step tours (session-intro, session-diagnosis-tabs) use startTour (driver.js drive API)
  useEffect(() => {
    if (hasSeenTour()) return;

    const timeout = setTimeout(() => {
      switch (step) {
        case "welcome": {
          if (!tourTriggered.current["welcome"]) {
            tourTriggered.current["welcome"] = true;
            highlightElement(
              "[data-tour='welcome-get-started']",
              "Welcome to the Plato demo",
              "This walkthrough uses real AWS resources in an isolated demo account. You'll see tenant context loading, read-only diagnostics, human approval gating, and tamper-evident audit trails.",
              "bottom"
            );
          }
          break;
        }
        case "scenario": {
          if (!tourTriggered.current["scenario"]) {
            tourTriggered.current["scenario"] = true;
            highlightElement(
              "[data-tour='scenario-start-btn']",
              "Start the demo",
              "Click this button to begin. The environment will provision automatically, then you'll raise a support ticket and watch the agent diagnose and resolve the incident.",
              "bottom"
            );
          }
          break;
        }
        case "ticket": {
          if (!tourTriggered.current["ticket"]) {
            tourTriggered.current["ticket"] = true;
            highlightElement(
              "[data-tour='ticket-send-btn']",
              "Send the support ticket",
              "Click Send to raise the support ticket. This triggers the automated triage and agent assignment workflow.",
              "bottom"
            );
          }
          break;
        }
        case "assign": {
          if (!tourTriggered.current["assign"]) {
            tourTriggered.current["assign"] = true;
            highlightElement(
              "[data-tour='assign-join-btn']",
              "Join the diagnosis session",
              "Click to join the live support call. A dedicated FDE sub-agent has been assigned to handle this incident with a secure, audited session.",
              "bottom"
            );
          }
          break;
        }
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [step, highlightElement, hasSeenTour]);

  return (
    <main className="relative min-h-screen">
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

      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-white px-6 sm:hidden">
        <Monitor className="h-10 w-10 text-[var(--foreground)]" />
        <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">Desktop required</h2>
        <p className="max-w-xs text-center text-sm leading-relaxed text-[var(--muted-foreground)]">
          This demo is designed for a larger screen. Please switch to desktop for the best experience.
        </p>
      </div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "var(--gradient-shell)" }}
      />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.35]" />

      <div className="relative mx-auto w-full max-w-6xl px-5 py-8">
        <header className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="/plato-removebg-preview.png" alt="Plato" className="h-7 w-auto sm:h-9" />
            <div>
              <h1 className="text-xs font-semibold tracking-tight sm:text-sm">
                Plato · FDE Agent
              </h1>
              <p className="text-[10px] text-muted-foreground sm:text-xs">
                Guided demo · live AWS resources
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Pill tone="success">
              <LiveDot /> <span className="hidden sm:inline">demo</span> environment
            </Pill>
            <Button
              onClick={() => {
                setStep("welcome");
                setDemoPhase("idle");
                tourTriggered.current = {};
              }}
              variant="ghost"
              size="sm"
              className="gap-1.5"
            >
              <RotateCcw className="size-3" /> <span className="hidden sm:inline">Restart</span>
            </Button>
          </div>
        </header>

        <nav className="mt-6 flex justify-start">
          <HoverExpand
            items={STEPS.map((s, i) => ({
              label: s.label,
              status: i < index ? "completed" : i === index ? "active" : "pending",
            }))}
          />
        </nav>

        <section className="mt-6">
          {step === "welcome" ? <Welcome onNext={() => setStep("scenario")} /> : null}
          {step === "scenario" ? <Scenario onNext={() => setStep("provision")} /> : null}
          {step === "provision" ? <Provision onDone={() => setStep("ticket")} /> : null}
          {step === "ticket" ? <TicketStage onNext={() => setStep("assign")} /> : null}
          {step === "assign" ? <AssignStage onNext={() => setStep("session")} /> : null}
          {step === "session" ? (
            <StageFrame
              step="S3 · S4"
              title="Live session and diagnosis"
              subtitle="Conversation, environment status, tool execution, approvals and memory in one console"
              right={<Pill tone="primary">audited</Pill>}
            >
              <DiagnosisWorkspace
                onComplete={() => setStep("report")}
                onPhaseChange={setDemoPhase}
              />
            </StageFrame>
          ) : null}
          {step === "report" ? <Report onRestart={() => setStep("welcome")} /> : null}
        </section>

        <footer className="mt-10 border-t border-border pt-4 text-[11px] text-muted-foreground">
          Every action in this demo is simulated against the same guardrails used in production:
          least-privilege sandbox access, explicit human approval for mutating steps, and a sealed
          audit trail.
        </footer>
      </div>

      {step === "session" && (
        <div className="fixed bottom-4 left-4 z-40 sm:bottom-6 sm:left-6">
          <CpuSparkline phase={demoPhase} />
        </div>
      )}
    </main>
  );
}

function Welcome({ onNext }: { onNext: () => void }) {
  return (
    <Panel className="overflow-hidden">
      <div className="grid gap-6 p-5 sm:gap-8 sm:p-8 md:grid-cols-[1.2fr_1fr] md:p-10">
        <div>
          <Pill tone="primary">Enterprise demo</Pill>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:mt-4 sm:text-3xl">
            Welcome to the Plato demo
          </h2>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground sm:mt-3 sm:text-sm">
            Plato is a forward-deployed engineering agent that resolves live production incidents
            with your customers. This walkthrough uses real AWS resources in an isolated demo
            account and follows the exact operating procedure used with enterprise tenants.
          </p>

          <div className="mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:items-center">
            <Button
              data-tour="welcome-get-started"
              onClick={onNext}
              size="lg"
              className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105"
            >
              Get started <ArrowRight className="size-4" />
            </Button>
            <span className="text-[11px] text-muted-foreground sm:text-xs">
              Takes about 3 minutes to complete
            </span>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface/60 p-4 sm:p-5">
          <SectionLabel>Demo tenant</SectionLabel>
          <dl className="mt-3 space-y-2 text-xs sm:space-y-2.5">
            {[
              ["Organisation", TENANT.name],
              ["Plan", TENANT.tier],
              ["Region", TENANT.region],
              ["Ticket", TENANT.ticket],
              ["Cluster", TENANT.cluster],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-mono text-[10px] sm:text-[11px]">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground sm:mt-5 sm:text-[11px]">
            Demo resources are provisioned on demand and destroyed when the session ends. No
            customer data is used.
          </p>
        </div>
      </div>
    </Panel>
  );
}

function Scenario({ onNext }: { onNext: () => void }) {
  const [enabled, setEnabled] = useState(true);
  return (
    <StageFrame
      step="Step 01"
      title="Available scenario"
      subtitle={SCENARIO.id}
      right={
        <button
          onClick={() => setEnabled((v) => !v)}
          className={cn(
            "flex h-6 w-11 items-center rounded-full p-0.5 transition-colors",
            enabled ? "bg-success" : "bg-muted",
          )}
          aria-label="Toggle scenario"
        >
          <span
            className={cn(
              "size-5 rounded-full bg-background transition-transform",
              enabled && "translate-x-5",
            )}
          />
        </button>
      }
    >
      <div className="grid gap-4 sm:gap-6 md:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <div className="border-l-2 border-primary/60 pl-3 sm:pl-4">
            <h3 className="text-sm font-semibold sm:text-base">{SCENARIO.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">{SCENARIO.summary}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              data-tour="scenario-start-btn"
              onClick={onNext}
              disabled={!enabled}
              variant="warning"
              size="lg"
              className="w-full gap-2 shadow-lg shadow-warning/20 hover:shadow-xl hover:shadow-warning/30 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 sm:w-auto"
            >
              <Play className="size-4" /> Start demo
            </Button>
            <span className="text-[11px] text-muted-foreground">
              Click to begin the guided walkthrough
            </span>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface/60 p-3 sm:p-4">
          <SectionLabel>Resources used</SectionLabel>
          <dl className="mt-3 space-y-2 text-xs sm:space-y-2.5">
            {SCENARIO.resources.map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">{r.label}</dt>
                <dd className="font-mono text-[10px] text-right sm:text-[11px]">{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </StageFrame>
  );
}

function Provision({ onDone }: { onDone: () => void }) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (done >= BOOT_STEPS.length) {
      const t = setTimeout(onDone, 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDone((d) => d + 1), 800);
    return () => clearTimeout(t);
  }, [done, onDone]);

  return (
    <StageFrame
      step="Step 02"
      title="Provisioning demo environment"
      subtitle="Spinning up an isolated instance, please wait"
      right={<Pill tone="warning">provisioning</Pill>}
    >
      <div className="mx-auto max-w-xl space-y-2">
        {BOOT_STEPS.map((s, i) => (
          <div
            key={s}
            className={cn(
              "flex items-center gap-3 rounded-md border px-3 py-2 text-xs transition-colors sm:text-sm",
              i < done
                ? "border-success/30 bg-success/5 text-foreground"
                : i === done
                  ? "border-warning/40 bg-warning/5 text-foreground"
                  : "border-border text-muted-foreground",
            )}
          >
            {i < done ? (
              <CheckCircle2 className="size-3.5 text-success sm:size-4" />
            ) : i === done ? (
              <Loader2 className="size-3.5 animate-spin text-warning sm:size-4" />
            ) : (
              <span className="size-3.5 rounded-full border border-border sm:size-4" />
            )}
            {s}
          </div>
        ))}
      </div>
    </StageFrame>
  );
}

function TicketStage({ onNext }: { onNext: () => void }) {
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (!sent) return;
    const t = setTimeout(onNext, 1400);
    return () => clearTimeout(t);
  }, [sent, onNext]);

  return (
    <StageFrame
      step="S1"
      title="Customer raises a ticket"
      subtitle="Intake arrives over email and is normalised into a ticket"
      right={<Pill tone="info">inbound</Pill>}
    >
      <div className="space-y-3">
        <GmailCompose
          sent={sent}
          onSend={() => setSent(true)}
          sendButtonProps={{ ...({ "data-tour": "ticket-send-btn" } as any) }}
        />

        {sent ? (
          <div className="rounded-lg border border-success/30 bg-success/5 p-3">
            <p className="flex items-center gap-2 text-xs text-success">
              <CheckCircle2 className="size-3.5" />
              <span>
                <strong>Ticket {TENANT.ticket} created</strong> · triaged P1 · routing to an FDE sub-agent
              </span>
            </p>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Moving to the next step automatically...
            </p>
          </div>
        ) : null}
      </div>
    </StageFrame>
  );
}

function AssignStage({ onNext }: { onNext: () => void }) {
  return (
    <StageFrame
      step="S2"
      title="Sub-agent assigned"
      subtitle="A dedicated FDE sub-agent and meeting link are issued to the customer"
      right={<Pill tone="primary">agent-c0fa10e0</Pill>}
    >
      <div className="space-y-3">
        <GmailAssignment onJoin={onNext} joinButtonProps={{ ...({ "data-tour": "assign-join-btn" } as any) }} />
      </div>
    </StageFrame>
  );
}

function Report({ onRestart }: { onRestart: () => void }) {
  const lines = [
    ["Root cause", "Missing REQUIRED_API_KEY after secret rotation"],
    ["Fix applied", "Task definition 43 registered · container recreated"],
    ["Verification", "HTTP 200 · body \u201chello\u201d · 3/3 tasks healthy"],
    ["Access", "Sandbox sbx-7f21c revoked automatically"],
    ["Audit events", "8 recorded · sealed to CockroachDB"],
    ["Memory", "Rotation pre-check stored for Northwind Logistics"],
  ];

  return (
    <StageFrame
      step="Complete"
      title="Demo completed"
      subtitle={`Ticket ${TENANT.ticket} resolved in 3m 02s`}
      right={<Pill tone="success">resolved</Pill>}
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-success/30 bg-success/5 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-5 shrink-0 text-success sm:size-6" />
            <div>
              <p className="text-sm font-semibold sm:text-base">Issue resolved without downtime</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                The customer stayed in a single conversation while Plato loaded prior context,
                diagnosed the crash loop with read-only tooling, requested approval for the only
                mutating step, verified recovery and closed the ticket — with a full audit trail.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-2">
            <SectionLabel>Session summary</SectionLabel>
            {lines.map(([k, v]) => (
              <div
                key={k}
                className="flex flex-col gap-1 rounded-md border border-border bg-surface/60 px-3 py-2.5 text-xs sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-4 sm:py-3 sm:text-sm"
              >
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium sm:text-right">{v}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <SectionLabel>What you saw</SectionLabel>
            <div className="rounded-lg border border-border bg-surface/60 p-3 text-xs">
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 size-3 shrink-0 text-success" />
                  <span>Persistent memory loaded tenant context automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 size-3 shrink-0 text-success" />
                  <span>Read-only diagnostics ran in an isolated sandbox</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 size-3 shrink-0 text-success" />
                  <span>Human approval gated the only mutating action</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 size-3 shrink-0 text-success" />
                  <span>Every action recorded to tamper-evident audit trail</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={onRestart}
              variant="outline"
              className="w-full gap-2"
            >
              <RotateCcw className="size-3.5" /> Run the demo again
            </Button>
          </div>
        </div>
      </div>
    </StageFrame>
  );
}
