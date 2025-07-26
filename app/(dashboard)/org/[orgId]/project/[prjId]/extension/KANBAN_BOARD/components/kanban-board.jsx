"use client";
import { useParams, useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import KanbanColumn from "./kanban-column";
import TaskCard from "./task-card";
import FilterBar from "../../../components/filter-bar";
import { API_UPDATE_TASK } from "@/constants/api-routes";

export default function KanbanBoard({
  myTasks,
  allTasks,
  initialStatuses: statuses,
  initialMembers: members,
}) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState("my-tasks");
  const { orgId, prjId } = useParams();
  const [isUpdating, setIsUpdating] = useState(false);

  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    setTasks(viewMode === "my-tasks" ? myTasks : allTasks);
  }, [viewMode, myTasks, allTasks]);

  const [activeTask, setActiveTask] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTask, setModalTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [priorityFilter, setPriorityFilter] = useState(undefined);
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });

  const hasActiveFilters =
    !!searchQuery ||
    !!statusFilter ||
    !!priorityFilter ||
    (dateRange?.from && dateRange?.to);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 100,
      },
    }),
  );

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase() || "");

    const matchesStatus = !statusFilter || task.status.id === statusFilter;

    const matchesPriority = !priorityFilter || task.priority === priorityFilter;

    const matchesDateRange =
      !dateRange?.from ||
      !dateRange?.to ||
      (new Date(task.dueDate) >= dateRange.from &&
        new Date(task.dueDate) <= dateRange.to);

    return (
      matchesSearch && matchesStatus && matchesPriority && matchesDateRange
    );
  });

  function handleDragStart(event) {
    const { active } = event;
    setActiveTask(active.data.current.task);
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = tasks.find((task) => task.id === activeId);
    const isOverAColumn = statuses.find((status) => status.id === overId);

    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        return tasks.map((task) => {
          if (task.id === activeId) {
            return { ...task, status: isOverAColumn };
          }
          return task;
        });
      });
    }
  }

  async function updateTaskStatusOnServer(taskId, newStatusId) {
    setIsUpdating(true);
    try {
      const response = await fetch(API_UPDATE_TASK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgId,
          prjId,
          taskId: taskId,
          changes: {
            status: newStatusId,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update task status");
      }
      return true;
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: error.message || "Failed to update task status",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) {
      setActiveTask(null);
      return;
    }
    const activeId = active.id;
    const overId = over.id;

    const activeIndex = tasks.findIndex((t) => t.id === activeId);
    const overIndex = tasks.findIndex((t) => t.id === overId);
    const statusChanged =
      activeTask.status.id !== active.data.current.currStatusId;
    if (statusChanged) {
      // Fix: Mark as done btn on Done Column
      setTasks((tasks) => {
        const newTasks = [...tasks];
        newTasks[activeIndex] = {
          ...newTasks[activeIndex],
          status: tasks[overIndex].status,
        };

        return arrayMove(newTasks, activeIndex, overIndex);
      });

      const success = await updateTaskStatusOnServer(
        activeId,
        active.data.current.currStatusId,
      );
      router.refresh();
      // If the server update failed, revert the status change
      if (!success) {
        setTasks((tasks) => {
          return tasks.map((task) => {
            if (task.id === activeId) {
              return { ...task, status: over.data.current.currStatusId };
            }
            return task;
          });
        });
      }
    }
    setActiveTask(null);
  }

  function handleResetFilters() {
    setSearchQuery("");
    setStatusFilter(undefined);
    setPriorityFilter(undefined);
    setDateRange({ from: undefined, to: undefined });
  }

  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        search={searchQuery}
        setSearch={setSearchQuery}
        status={statusFilter}
        setStatus={setStatusFilter}
        priority={priorityFilter}
        setPriority={setPriorityFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        statuses={statuses}
        hasActiveFilters={hasActiveFilters}
        handleResetFilters={handleResetFilters}
        disabled={isUpdating}
      />
      {allTasks?.length && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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

      <div className="flex gap-4 overflow-x-auto">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {statuses.map((status) => (
            <SortableContext
              key={status.id}
              items={filteredTasks
                .filter((task) => task.status.id === status.id)
                .map((task) => task.id)}
            >
              <KanbanColumn
                status={status}
                statuses={statuses}
                members={members}
                tasks={filteredTasks.filter(
                  (task) => task.status.id === status.id,
                )}
                setTasks={setTasks}
                disabled={isUpdating}
              />
            </SortableContext>
          ))}

          <DragOverlay>
            {activeTask && (
              <TaskCard task={activeTask} statuses={[]} members={[]} />
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
