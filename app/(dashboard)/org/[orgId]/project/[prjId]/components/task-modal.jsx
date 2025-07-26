"use client";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog";
import { Label } from "@/components/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";
import { Info, Loader2 } from "lucide-react";
import MultiSelect from "./multi-select";

export default function TaskModal({
  task = null,
  statuses,
  members,
  isOpen,
  setIsOpen,
  onSubmit,
  isLoading,
  submitButtonText = "Save",
  title = "Task Details",
}) {
  const isEditMode = !!task;
  // Initialize state with task data if in edit mode, otherwise use defaults
  const [assignedTo, setAssignedTo] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  useEffect(() => {
    if (isEditMode) {
      setAssignedTo(task.assignedToProjectMemberIds || []);
      setReviewers(task.reviewersProjectMemberIds || []);
    }
  }, [task]);

  const defaultDueDate =
    isEditMode && task.dueDate
      ? new Date(task.dueDate).toISOString().split("T")[0]
      : "";

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const taskData = {
      ...task,
      title: formData.get("title"),
      description: formData.get("description"),
      dueDate: formData.get("dueDate"),
      priority: formData.get("priority"),
      status: formData.get("status"),
      assignedToProjectMemberIds: assignedTo,
      reviewersProjectMemberIds: reviewers,
    };

    // If in edit mode, include the task ID
    if (isEditMode) {
      taskData.id = task.id;
    }

    await onSubmit(taskData);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[740px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={isEditMode ? task.title : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={defaultDueDate}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={isEditMode ? task.description : ""}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                name="priority"
                defaultValue={isEditMode ? task.priority : "LOW"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                name="status"
                defaultValue={isEditMode ? task.status?.id : statuses[0]?.id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{status.name}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground ml-2" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{status.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <MultiSelect
                options={members}
                selected={assignedTo}
                onChange={setAssignedTo}
                placeholder="Select members"
              />
            </div>
            <div className="space-y-2">
              <Label>Reviewers</Label>
              <MultiSelect
                options={members}
                selected={reviewers}
                onChange={setReviewers}
                placeholder="Select reviewers"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {submitButtonText}
                </>
              ) : (
                submitButtonText
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
