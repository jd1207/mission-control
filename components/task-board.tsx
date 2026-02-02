"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TaskCard } from "./task-card";

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

interface TaskBoardProps {
  tasksByStatus: Record<string, Task[]> | Record<string, unknown[]>;
  onTaskClick?: (task: Task) => void;
  onTaskDelete?: (task: Task) => void;
}

const columns = [
  {
    key: "inbox",
    title: "📥 Inbox",
    accent: "border-t-zinc-500",
    headerBg: "bg-zinc-800/60",
    count: "text-zinc-400",
  },
  {
    key: "assigned",
    title: "👤 Assigned",
    accent: "border-t-blue-500",
    headerBg: "bg-blue-900/30",
    count: "text-blue-400",
  },
  {
    key: "in_progress",
    title: "⚡ In Progress",
    accent: "border-t-amber-500",
    headerBg: "bg-amber-900/30",
    count: "text-amber-400",
  },
  {
    key: "review",
    title: "🔍 Review",
    accent: "border-t-purple-500",
    headerBg: "bg-purple-900/30",
    count: "text-purple-400",
  },
  {
    key: "done",
    title: "✅ Done",
    accent: "border-t-emerald-500",
    headerBg: "bg-emerald-900/30",
    count: "text-emerald-400",
  },
];

export function TaskBoard({ tasksByStatus, onTaskClick, onTaskDelete }: TaskBoardProps) {
  const updateStatus = useMutation(api.tasks.updateStatus);

  const handleDrop = async (taskId: string, newStatus: string) => {
    try {
      await updateStatus({
        id: taskId as any,
        status: newStatus as any,
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {columns.map((col) => {
        const tasks = (tasksByStatus[col.key] as Task[] | undefined) ?? [];
        return (
          <div
            key={col.key}
            className={`flex flex-col rounded-xl border border-zinc-800/80 ${col.accent} border-t-2 bg-zinc-950/50 min-h-[400px]`}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("ring-1", "ring-zinc-600");
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove("ring-1", "ring-zinc-600");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("ring-1", "ring-zinc-600");
              const taskId = e.dataTransfer.getData("text/plain");
              if (taskId) handleDrop(taskId, col.key);
            }}
          >
            {/* Column header */}
            <div className={`px-4 py-3 ${col.headerBg} rounded-t-xl`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-200">{col.title}</h3>
                <span className={`text-xs font-medium ${col.count} tabular-nums`}>
                  {tasks.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", task._id)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <TaskCard task={task} onClick={onTaskClick} onDelete={onTaskDelete} />
                </div>
              ))}

              {tasks.length === 0 && (
                <div className="flex items-center justify-center h-24 border border-dashed border-zinc-800 rounded-lg">
                  <p className="text-xs text-zinc-600">Drop tasks here</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
