"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Trash2 } from "lucide-react";

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

  const handleDelete = async () => {
    if (!task) return;

    setIsDeleting(true);
    try {
      await deleteTask({ id: task._id as any });
      onOpenChange(false);
      onDeleted?.();
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Trash2 className="h-5 w-5 text-red-500" />
            </div>
            <DialogTitle>Delete Task</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete "{task?.title}"? This action cannot be undone and will also remove all associated messages, activities, and notifications.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}