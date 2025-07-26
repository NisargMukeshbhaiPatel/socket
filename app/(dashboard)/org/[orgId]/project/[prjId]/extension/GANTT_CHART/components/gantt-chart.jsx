"use client";
import { useState, useEffect } from "react";
import { User, Calendar } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/card";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";

import UserAvatarGroup from "../../../components/user-avatar-group";
import {
  PRIORITY_COLORS,
  PRIORITIES,
} from "../../../components/task-priorities.js";

import { differenceInDays, parseISO, addDays, format } from "date-fns";

const DEFAULT_DURATION_DAYS = 1;
export default function GanttChart({ myTasks, allTasks }) {
  const [viewMode, setViewMode] = useState("my-tasks");
  const [timelineInfo, setTimelineInfo] = useState({
    startDate: null,
    endDate: null,
    totalDays: 0,
    processedTasks: [],
  });

  useEffect(() => {
    const tasks = viewMode === "my-tasks" ? myTasks : allTasks;
    if (tasks.length === 0) {
      setTimelineInfo({
        startDate: null,
        endDate: null,
        totalDays: 0,
        processedTasks: [],
      });
      return;
    }
    const processedTasks = tasks.map((task) => {
      const startDate = parseISO(task.created);
      
      if (task.dueDate) {
        const parsedDueDate = parseISO(task.dueDate);
        
        const adjustedStartDate = parsedDueDate < startDate ? parsedDueDate : startDate;
        const endDate = parsedDueDate;
        
        return {
          ...task,
          startDate: adjustedStartDate,
          endDate,
          duration: differenceInDays(endDate, adjustedStartDate) + 1,
        };
      } else {
        const endDate = addDays(startDate, DEFAULT_DURATION_DAYS);
        
        return {
          ...task,
          startDate,
          endDate,
          duration: DEFAULT_DURATION_DAYS + 1,
        };
      }
    });

    // Find the earliest and latest dates
    const allDates = [];
    processedTasks.forEach((task) => {
      allDates.push(task.startDate);
      allDates.push(task.endDate);
    });

    const startDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const endDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
    const totalDays = differenceInDays(endDate, startDate) + 1;

    setTimelineInfo({
      startDate,
      endDate,
      totalDays,
      processedTasks,
    });
  }, [viewMode, myTasks, allTasks]);

  // Generate date markers based on timeline length
  const getDateMarkers = () => {
    const { startDate, totalDays } = timelineInfo;
    console.log("69", startDate, totalDays);
    if (!startDate || totalDays === 0) return [];

    let markerCount = 5; // Default number of markers
    if (totalDays > 60) markerCount = 6;
    else if (totalDays > 30) markerCount = 8;
    else if (totalDays <= 10) markerCount = totalDays + 1;

    const interval = Math.max(1, Math.floor(totalDays / (markerCount - 1)));
    const markers = [];

    for (let i = 0; i <= totalDays; i += interval) {
      const date = addDays(startDate, i);
      markers.push({
        day: i,
        date: format(date, "MMM d"),
      });
    }

    // Always include the end date if not already included
    const lastDay = markers[markers.length - 1]?.day;
    if (lastDay !== totalDays) {
      markers.push({
        day: totalDays,
        date: format(addDays(startDate, totalDays), "MMM d"),
      });
    }

    return markers;
  };

  // Calculate task position and width as percentages
  const getTaskStyle = (task) => {
    const { startDate, totalDays } = timelineInfo;
    if (!startDate || totalDays === 0) return { left: "0%", width: "0%" };

    const taskStartOffset = differenceInDays(task.startDate, startDate);
    const taskDuration = task.duration;

    const leftPosition = (taskStartOffset / totalDays) * 100;
    const widthPercentage = (taskDuration / totalDays) * 100;

    return {
      left: `${leftPosition}%`,
      width: `${widthPercentage}%`,
    };
  };

  // Get color for task
  const getTaskColor = (index) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-amber-500",
      "bg-pink-500",
    ];
    return colors[index % colors.length];
  };

  // Format date for tooltip
  const formatDate = (date) => {
    return format(date, "MMM d, yyyy");
  };

  return allTasks.length !== 0 || myTasks.length !== 0 ? (
    <div>
      {allTasks?.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex ml-auto border bg-muted rounded-lg">
            <Button
              variant={viewMode === "my-tasks" ? "default" : "ghost"}
              className="flex-1 rounded-r-none"
              onClick={() => setViewMode("my-tasks")}
            >
              My Tasks {"(" + myTasks.length + ")"}
            </Button>
            <Button
              variant={viewMode === "all-tasks" ? "default" : "ghost"}
              className="flex-1 rounded-l-none"
              onClick={() => setViewMode("all-tasks")}
            >
              All Tasks {"(" + allTasks.length + ")"}
            </Button>
          </div>
        </div>
      )}

      <Card className="w-full">
        <CardContent>
          {/* Timeline header with dates */}
          <div className="w-full relative mb-2 mt-6 h-6">
            {getDateMarkers().map((marker, index) => (
              <div
                key={index}
                className="absolute w-min top-0 text-xs text-muted-foreground transform -translate-x-1/2"
                style={{
                  left: `${(marker.day / timelineInfo.totalDays) * 100}%`,
                }}
              >
                {marker.date}
              </div>
            ))}
          </div>

          {/* Timeline grid with vertical lines */}
          <div className="w-full h-8 bg-muted relative rounded-md mb-4">
            {getDateMarkers().map((marker, index) => (
              <div
                key={index}
                className="absolute top-0 bottom-0 border-2 -ml-1 border-gray-300"
                style={{
                  left: `${(marker.day / timelineInfo.totalDays) * 100}%`,
                }}
              />
            ))}
          </div>

          {/* Task bars */}
          <div className="space-y-6 pt-2">
            {timelineInfo.processedTasks.map((task, index) => (
              <div key={task.id} className="relative">
                {/* Task label */}
                <div className="text-sm font-medium mb-1">{task.title}</div>

                <div className="h-10 rounded-sm relative bg-muted">
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {/* Task bar */}
                        <div
                          className={`absolute h-full cursor-pointer rounded-md ${getTaskColor(index)} text-white px-2 flex items-center justify-between shadow-sm hover:opacity-90 transition-opacity`}
                          style={getTaskStyle(task)}
                        >
                          <span className="text-xs truncate">
                            {format(task.startDate, "MMM d")}
                          </span>
                          <span className="text-xs truncate">
                            {format(task.endDate, "MMM d")}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        className="bg-background border border-2 border-muted dark:bg-background w-80 p-0"
                        side="right"
                      >
                        <Card className="border-0 shadow-none">
                          <CardHeader className="space-y-0 pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base line-clamp-1">
                                {task.title}
                              </CardTitle>
                              {task.priority && (
                                <Badge
                                  className={
                                    PRIORITY_COLORS[PRIORITIES[task.priority]]
                                  }
                                >
                                  {PRIORITIES[task.priority]}
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-2">
                              {task.status && (
                                <Badge className="-ml-1" variant="secondary">
                                  {task.status.name}
                                </Badge>
                              )}
                              <p className="text-sm text-muted-foreground">
                                {formatDate(task.startDate)} -{" "}
                                {formatDate(task.endDate)}
                              </p>
                              {task.description && (
                                <p className="text-sm line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3 pt-0">
                            <div>
                              {task.dueDate && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 opacity-60" />
                                  <p className="text-sm text-muted-foreground">
                                    Due date{" "}
                                    {format(
                                      new Date(task.dueDate),
                                      "MMM dd, yyyy",
                                    )}
                                  </p>
                                </div>
                              )}
                              {task.createdBy && (
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <p className="text-sm text-muted-foreground">
                                    Created by {task.createdBy}
                                  </p>
                                </div>
                              )}
                            </div>
                            {(task.assignedTo?.length > 0 ||
                              task.reviewers?.length > 0) && (
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
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  ) : (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Calendar className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No tasks found</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          There are currently no tasks to display. Create a new task to get
          started.
        </p>
      </CardContent>
    </Card>
  );
}
