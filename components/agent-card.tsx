"use client";

import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";

interface Agent {
  _id: string;
  name: string;
  emoji: string;
  status: "idle" | "active" | "busy" | "error";
  currentTaskId?: string;
  lastHeartbeat: number;
  capabilities: string[];
  currentModel?: string;
  sessionKey?: string;
}

interface AgentCardProps {
  agent: Agent;
  currentTask?: { title: string };
}

const statusStyles: Record<string, { dot: string; badge: string; label: string }> = {
  idle: { dot: "bg-zinc-500", badge: "secondary", label: "Idle" },
  active: { dot: "bg-emerald-500 animate-pulse", badge: "success", label: "Active" },
  busy: { dot: "bg-amber-500 animate-pulse", badge: "warning", label: "Busy" },
  error: { dot: "bg-red-500", badge: "error", label: "Error" },
};

export function AgentCard({ agent, currentTask }: AgentCardProps) {
  const st = statusStyles[agent.status] ?? statusStyles.idle;
  const heartbeatAge = Date.now() - agent.lastHeartbeat;
  const isStale = heartbeatAge > 1000 * 60 * 30; // >30min = stale

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 hover:border-zinc-700 transition-colors overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="text-2xl">{agent.emoji}</span>
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${st.dot} ring-2 ring-zinc-950`}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">{agent.name}</h3>
            <p className={`text-xs ${isStale ? "text-zinc-600" : "text-zinc-500"}`}>
              {formatRelativeTime(agent.lastHeartbeat)}
            </p>
          </div>
        </div>
        <Badge variant={st.badge as any} className="text-[10px]">
          {st.label}
        </Badge>
      </div>

      {/* Body */}
      <div className="px-5 py-3.5 space-y-3">
        {/* Current task */}
        {currentTask ? (
          <div className="flex items-start gap-2">
            <span className="text-xs text-zinc-600 mt-0.5">📋</span>
            <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">{currentTask.title}</p>
          </div>
        ) : (
          <p className="text-xs text-zinc-600 italic">No active task</p>
        )}

        {/* Model + Session */}
        {(agent.currentModel || agent.sessionKey) && (
          <div className="flex items-center gap-3 text-[10px] text-zinc-600">
            {agent.currentModel && (
              <span className="flex items-center gap-1">
                🧠 {agent.currentModel}
              </span>
            )}
            {agent.sessionKey && (
              <span className="truncate max-w-[120px]" title={agent.sessionKey}>
                🔑 {agent.sessionKey}
              </span>
            )}
          </div>
        )}

        {/* Capabilities */}
        <div className="flex flex-wrap gap-1">
          {agent.capabilities.slice(0, 4).map((cap) => (
            <span
              key={cap}
              className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-500"
            >
              {cap.replace(/_/g, " ")}
            </span>
          ))}
          {agent.capabilities.length > 4 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-600">
              +{agent.capabilities.length - 4}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
