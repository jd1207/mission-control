"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Trash2, X } from "lucide-react";

interface DeleteTaskDialogProps {
  task: {
    _id: string;
    title: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteTaskDialog({ task, open, onOpenChange, onDeleted }: DeleteTaskDialogProps) {
  const deleteTask = useMutation(api.tasks.deleteTask);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!task || !open) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTask({ id: task._id as any });
      onDeleted?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <Card className="max-w-md w-full mx-4 border-zinc-700 bg-zinc-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-zinc-100">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Task
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-zinc-400">
            Are you sure you want to delete &ldquo;{task.title}&rdquo;? This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">
            This will permanently delete the task and all associated comments and activities.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Task"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
