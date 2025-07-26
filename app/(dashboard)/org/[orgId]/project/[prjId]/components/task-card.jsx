import { useState } from "react";
import { format } from "date-fns";
import { Calendar, User, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import TaskHistoryButton from "./task-history";

import { PRIORITIES, PRIORITY_COLORS } from "./task-priorities.js";
import UserAvatarGroup from "./user-avatar-group";

const TaskCard = ({ task, onClick, handleMarkAsDone, actions = null }) => {
  const [isLoading, setIsLoading] = useState(false);

  async function onMarkAsDoneClick(taskId) {
    try {
      setIsLoading(true);
      await handleMarkAsDone(taskId);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="transition-all hover:shadow-md flex flex-col">
      <CardHeader className="space-y-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base line-clamp-1">{task.title}</CardTitle>
          <div className="flex items-center gap-2">
            {task.priority && (
              <Badge className={PRIORITY_COLORS[PRIORITIES[task.priority]]}>
                {PRIORITIES[task.priority]}
              </Badge>
            )}
            {actions}
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
                onClick={() => onMarkAsDoneClick(task.id)}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Mark as Done
              </Button>
            )}
            {task.groupedHistory && (
              <TaskHistoryButton groupedHistory={task.groupedHistory} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
