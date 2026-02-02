"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: "inbox" | "assigned" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assigneeId?: string;
  assignee?: {
    id: string;
    name: string;
    emoji: string;
  };
  createdAt: number;
  updatedAt: number;
  tags: string[];
}

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

const priorityConfig: Record<string, { variant: string; dot: string }> = {
  urgent: { variant: "error", dot: "bg-red-500" },
  high: { variant: "warning", dot: "bg-amber-500" },
  medium: { variant: "success", dot: "bg-emerald-500" },
  low: { variant: "secondary", dot: "bg-zinc-500" },
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<string | null>(null);
  const prio = priorityConfig[task.priority] ?? priorityConfig.low;

  const formatDate = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleProcessTask = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setProcessing(true);
    setProcessResult(null);

    try {
      const res = await fetch("/api/process-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskTitle: task.title,
          taskDescription: task.description,
          taskId: task._id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setProcessResult(`Spawned: ${data.childSessionKey ?? data.runId}`);
      } else {
        setProcessResult(`Error: ${data.error}`);
      }
    } catch (err) {
      setProcessResult("Failed to spawn agent");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className="group rounded-lg border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-150 cursor-pointer"
      onClick={() => onClick?.(task)}
    >
      <div className="p-3.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-medium text-zinc-200 leading-snug line-clamp-2">
            {task.title}
          </h4>
          {task.assignee && (
            <span className="text-base flex-shrink-0" title={task.assignee.name}>
              {task.assignee.emoji}
            </span>
          )}
        </div>

        {/* Description preview */}
        <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{task.description}</p>

        {/* Footer: priority + tags + date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${prio.dot}`} />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
                {task.priority}
              </span>
            </div>
            {task.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
          </div>
          <span className="text-[10px] text-zinc-600 tabular-nums">{formatDate(task.updatedAt)}</span>
        </div>

        {/* Process Task button — visible on hover */}
        {task.status !== "done" && (
          <div className="mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs h-7 border-zinc-700 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30"
              onClick={handleProcessTask}
              disabled={processing}
            >
              {processing ? "⏳ Spawning agent…" : "🤖 Process Task"}
            </Button>
            {processResult && (
              <p className="text-[10px] text-zinc-500 mt-1 truncate" title={processResult}>
                {processResult}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
