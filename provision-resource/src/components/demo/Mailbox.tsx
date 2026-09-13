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
  Reply,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TENANT } from "./scenario";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GuideHint } from "./GuideHint";

const NAV = [
  { icon: Inbox, label: "Inbox", count: "445", active: true },
  { icon: Star, label: "Starred" },
  { icon: Clock, label: "Snoozed" },
  { icon: Send, label: "Sent" },
  { icon: File, label: "Drafts", count: "2" },
];

function GmailChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="mock-light relative overflow-hidden rounded-xl border border-border-strong bg-background text-foreground shadow-lg">
      <div className="flex items-center gap-3 border-b border-border px-3.5 py-2.5">
        <Menu className="size-4 text-muted-foreground" />
        <div className="flex items-center gap-1.5">
          <span className="text-base font-semibold tracking-tight text-destructive">M</span>
          <span className="text-[15px] text-muted-foreground">Gmail</span>
        </div>
        <div className="ml-3 flex flex-1 items-center gap-2 rounded-full bg-muted px-3.5 py-2">
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

      <div className="flex min-h-[360px]">
        <aside className="hidden w-40 shrink-0 border-r border-border py-3.5 pl-2 pr-1 md:block">
          <button className="mb-3 flex items-center gap-2 rounded-full bg-muted px-3.5 py-2 text-xs font-medium hover:bg-muted/80 transition-colors">
            <Pencil className="size-3.5" /> Compose
          </button>
          <nav className="space-y-0.5">
            {NAV.map((n) => (
              <div
                key={n.label}
                className={cn(
                  "flex items-center gap-2 rounded-r-full px-3.5 py-1.5 text-xs transition-colors",
                  n.active
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <n.icon className="size-3.5" />
                <span className="flex-1 truncate">{n.label}</span>
                {n.count ? <span className="text-[10px]">{n.count}</span> : null}
              </div>
            ))}
            <div className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-muted-foreground">
              <ChevronDown className="size-3.5" /> More
            </div>
          </nav>
          <p className="mt-4 px-3.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Labels
          </p>
          <div className="mt-1 space-y-1 px-3.5 text-[11px] text-muted-foreground">
            <p className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-destructive" /> To Do
            </p>
            <p className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-warning" /> Waiting
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </div>
  );
}

/** Mailbox view — approval request email from Plato */
export function MailboxApproval({
  onApprove,
  approved,
}: {
  onApprove: () => void;
  approved: boolean;
}) {
  const [replySent, setReplySent] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleSendReply = () => {
    setReplySent(true);
    onApprove();
  };

  return (
    <GmailChrome>
      <div className="px-3.5 py-3.5">
        {/* Email thread */}
        <div className="rounded-xl border border-border-strong bg-surface p-4 shadow-sm">
          {/* Email header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">
                Approval required — Restore secret mapping for orders-api
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Plato Agent &lt;agent-c0fa10e0@mail.pingram.io&gt; · to {TENANT.contact}
              </p>
            </div>
            <Badge variant="warning" className="gap-1">
              <AlertCircle className="size-3" />
              Action Required
            </Badge>
          </div>

          {/* Email body */}
          <div className="mt-4 space-y-3 text-xs leading-relaxed text-muted-foreground">
            <p>Hi Thala,</p>
            <p>
              I've identified the root cause of the crash loop. Task definition revision 42 is
              missing the{" "}
              <code className="rounded-md bg-background px-1.5 py-0.5 font-mono text-[11px] text-foreground border border-border">
                REQUIRED_API_KEY
              </code>{" "}
              environment variable. The nightly rotation job updated the secret in AWS Secrets
              Manager but didn't re-map it to the task definition.
            </p>
            <p>I'd like to apply the following fix:</p>

            {/* Command block */}
            <pre className="overflow-x-auto rounded-lg border border-border bg-background p-3 font-mono text-[11px] text-foreground shadow-sm">
              {`docker run -d --name orders-api-7 --restart unless-stopped \\
  -e NODE_ENV=production -e PORT=8080 \\
  -e REQUIRED_API_KEY="$(aws secretsmanager get-secret-value \\
    --secret-id nwl/api-key --query SecretString --output text)" \\
  -p 8080:8080 orders-api:43`}
            </pre>

            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
              <p>
                <strong className="text-foreground flex items-center gap-1.5">
                  <Lock className="size-3" />
                  Impact:
                </strong>
                <span className="ml-4">
                  Only the unhealthy task (orders-api-7) will be recreated. The two healthy tasks
                  continue serving traffic. Revision 42 remains available for rollback.
                </span>
              </p>
              <p>
                <strong className="text-foreground">Risk:</strong>
                <span className="ml-1.5">
                  Low — read-only diagnostics confirmed the fix. No data modification.
                </span>
              </p>
            </div>

            <p>Please reply to approve.</p>
            <p className="text-muted-foreground">— Plato · agent-c0fa10e0</p>
          </div>

          {/* Reply area */}
          {!replySent ? (
            <div className="mt-4 border-t border-border pt-3.5">
              <GuideHint className="mb-2">Reply to approve the fix and continue</GuideHint>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                <Reply className="size-3" />
                <span>Reply to Plato Agent</span>
              </div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your approval..."
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <div className="mt-2.5 flex items-center gap-2.5">
                <Button onClick={handleSendReply} variant="default" size="sm" className="gap-1.5">
                  <Send className="size-3" />
                  Approve & Send
                </Button>
                <span className="text-[11px] text-muted-foreground">
                  or type "approved" and send
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-4 border-t border-border pt-3.5">
              <div className="flex items-center gap-2 text-xs text-success bg-success/5 rounded-lg px-3 py-2.5 border border-success/30">
                <CheckCircle2 className="size-4" />
                <span className="font-medium">
                  Approval sent · Plato is applying the fix now
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </GmailChrome>
  );
}
