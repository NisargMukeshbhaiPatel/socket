import { useState } from "react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/card";
import { Avatar, AvatarFallback } from "@/components/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/dialog";
import { Calendar, Edit, Loader2, User, X } from "lucide-react";
import { Badge } from "@/components/badge";
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
import { PRIORITY_COLORS } from "../../../components/task-priorities.js";
import { DatePickerWithRange } from "../../../components/date-range-picker.jsx";
import { useParams, useRouter } from "next/navigation";

import { API_UPDATE_TASK, API_MARK_TASK_AS_DONE } from "@/constants/api-routes";
import TaskModal from "../../../components/task-modal";
import UserAvatarGroup from "../../../components/user-avatar-group";

export default function TaskCard({
  task,
  setTasks,
  statuses,
  members,
  onDragEnd,
}) {
  const { orgId, prjId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const router = useRouter();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      task,
      currStatusId: task.status?.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  async function handleMarkAsDone(e) {
    e.stopPropagation();
    try {
      setIsLoading(true);
      const response = await fetch(API_MARK_TASK_AS_DONE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgId,
          prjId,
          taskId: task.id,
        }),
      });

      const res = await response.json();
      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.error);
      }

      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                showDoneBtn: false,
                status: statuses.find((s) => s.id === res.statusId),
              }
            : t,
        ),
      );
    } catch (error) {
      console.error("Error marking task as done:", error);
      toast({
        title: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateTask(taskData) {
    setIsLoading(true);
    const originalTask = task;
    const changes = {};

    ["title", "description", "priority"].forEach((prop) => {
      if (taskData[prop] !== originalTask[prop]) changes[prop] = taskData[prop];
    });
    if (originalTask.status.id !== taskData.status) {
      changes.status = taskData.status;
    }

    if (taskData.dueDate !== originalTask.dueDate) {
      changes.dueDate = taskData.dueDate;
    }
    const compareArrays = (a = [], b = []) => {
      if (a.length !== b.length) return false;
      const setB = new Set(b);
      return a.every((id) => setB.has(id));
    };

    if (
      !compareArrays(
        taskData.assignedToProjectMemberIds,
        originalTask.assignedTo.map((t) => t.id),
      )
    ) {
      changes.assignedTo = taskData.assignedToProjectMemberIds;
    }
    if (
      !compareArrays(
        taskData.reviewersProjectMemberIds,
        originalTask.reviewers.map((t) => t.id),
      )
    ) {
      changes.reviewers = taskData.reviewersProjectMemberIds;
    }

    try {
      const response = await fetch(API_UPDATE_TASK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgId,
          prjId,
          taskId: task.id,
          changes,
        }),
      });

      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.error);
      }

      router.refresh();
      toast({
        title: "Task updated successfully",
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        title: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function onEditClick(e) {
    e.stopPropagation();
    setIsEditDialogOpen(true);
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="cursor-pointer"
      >
        <Card className="bg-background transition-all hover:shadow-md flex flex-col">
          <CardHeader className="space-y-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base line-clamp-1">
                {task.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                {task.priority && (
                  <Badge className={PRIORITY_COLORS[task.priority]}>
                    {task.priority}
                  </Badge>
                )}
                {task.canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onEditClick}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {task.status && (
                <Badge className="-ml-1" variant="secondary">
                  {task.status.name}
                </Badge>
              )}
              {task.description && (
                <p className="text-sm line-clamp-2">{task.description}</p>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6 mt-auto">
            <div>
              {task.dueDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 opacity-60" />
                  <p className="text-md text-muted-foreground">
                    Due date {format(new Date(task.dueDate), "MMM dd, yyyy")}
                  </p>
                </div>
              )}
              {task.createdBy && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <p className="text-md text-muted-foreground">
                    Created by {task.createdBy}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-4 flex-wrap items-center">
              {task.assignedTo?.length > 0 && (
                <UserAvatarGroup
                  users={task.assignedTo}
                  label={`Assigned to [${task.assignedTo.length}]`}
                />
              )}
              {task.reviewers?.length > 0 && (
                <UserAvatarGroup
                  users={task.reviewers}
                  label={`Reviewers [${task.reviewers.length}]`}
                />
              )}
              <div className="ml-auto flex gap-2 flex-wrap">
                {task.showDoneBtn && (
                  <Button
                    size="sm"
                    className="ml-auto"
                    onClick={handleMarkAsDone}
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Mark as Done
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TaskModal
        task={{
          ...task,
          assignedToProjectMemberIds: task.assignedTo?.map((m) => m.id),
          reviewersProjectMemberIds: task.reviewers?.map((m) => m.id),
        }}
        statuses={statuses}
        members={members}
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        onSubmit={handleUpdateTask}
        isLoading={isLoading}
        submitButtonText="Update Task"
        title="Edit Task"
      />
    </>
  );
}
