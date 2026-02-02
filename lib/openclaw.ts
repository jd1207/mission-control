/**
 * OpenClaw Service — TypeScript wrapper for the OpenClaw CLI
 * Provides session management (spawn, send, list) for sub-agent orchestration.
 *
 * This runs server-side only (Next.js API routes / server actions).
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type SessionKind = "main" | "group" | "cron" | "hook" | "node" | "other";

export interface SessionRow {
  key: string;
  kind: SessionKind;
  channel: string;
  displayName?: string;
  updatedAt: number;
  sessionId: string;
  model?: string;
  contextTokens?: number;
  totalTokens?: number;
}

export interface SessionSpawnParams {
  task: string;
  label?: string;
  agentId?: string;
  model?: string;
  runTimeoutSeconds?: number;
  cleanup?: "delete" | "keep";
}

export interface SessionSpawnResult {
  status: "accepted";
  runId: string;
  childSessionKey: string;
}

export interface SessionSendParams {
  sessionKey: string;
  message: string;
  timeoutSeconds?: number;
}

export interface SessionSendResult {
  runId: string;
  status: "accepted" | "ok" | "timeout" | "error";
  reply?: string;
  error?: string;
}

export interface SessionListParams {
  kinds?: SessionKind[];
  limit?: number;
  activeMinutes?: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function escapeArg(arg: string): string {
  if (/\s/.test(arg) || arg.includes('"')) {
    return `"${arg.replace(/"/g, '\\"')}"`;
  }
  return arg;
}

async function runCli(args: string[]): Promise<string> {
  // Dynamic import — keeps this module server-only compatible
  const { exec: execCb } = await import("child_process");
  const { promisify } = await import("util");
  const exec = promisify(execCb);

  const cmd = `openclaw ${args.map(escapeArg).join(" ")}`;

  try {
    const { stdout } = await exec(cmd, { timeout: 60_000 });
    return stdout.trim();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`OpenClaw CLI failed: ${message}`);
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Spawn a sub-agent session to process a task.
 */
export async function sessionsSpawn(params: SessionSpawnParams): Promise<SessionSpawnResult> {
  const args = ["sessions_spawn", "--task", params.task];

  if (params.label) args.push("--label", params.label);
  if (params.agentId) args.push("--agent-id", params.agentId);
  if (params.model) args.push("--model", params.model);
  if (params.runTimeoutSeconds) args.push("--run-timeout-seconds", String(params.runTimeoutSeconds));
  if (params.cleanup) args.push("--cleanup", params.cleanup);

  const raw = await runCli(args);
  return JSON.parse(raw);
}

/**
 * Send a message to an existing session.
 */
export async function sessionsSend(params: SessionSendParams): Promise<SessionSendResult> {
  const args = ["sessions_send", "--session-key", params.sessionKey, "--message", params.message];

  if (params.timeoutSeconds !== undefined) {
    args.push("--timeout-seconds", String(params.timeoutSeconds));
  }

  const raw = await runCli(args);
  return JSON.parse(raw);
}

/**
 * List active sessions.
 */
export async function sessionsList(params: SessionListParams = {}): Promise<SessionRow[]> {
  const args = ["sessions_list"];

  if (params.kinds) args.push("--kinds", params.kinds.join(","));
  if (params.limit) args.push("--limit", String(params.limit));
  if (params.activeMinutes) args.push("--active-minutes", String(params.activeMinutes));

  const raw = await runCli(args);
  return JSON.parse(raw);
}
