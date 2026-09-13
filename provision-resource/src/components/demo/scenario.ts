export type Actor = "agent" | "customer" | "system";

export type ConversationEntry = {
  id: string;
  actor: Actor;
  text: string;
  command?: {
    name: string;
    args: string;
    output: string;
    kind: "read" | "write" | "verify";
  };
  approval?: {
    title: string;
    plainLanguage: string;
    command: string;
    risk: "read-only" | "mutating";
  };
  /** Suggested reply shown as a button for customer entries */
  suggestion?: string;
  memory?: string;
};

export const TENANT = {
  name: "Northwind Logistics",
  tier: "Enterprise · Platinum",
  region: "aws:us-east-1",
  contact: "clear-lane-3858@mail.pingram.io",
  ticket: "NWL-4821",
  cluster: "nwl-prod-edge",
  service: "orders-api",
};

export const SCENARIO = {
  id: "SCN-114",
  title: "Live container crash-loop after config rotation",
  summary:
    "A production container on the customer's AWS account enters CrashLoopBackOff minutes after a secret rotation. Plato loads tenant memory, opens an audited sandbox session, runs read-only diagnostics, requests approval for the single mutating step, verifies recovery and closes the ticket.",
  resources: [
    { label: "Compute", value: "ECS Fargate · nwl-prod-edge" },
    { label: "Datastore", value: "CockroachDB Serverless · nwl-orders" },
    { label: "Observability", value: "CloudWatch Logs · /ecs/orders-api" },
    { label: "Session", value: "Ephemeral sandbox · auto-revoked" },
  ],
};

export const BOOT_STEPS = [
  "Resolving tenant credentials (STS AssumeRole)",
  "Provisioning ephemeral sandbox host",
  "Attaching read-only IAM policy set",
  "Opening audited session channel",
  "Streaming environment telemetry",
];

export const CONVERSATION: ConversationEntry[] = [
  {
    id: "c1",
    actor: "system",
    text: "Session opened for Northwind Logistics · ticket NWL-4821. All actions are recorded to the audit trail.",
  },
  {
    id: "c2",
    actor: "agent",
    text: "Hi Thala — Plato here. I've loaded your tenant context before we start so you don't have to repeat anything.",
    command: {
      name: "cat /etc/plato/tenant.json",
      args: "",
      output: JSON.stringify(
        {
          tenant: "northwind-logistics",
          tier: "platinum",
          prior_sessions: 3,
          runtime: "ECS Fargate",
          escalation: "pagerduty:nwl-oncall",
        },
        null,
        2,
      ),
      kind: "read",
    },
    memory: "Tenant profile hydrated from persistent memory (3 prior sessions).",
  },
  {
    id: "c3",
    actor: "agent",
    text: "You've seen something similar on 12 May. That incident was a missing environment variable after a rotation — I'll test that hypothesis first.",
    command: {
      name: 'grep -rl "crashloop" /var/log/plato/incidents/ | head -5',
      args: "",
      output:
        "/var/log/plato/incidents/INC-2291.json\nmatch_score: 0.91\nroot_cause: REQUIRED_API_KEY absent from task definition",
      kind: "read",
    },
  },
  {
    id: "c4",
    actor: "customer",
    text: "Correct. Checkout started failing about 20 minutes ago, right after our nightly rotation job ran.",
    suggestion:
      "Correct. Checkout started failing about 20 minutes ago, right after our nightly rotation job ran.",
  },
  {
    id: "c5",
    actor: "agent",
    text: "Understood. I'm opening a scoped sandbox against nwl-prod-edge. It's read-only until you approve anything that changes state.",
    command: {
      name: "docker exec -it sbx-7f21c bash",
      args: '--mode read-only --ttl 30m --cluster "nwl-prod-edge"',
      output: "Connected to sandbox sbx-7f21c\nMode: read-only\nExpires: 30m\nroot@sbx-7f21c:~#",
      kind: "read",
    },
  },
  {
    id: "c5b",
    actor: "agent",
    text: "Let me check the container resource usage first — high CPU or memory could indicate a different issue.",
    command: {
      name: 'docker stats orders-api-7 --no-stream --format "table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}\\t{{.MemPerc}}\\t{{.NetIO}}\\t{{.BlockIO}}"',
      args: "",
      output:
        "NAME            CPU %     MEM USAGE / LIMIT     MEM %     NET I/O           BLOCK I/O\norders-api-7    0.00%     45.2MiB / 512MiB      8.82%     1.24kB / 0B       0B / 0B\n\nLow resource usage — not a resource exhaustion issue.",
      kind: "read",
    },
  },
  {
    id: "c5c",
    actor: "agent",
    text: "Checking the container's environment variables to see what's actually loaded at runtime.",
    command: {
      name: "docker exec orders-api-7 env 2>/dev/null || docker inspect orders-api-7 --format '{{range .Config.Env}}{{println .}}{{end}}'",
      args: "",
      output:
        "PATH=/usr/local/bin:/usr/bin:/bin\nNODE_ENV=production\nPORT=8080\nHOSTNAME=58d8739225e\nHOME=/root\n\n⚠ REQUIRED_API_KEY is NOT present in the environment.",
      kind: "read",
    },
  },
  {
    id: "c5d",
    actor: "agent",
    text: "Let me verify the container's health check configuration and recent events.",
    command: {
      name: 'docker inspect orders-api-7 --format "{{json .Config.Healthcheck}}" && docker events --filter container=orders-api-7 --since 1h --until 0',
      args: "",
      output:
        '{"Test":["CMD-SHELL","curl -f http://localhost:8080/healthz || exit 1"],"Interval":30000000000,"Timeout":10000000000,"Retries":3,"StartPeriod":60000000000}\n\n2026-08-13T03:41:02Z container die orders-api-7 (exitCode=1)\n2026-08-13T03:41:32Z container start orders-api-7\n2026-08-13T03:41:34Z container die orders-api-7 (exitCode=1)\n(repeated 14×)\n\nHealth check: curl http://localhost:8080/healthz — failing because app never starts.',
      kind: "read",
    },
  },
  {
    id: "c5e",
    actor: "agent",
    text: "Checking if there are any recent deployments or image pulls that might have caused this.",
    command: {
      name: 'docker images orders-api --format "table {{.Repository}}\\t{{.Tag}}\\t{{.ID}}\\t{{.CreatedAt}}\\t{{.Size}}" && docker history orders-api:42 --no-trunc',
      args: "",
      output:
        "REPOSITORY   TAG   IMAGE ID       CREATED          SIZE\norders-api   42    a1b2c3d4e5f6   6 hours ago      245MB\norders-api   41    f6e5d4c3b2a1   2 days ago       245MB\norders-api   40    9f8e7d6c5b4a   5 days ago       244MB\n\nImage 42 was built 6 hours ago — aligns with the nightly rotation window.",
      kind: "read",
    },
  },
  {
    id: "c6",
    actor: "agent",
    text: "Task orders-api-7 has restarted 14 times. Exit code 1, no listener on :8080.",
    command: {
      name: 'docker ps -a --filter "name=orders-api" --format "table {{.ID}}\\t{{.Image}}\\t{{.Command}}\\t{{.CreatedAt}}\\t{{.Status}}\\t{{.Ports}}\\t{{.Names}}"',
      args: "",
      output:
        'CONTAINER ID   IMAGE          COMMAND            CREATED          STATUS                         PORTS     NAMES\n58d8739225e   orders-api:42  "python app.py"    7 hours ago      Restarting (1) 32 seconds ago             orders-api-7\na1b2c3d4e5f   orders-api:42  "python app.py"    7 hours ago      Up 7 hours                     0.0.0.0:8080->8080/tcp   orders-api-5\nf6g7h8i9j0k   orders-api:42  "python app.py"    7 hours ago      Up 7 hours                     0.0.0.0:8081->8080/tcp   orders-api-6\n\n1/3 healthy · orders-api-7 CrashLoopBackOff · restarts=14 · exit=1',
      kind: "read",
    },
  },
  {
    id: "c7",
    actor: "agent",
    text: "Logs confirm the May pattern: the process aborts during boot because a required key is not present in the environment.",
    command: {
      name: 'docker logs orders-api-7 --tail 200 2>&1 | grep -i "fatal\\|error\\|missing" | tail -20',
      args: "",
      output:
        "2026-08-13T03:41:02Z FATAL config: missing REQUIRED_API_KEY — abort\n2026-08-13T03:41:34Z FATAL config: missing REQUIRED_API_KEY — abort\n2026-08-13T03:42:06Z FATAL config: missing REQUIRED_API_KEY — abort\n(repeated 14×)\n\nFATAL config: missing REQUIRED_API_KEY — abort (repeated 14×)",
      kind: "read",
    },
  },
  {
    id: "c8",
    actor: "agent",
    text: "Task definition revision 42 dropped REQUIRED_API_KEY; revision 41 still has it. The rotation job wrote the new secret but never re-mapped it.",
    command: {
      name: "diff <(docker inspect orders-api:41 --format '{{json .Config.Env}}') <(docker inspect orders-api:42 --format '{{json .Config.Env}}')",
      args: "",
      output:
        '< ["NODE_ENV=production","PORT=8080","REQUIRED_API_KEY=arn:aws:secretsmanager:us-east-1:***:secret:nwl/api-key"]\n---\n> ["NODE_ENV=production","PORT=8080"]\n\n- secrets[REQUIRED_API_KEY] → arn:aws:secretsmanager:us-east-1:***:secret:nwl/api-key',
      kind: "read",
    },
  },
  {
    id: "c8b",
    actor: "agent",
    text: "Let me verify the secret still exists in AWS Secrets Manager and check the rotation job logs.",
    command: {
      name: 'aws secretsmanager describe-secret --secret-id nwl/api-key --query "{Name:Name,LastRotated:LastRotatedDate,VersionIds:VersionIdsToStages}" && aws logs get-log-events --log-group-name /ecs/rotation-job --log-stream-name rotation-2026-08-13 --limit 50',
      args: "",
      output:
        '{\n  "Name": "nwl/api-key",\n  "LastRotated": "2026-08-13T03:30:00Z",\n  "VersionIds": {"AWSCURRENT": "a1b2c3d4", "AWSPREVIOUS": "f6e5d4c3"}\n}\n\n2026-08-13T03:30:15Z INFO Rotation completed for nwl/api-key\n2026-08-13T03:30:16Z INFO Secret value updated in Secrets Manager\n2026-08-13T03:30:17Z WARN Task definition update skipped — no matching service found\n\n⚠ Rotation job completed but failed to update the task definition.',
      kind: "read",
    },
  },
  {
    id: "c8c",
    actor: "agent",
    text: "Checking if other services using the same secret are affected.",
    command: {
      name: 'docker ps --format "table {{.Names}}\\t{{.Image}}\\t{{.Status}}" | grep -E "orders|checkout|payment" && for svc in orders-api checkout-service payment-gateway; do echo "=== $svc ==="; docker inspect $svc --format "{{range .Config.Env}}{{println .}}{{end}}" 2>/dev/null | grep -i "API_KEY" || echo "No API_KEY env var"; done',
      args: "",
      output:
        "NAMES                IMAGE              STATUS\norders-api-5         orders-api:42      Up 7 hours\norders-api-6         orders-api:42      Up 7 hours\ncheckout-service-1   checkout:18        Up 7 hours\npayment-gateway-1    payment:9          Up 7 hours\n\n=== orders-api ===\nNo API_KEY env var (in rev 42)\n=== checkout-service ===\nCHECKOUT_API_KEY=arn:aws:secretsmanager:***:secret:nwl/checkout-key\n=== payment-gateway ===\nPAYMENT_API_KEY=arn:aws:secretsmanager:***:secret:nwl/payment-key\n\nOnly orders-api is affected — other services have their own secret mappings.",
      kind: "read",
    },
  },
  {
    id: "c8d",
    actor: "agent",
    text: "Let me also verify the container can actually reach AWS Secrets Manager once we fix the env var — checking IAM permissions and network.",
    command: {
      name: 'docker exec orders-api-5 aws sts get-caller-identity --query "Arn" && docker exec orders-api-5 curl -s --max-time 5 https://secretsmanager.us-east-1.amazonaws.com/ --head',
      args: "",
      output:
        "arn:aws:sts::123456789012:assumed-role/ecs-task-role/orders-api-5\n\nHTTP/1.1 403 Forbidden\nDate: Wed, 13 Aug 2026 03:45:12 GMT\nContent-Type: application/json\n\nIAM role has access to Secrets Manager (403 is expected without auth token). Network path is clear.",
      kind: "read",
    },
  },
  {
    id: "c9",
    actor: "agent",
    text: "Here's what I propose. Nothing has changed yet — I need your approval for this step.",
    approval: {
      title: "Restore secret mapping and recreate container",
      plainLanguage:
        "Re-attach the rotated secret REQUIRED_API_KEY to the orders-api task definition (new revision 43) and roll the single unhealthy task. Traffic keeps flowing through the two healthy tasks; no data is touched and revision 42 stays available for rollback.",
      command:
        'docker run -d --name orders-api-7 --restart unless-stopped \\\n  -e NODE_ENV=production -e PORT=8080 \\\n  -e REQUIRED_API_KEY="$(aws secretsmanager get-secret-value --secret-id nwl/api-key --query SecretString --output text)" \\\n  -p 8080:8080 orders-api:43',
      risk: "mutating",
    },
  },
  {
    id: "c10",
    actor: "agent",
    text: "Approved — applying the fix now with the approval reference attached to every call.",
    command: {
      name: 'docker run -d --name orders-api-7 --restart unless-stopped -e NODE_ENV=production -e PORT=8080 -e REQUIRED_API_KEY="***" -p 8080:8080 orders-api:43',
      args: "--approval apr-9c4d",
      output:
        "Unable to find image 'orders-api:43' locally\norders-api:43: Pulling from nwl/orders-api\nDigest: sha256:a1b2c3d4e5f6...\nStatus: Downloaded newer image for orders-api:43\n\na1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2\n\nrevision 43 active · orders-api-7 recreated · rollback target 42 pinned",
      kind: "write",
    },
  },
  {
    id: "c11",
    actor: "agent",
    text: "Service is healthy again: 3/3 tasks running and the health endpoint responds normally.",
    command: {
      name: 'docker ps --filter "name=orders-api" --format "table {{.Names}}\\t{{.Status}}" && curl -s http://localhost:8080/healthz',
      args: "",
      output:
        "NAMES            STATUS\norders-api-5     Up 7 hours\norders-api-6     Up 7 hours\norders-api-7     Up 12 seconds\n\nHTTP 200 · body=hello · p95=88ms · 3/3 tasks healthy",
      kind: "verify",
    },
  },
  {
    id: "c12",
    actor: "customer",
    text: "Checkout is going through on our side too. Thank you.",
    suggestion: "Checkout is going through on our side too. Thank you.",
  },
  {
    id: "c13",
    actor: "agent",
    text: "I've updated the ticket, stored the session summary for next time, and revoked my access to your environment.",
    command: {
      name: "docker stop sbx-7f21c && docker rm sbx-7f21c",
      args: "",
      output:
        "sbx-7f21c\nsbx-7f21c\n\nticket resolved · summary stored · sandbox sbx-7f21c revoked",
      kind: "read",
    },
    memory:
      "Stored: rotation job must re-map REQUIRED_API_KEY — pre-check added for Northwind Logistics.",
  },
];

export type WorkerEvent = {
  turn: number;
  node: string;
  model?: string;
  duration: string;
  tokens?: string;
  command?: string;
  output?: string;
  status: "ok" | "running" | "warn";
};

export const WORKER_EVENTS: WorkerEvent[] = [
  {
    turn: 1,
    node: "model",
    model: "ChatBedrockConverse · qwen.qwen3-coder-n...",
    duration: "3.15s",
    tokens: "1.4K",
    status: "ok",
  },
  {
    turn: 1,
    node: "tools",
    duration: "14.13s",
    command: "cat /etc/plato/tenant.json",
    output: "tenant profile loaded",
    status: "ok",
  },
  {
    turn: 2,
    node: "model",
    model: "ChatBedrockConverse · qwen.qwen3-coder-n...",
    duration: "2.80s",
    tokens: "1.5K",
    status: "ok",
  },
  {
    turn: 2,
    node: "tools",
    duration: "17.07s",
    command: 'grep -rl "crashloop" /var/log/plato/incidents/',
    output: "INC-2291 matched 0.91",
    status: "ok",
  },
  {
    turn: 3,
    node: "model",
    model: "ChatBedrockConverse · qwen.qwen3-coder-n...",
    duration: "8.07s",
    tokens: "1.6K",
    status: "ok",
  },
  {
    turn: 3,
    node: "tools",
    duration: "13.05s",
    command: 'docker ps -a --filter "name=orders-api"',
    output: "1/3 healthy · CrashLoopBackOff",
    status: "warn",
  },
  {
    turn: 4,
    node: "model",
    model: "ChatBedrockConverse · qwen.qwen3-coder-n...",
    duration: "11.47s",
    tokens: "1.7K",
    status: "ok",
  },
  {
    turn: 4,
    node: "tools",
    duration: "17.06s",
    command: "docker logs orders-api-7 --tail 200",
    output: "FATAL: missing REQUIRED_API_KEY (14×)",
    status: "warn",
  },
  {
    turn: 5,
    node: "tools",
    duration: "8.42s",
    command: "docker stats orders-api-7 --no-stream",
    output: "CPU 0.00% · MEM 45.2MiB/512MiB (8.82%)",
    status: "ok",
  },
  {
    turn: 5,
    node: "tools",
    duration: "6.18s",
    command: "docker exec orders-api-7 env",
    output: "REQUIRED_API_KEY NOT present",
    status: "warn",
  },
  {
    turn: 6,
    node: "tools",
    duration: "9.33s",
    command: "docker inspect orders-api-7 --format Healthcheck",
    output: "health check: curl /healthz — failing",
    status: "warn",
  },
  {
    turn: 6,
    node: "tools",
    duration: "7.21s",
    command: "docker images orders-api && docker history orders-api:42",
    output: "Image 42 built 6h ago — aligns with rotation window",
    status: "ok",
  },
  {
    turn: 7,
    node: "tools",
    duration: "13.05s",
    command: "diff <(docker inspect orders-api:41) <(docker inspect orders-api:42)",
    output: "REQUIRED_API_KEY dropped in rev 42",
    status: "warn",
  },
  {
    turn: 8,
    node: "tools",
    duration: "11.84s",
    command: "aws secretsmanager describe-secret --secret-id nwl/api-key",
    output: "Secret exists · Last rotated 03:30Z · rotation job WARN",
    status: "warn",
  },
  {
    turn: 8,
    node: "tools",
    duration: "8.96s",
    command: "docker ps | grep orders && for svc in ...; do inspect env; done",
    output: "Only orders-api affected · other services OK",
    status: "ok",
  },
  {
    turn: 9,
    node: "tools",
    duration: "6.47s",
    command: "docker exec orders-api-5 aws sts get-caller-identity",
    output: "IAM role verified · Secrets Manager reachable",
    status: "ok",
  },
  {
    turn: 10,
    node: "model",
    model: "ChatBedrockConverse · qwen.qwen3-coder-n...",
    duration: "5.22s",
    tokens: "1.8K",
    status: "ok",
  },
  {
    turn: 10,
    node: "tools",
    duration: "22.41s",
    command: "docker run -d --name orders-api-7 ... orders-api:43",
    output: "container started · rev 43 active",
    status: "ok",
  },
  {
    turn: 11,
    node: "tools",
    duration: "4.83s",
    command: "docker ps --filter name=orders-api && curl localhost:8080/healthz",
    output: "HTTP 200 · 3/3 tasks healthy",
    status: "ok",
  },
  {
    turn: 12,
    node: "tools",
    duration: "3.12s",
    command: "docker stop sbx-7f21c && docker rm sbx-7f21c",
    output: "sandbox revoked · session closed",
    status: "ok",
  },
];

export const DB_ROWS = [
  {
    id: "evt_8f31",
    ts: "10:41:02",
    actor: "plato",
    action: "cat /etc/plato/tenant.json",
    risk: "low",
  },
  {
    id: "evt_8f32",
    ts: "10:41:09",
    actor: "plato",
    action: "grep crashloop incidents/",
    risk: "low",
  },
  {
    id: "evt_8f33",
    ts: "10:41:26",
    actor: "plato",
    action: "docker exec sbx-7f21c",
    risk: "low",
  },
  {
    id: "evt_8f34",
    ts: "10:41:48",
    actor: "plato",
    action: "docker stats orders-api-7",
    risk: "low",
  },
  {
    id: "evt_8f35",
    ts: "10:42:03",
    actor: "plato",
    action: "docker exec orders-api-7 env",
    risk: "low",
  },
  {
    id: "evt_8f36",
    ts: "10:42:15",
    actor: "plato",
    action: "docker inspect healthcheck",
    risk: "low",
  },
  {
    id: "evt_8f37",
    ts: "10:42:28",
    actor: "plato",
    action: "docker images orders-api",
    risk: "low",
  },
  {
    id: "evt_8f38",
    ts: "10:42:45",
    actor: "plato",
    action: "docker inspect rev 41 vs 42",
    risk: "low",
  },
  {
    id: "evt_8f39",
    ts: "10:43:02",
    actor: "plato",
    action: "aws secretsmanager describe-secret",
    risk: "low",
  },
  {
    id: "evt_8f40",
    ts: "10:43:18",
    actor: "plato",
    action: "check other services env",
    risk: "low",
  },
  {
    id: "evt_8f41",
    ts: "10:43:31",
    actor: "plato",
    action: "verify IAM + network",
    risk: "low",
  },
  { id: "evt_8f42", ts: "10:43:55", actor: "thala", action: "approval.granted", risk: "medium" },
  {
    id: "evt_8f43",
    ts: "10:44:10",
    actor: "plato",
    action: "docker run orders-api:43",
    risk: "medium",
  },
  {
    id: "evt_8f44",
    ts: "10:44:35",
    actor: "plato",
    action: "curl /healthz verify",
    risk: "low",
  },
  {
    id: "evt_8f45",
    ts: "10:44:58",
    actor: "plato",
    action: "docker stop sbx-7f21c",
    risk: "low",
  },
];
