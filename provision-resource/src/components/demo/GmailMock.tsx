import { useState } from "react";
import {
  Menu,
  Search,
  SlidersHorizontal,
  HelpCircle,
  Settings,
  Grid3x3,
  Pencil,
  Inbox,
  Star,
  Clock,
  Send,
  File,
  ChevronDown,
  RefreshCw,
  MoreVertical,
  Minus,
  Maximize2,
  X,
  Paperclip,
  Link2,
  Smile,
  Image as ImageIcon,
  Trash2,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TENANT } from "./scenario";

const NAV = [
  { icon: Inbox, label: "Inbox", count: "444", active: true },
  { icon: Star, label: "Starred" },
  { icon: Clock, label: "Snoozed" },
  { icon: Send, label: "Sent" },
  { icon: File, label: "Drafts", count: "2" },
];

const THREADS = [
  { from: "Slack", subject: "New messages from 1 conversation in CockroachDB Community", snippet: "Your team is working in Slack.", time: "10:49" },
  { from: "The Google Cloud Ar.", subject: "[Arcade Insider] Players, your August missions are live", snippet: "Complete missions to earn badges.", time: "10:31" },
  { from: "Devpost", subject: "It's Go Time!! — CockroachDB × AWS Hackathon", snippet: "Submissions close soon.", time: "09:58" },
  { from: "Cloudflare", subject: "Last chance: $100 off Connect 2026", snippet: "Agents week recap inside.", time: "09:22" },
  { from: "Datadog", subject: "Monitor alert: orders-api restart count elevated", snippet: "Threshold breached on nwl-prod-edge.", time: "08:47" },
];

function GmailChrome({
  children,
  overlay,
}: {
  children: React.ReactNode;
  overlay?: React.ReactNode;
}) {
  return (
    <div className="mock-light relative overflow-hidden rounded-lg border border-border-strong bg-background text-foreground">
      <div className="flex items-center gap-3 border-b border-border px-3 py-2">
        <Menu className="size-4 text-muted-foreground" />
        <div className="flex items-center gap-1.5">
          <span className="text-base font-semibold tracking-tight text-destructive">M</span>
          <span className="text-[15px] text-muted-foreground">Gmail</span>
        </div>
        <div className="ml-3 flex flex-1 items-center gap-2 rounded-full bg-muted px-3 py-1.5">
          <Search className="size-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Search mail</span>
          <SlidersHorizontal className="ml-auto size-3.5 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <HelpCircle className="size-4" />
          <Settings className="size-4" />
          <Grid3x3 className="size-4" />
          <span className="size-6 rounded-full bg-primary" />
        </div>
      </div>

      <div className="flex min-h-[330px]">
        <aside className="hidden w-40 shrink-0 border-r border-border py-3 pl-2 pr-1 md:block">
          <button className="mb-3 flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-medium">
            <Pencil className="size-3.5" /> Compose
          </button>
          <nav className="space-y-0.5">
            {NAV.map((n) => (
              <div
                key={n.label}
                className={cn(
                  "flex items-center gap-2 rounded-r-full px-3 py-1.5 text-xs",
                  n.active ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground",
                )}
              >
                <n.icon className="size-3.5" />
                <span className="flex-1 truncate">{n.label}</span>
                {n.count ? <span className="text-[10px]">{n.count}</span> : null}
              </div>
            ))}
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
              <ChevronDown className="size-3.5" /> More
            </div>
          </nav>
          <p className="mt-4 px-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Labels
          </p>
          <div className="mt-1 space-y-1 px-3 text-[11px] text-muted-foreground">
            <p className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-destructive" /> To Do
            </p>
            <p className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-warning" /> Waiting
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="flex items-center gap-3 border-b border-border px-3 py-2 text-muted-foreground">
            <span className="size-3.5 rounded-sm border border-border-strong" />
            <RefreshCw className="size-3.5" />
            <MoreVertical className="size-3.5" />
            <span className="ml-auto text-[11px]">1–50 of 564</span>
          </div>
          {children}
        </section>
      </div>
      {overlay}
    </div>
  );
}

function ThreadList({ highlight }: { highlight?: React.ReactNode }) {
  return (
    <ul className="divide-y divide-border">
      {highlight}
      {THREADS.map((t) => (
        <li key={t.subject} className="flex items-center gap-3 px-3 py-2 text-xs">
          <span className="size-3.5 shrink-0 rounded-sm border border-border-strong" />
          <Star className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="w-32 shrink-0 truncate font-semibold">{t.from}</span>
          <span className="min-w-0 flex-1 truncate">
            <span className="font-medium">{t.subject}</span>
            <span className="text-muted-foreground"> — {t.snippet}</span>
          </span>
          <span className="shrink-0 text-[11px] text-muted-foreground">{t.time}</span>
        </li>
      ))}
    </ul>
  );
}

/** Stage S1 — customer raises the ticket from a Gmail compose window. */
export function GmailCompose({
  sent,
  onSend,
  sendButtonProps,
}: {
  sent: boolean;
  onSend: () => void;
  sendButtonProps?: React.HTMLAttributes<HTMLButtonElement>;
}) {
  const [body, setBody] = useState(
    "Our orders-api container on nwl-prod-edge keeps restarting since the nightly secret rotation. Checkout is failing for customers. Please help urgently.",
  );

  return (
    <GmailChrome
      overlay={
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-t-lg border border-border-strong bg-background shadow-2xl sm:right-3 sm:w-[58%] sm:min-w-[300px]">
          <div className="flex items-center justify-between bg-elevated px-3 py-2">
            <span className="text-xs font-semibold">
              {sent ? "Message sent" : "Support request"}
            </span>
            <span className="flex items-center gap-2 text-muted-foreground">
              <Minus className="size-3" />
              <Maximize2 className="size-3" />
              <X className="size-3" />
            </span>
          </div>
          <div className="space-y-0 px-3 text-xs">
            <p className="border-b border-border py-2 text-muted-foreground">
              To <span className="text-foreground">{TENANT.contact}</span>
            </p>
            <p className="border-b border-border py-2">
              Subject: <span className="font-medium">Urgent — {TENANT.service} crash loop in production</span>
            </p>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={sent}
              rows={4}
              className="w-full resize-none bg-transparent py-2 text-xs leading-relaxed outline-none disabled:opacity-70"
            />
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 text-muted-foreground">
            <button
              {...sendButtonProps}
              onClick={onSend}
              disabled={sent}
              className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
            >
              {sent ? "Sent" : "Send"}
            </button>
            <Paperclip className="hidden size-3.5 sm:block" />
            <Link2 className="hidden size-3.5 sm:block" />
            <Smile className="hidden size-3.5 sm:block" />
            <ImageIcon className="hidden size-3.5 sm:block" />
            <Trash2 className="ml-auto size-3.5" />
          </div>
        </div>
      }
    >
      <ThreadList />
    </GmailChrome>
  );
}

/** Stage S2 — routing email with the assigned sub-agent and the meet link. */
export function GmailAssignment({
  onJoin,
  joinButtonProps,
}: {
  onJoin: () => void;
  joinButtonProps?: React.HTMLAttributes<HTMLButtonElement>;
}) {
  return (
    <GmailChrome>
      <div className="px-3 py-3">
        <div className="rounded-lg border border-border-strong bg-surface p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">
                Support agent plato-c0fa10e0 assigned — join meeting
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Pingram Support &lt;no-reply@mail.pingram.io&gt; · to {TENANT.contact}
              </p>
            </div>
            <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
              Ticket {TENANT.ticket}
            </span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            A forward-deployed engineer sub-agent has been assigned to your incident. The session
            runs in an audited sandbox scoped to {TENANT.cluster}; access is revoked automatically
            when the session ends.
          </p>
          <button
            {...joinButtonProps}
            onClick={onJoin}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-4 py-6 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
          >
            <Video className="size-4" /> Click to join meet
          </button>
          <p className="mt-2 text-[11px] text-muted-foreground">
            meet.pingram.io/dlt-4821-nwl · plato-c0fa10e0
          </p>
        </div>
      </div>
      <ThreadList />
    </GmailChrome>
  );
}
