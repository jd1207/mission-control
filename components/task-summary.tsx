"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: "inbox" | "assigned" | "in_progress" | "review" | "done" | "blocked";
  assigneeIds: string[];
  priority: "high" | "med" | "low";
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

interface TaskSummaryProps {
  tasks: Task[];
}

export function TaskSummary({ tasks }: TaskSummaryProps) {
  const stats = {
    total: tasks.length,
    inbox: tasks.filter(t => t.status === "inbox").length,
    assigned: tasks.filter(t => t.status === "assigned").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    review: tasks.filter(t => t.status === "review").length,
    done: tasks.filter(t => t.status === "done").length,
    blocked: tasks.filter(t => t.status === "blocked").length,
    high: tasks.filter(t => t.priority === "high").length,
    med: tasks.filter(t => t.priority === "med").length,
    low: tasks.filter(t => t.priority === "low").length,
  };

  const statusCards = [
    { label: "Inbox", count: stats.inbox, color: "bg-slate-500/10 text-slate-400" },
    { label: "Assigned", count: stats.assigned, color: "bg-blue-500/10 text-blue-400" },
    { label: "In Progress", count: stats.inProgress, color: "bg-yellow-500/10 text-yellow-400" },
    { label: "Review", count: stats.review, color: "bg-purple-500/10 text-purple-400" },
    { label: "Done", count: stats.done, color: "bg-emerald-500/10 text-emerald-400" },
    { label: "Blocked", count: stats.blocked, color: "bg-red-500/10 text-red-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      {statusCards.map((card) => (
        <Card key={card.label} className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-200 mb-1">
              {card.count}
            </div>
            <Badge className={`${card.color} ring-1 ring-current/20`}>
              {card.label}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}