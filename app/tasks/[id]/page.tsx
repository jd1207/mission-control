"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

interface TaskDetailPageProps {
  params: {
    id: string;
  };
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const task = useQuery(api.tasks.get, { id: params.id as any });
  const messages = useQuery(api.messages.listByTask, { taskId: params.id as any });

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-zinc-500">Loading task…</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/tasks">
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
        <h1 className="text-xl font-bold text-zinc-100">{task.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Details
                <div className="flex gap-2">
                  <Badge
                    variant={
                      task.priority === "urgent" ? "error" :
                      task.priority === "high" ? "warning" : "secondary"
                    }
                  >
                    {task.priority}
                  </Badge>
                  <Badge variant="secondary">
                    {task.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-400 whitespace-pre-wrap">{task.description}</p>
              <div className="grid grid-cols-2 gap-4 text-xs mt-4">
                <div>
                  <span className="text-zinc-600">Created</span>
                  <p className="text-zinc-300">{formatDateTime(task.createdAt)}</p>
                </div>
                <div>
                  <span className="text-zinc-600">Updated</span>
                  <p className="text-zinc-300">{formatDateTime(task.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comments</CardTitle>
            </CardHeader>
            <CardContent>
              {messages && messages.length > 0 ? (
                <div className="space-y-3">
                  {messages.map((m: any) => (
                    <div key={m._id} className="p-3 rounded-lg bg-zinc-800/40 border border-zinc-800">
                      <div className="flex items-center gap-2 mb-1">
                        {m.sender && (
                          <>
                            <span>{m.sender.emoji}</span>
                            <span className="text-xs font-medium text-zinc-300">{m.sender.name}</span>
                          </>
                        )}
                        <span className="text-[10px] text-zinc-600">
                          {formatDateTime(m.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-300">{m.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-600 text-center py-4">No comments yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assigned To</CardTitle>
            </CardHeader>
            <CardContent>
              {task.assignee ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{task.assignee.emoji}</span>
                  <span className="text-sm text-zinc-200">{task.assignee.name}</span>
                </div>
              ) : (
                <p className="text-sm text-zinc-600">Unassigned</p>
              )}
            </CardContent>
          </Card>

          {task.tags && task.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
