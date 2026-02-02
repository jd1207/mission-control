"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskBoard } from "@/components/task-board";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { DeleteTaskDialog } from "@/components/delete-task-dialog";
import { Trash2, CheckSquare, Square, ArrowRight } from "lucide-react";

type ViewMode = "board" | "list";

export default function TasksPage() {
  const [view, setView] = useState<ViewMode>("board");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState(false);

  const agents = useQuery(api.agents.list);
  const tasksByStatus = useQuery(api.tasks.listByStatus);
  const tasks = useQuery(api.tasks.list, {
    status: statusFilter === "all" ? undefined : (statusFilter as any),
    priority: priorityFilter === "all" ? undefined : (priorityFilter as any),
    assigneeId: assigneeFilter === "all" ? undefined : (assigneeFilter as any),
  });
  const messages = useQuery(
    api.messages.listByTask,
    selectedTask ? { taskId: selectedTask._id } : "skip"
  );

  const deleteTask = useMutation(api.tasks.deleteTask);
  const updateStatus = useMutation(api.tasks.updateStatus);

  const statuses = ["all", "inbox", "assigned", "in_progress", "review", "done"];
  const priorities = ["all", "low", "medium", "high", "urgent"];

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (!tasks) return;
    if (selectedIds.size === tasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tasks.map((t) => t._id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const confirmed = window.confirm(`Delete ${selectedIds.size} task(s)? This cannot be undone.`);
    if (!confirmed) return;
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      try { await deleteTask({ id: id as any }); } catch (e) { console.error(e); }
    }
    setSelectedIds(new Set());
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      try { await updateStatus({ id: id as any, status: status as any }); } catch (e) { console.error(e); }
    }
    setSelectedIds(new Set());
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Tasks</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage and track all work</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-zinc-800 overflow-hidden">
            <button
              onClick={() => setView("board")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "board" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "list" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              List
            </button>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>+ New Task</Button>
        </div>
      </div>

      {view === "board" ? (
        /* Kanban Board View */
        tasksByStatus ? (
          <TaskBoard
            tasksByStatus={tasksByStatus}
            onTaskClick={setSelectedTask}
            onTaskDelete={setTaskToDelete}
          />
        ) : (
          <div className="flex items-center justify-center h-48 text-zinc-600">Loading…</div>
        )
      ) : (
        /* List View */
        <>
          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 text-sm"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s === "all" ? "All" : s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 text-sm"
                  >
                    {priorities.map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1">
                    Assignee
                  </label>
                  <select
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                    className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="">Unassigned</option>
                    {agents?.map((agent) => (
                      <option key={agent._id} value={agent._id}>
                        {agent.emoji} {agent.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setBulkAction(!bulkAction); setSelectedIds(new Set()); }}
                    className={bulkAction ? "border-emerald-500/50 text-emerald-400" : ""}
                  >
                    {bulkAction ? "Cancel Select" : "Bulk Actions"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk actions bar */}
          {bulkAction && selectedIds.size > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-lg">
              <span className="text-sm text-zinc-300 font-medium">{selectedIds.size} selected</span>
              <div className="flex gap-2 ml-auto">
                <select
                  onChange={(e) => { if (e.target.value) handleBulkStatusChange(e.target.value); e.target.value = ""; }}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-100 text-xs"
                  defaultValue=""
                >
                  <option value="" disabled>Move to…</option>
                  <option value="inbox">📥 Inbox</option>
                  <option value="assigned">👤 Assigned</option>
                  <option value="in_progress">⚡ In Progress</option>
                  <option value="review">🔍 Review</option>
                  <option value="done">✅ Done</option>
                </select>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                </Button>
              </div>
            </div>
          )}

          {/* Task list table */}
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                {bulkAction && (
                  <button onClick={selectAll} className="text-zinc-500 hover:text-zinc-300">
                    {tasks && selectedIds.size === tasks.length ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                )}
                {tasks?.length || 0} tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {tasks?.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => bulkAction ? toggleSelect(task._id) : setSelectedTask(task)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-zinc-800/50 cursor-pointer transition-colors ${
                      selectedIds.has(task._id) ? "bg-emerald-500/5 border border-emerald-500/20" : ""
                    }`}
                  >
                    {bulkAction && (
                      <span className="text-zinc-500">
                        {selectedIds.has(task._id) ? (
                          <CheckSquare className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">{task.title}</p>
                      <p className="text-xs text-zinc-500 truncate">{task.description}</p>
                    </div>
                    <Badge
                      variant={
                        task.priority === "urgent"
                          ? "error"
                          : task.priority === "high"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {task.priority}
                    </Badge>
                    <span className="text-xs text-zinc-500 w-20 text-right">
                      {task.status.replace(/_/g, " ")}
                    </span>
                    {task.assignee && (
                      <span className="text-base" title={task.assignee.name}>
                        {task.assignee.emoji}
                      </span>
                    )}
                    {!bulkAction && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setTaskToDelete(task); }}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-zinc-600 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Task detail panel */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedTask(null)}>
          <Card className="w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">{selectedTask.title}</span>
                {selectedTask.assignee && (
                  <span className="text-xl">{selectedTask.assignee.emoji}</span>
                )}
              </CardTitle>
              <div className="flex gap-2">
                <Badge
                  variant={
                    selectedTask.priority === "urgent"
                      ? "error"
                      : selectedTask.priority === "high"
                        ? "warning"
                        : "secondary"
                  }
                >
                  {selectedTask.priority}
                </Badge>
                <Badge variant="secondary">{selectedTask.status.replace(/_/g, " ")}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-400 whitespace-pre-wrap">{selectedTask.description}</p>

              {selectedTask.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedTask.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Messages */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Comments</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {messages?.map((m) => (
                    <div key={m._id} className="p-3 rounded-md bg-zinc-800/50 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        {m.sender && (
                          <>
                            <span>{m.sender.emoji}</span>
                            <span className="text-xs font-medium text-zinc-300">{m.sender.name}</span>
                          </>
                        )}
                        <span className="text-[10px] text-zinc-600">
                          {new Date(m.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <MentionText content={m.content} />
                    </div>
                  ))}
                  {messages?.length === 0 && <p className="text-xs text-zinc-600">No comments yet</p>}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => { setTaskToDelete(selectedTask); setSelectedTask(null); }}
                  className="text-xs text-red-500/70 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <CreateTaskDialog isOpen={showCreateDialog} onClose={() => setShowCreateDialog(false)} />
      <DeleteTaskDialog
        task={taskToDelete}
        open={!!taskToDelete}
        onOpenChange={(open) => { if (!open) setTaskToDelete(null); }}
        onDeleted={() => setTaskToDelete(null)}
      />
    </div>
  );
}

/** Renders message content with highlighted @mentions */
function MentionText({ content }: { content: string }) {
  const parts = content.split(/(@\w+)/g);
  return (
    <p className="text-zinc-300">
      {parts.map((part, i) =>
        part.startsWith("@") ? (
          <span key={i} className="text-emerald-400 font-medium">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}
