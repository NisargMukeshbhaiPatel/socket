"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  API_CREATE_BULK_TASK,
  API_UPDATE_TASK,
  API_MARK_TASK_AS_DONE,
} from "@/constants/api-routes";
import { Upload, Plus, Trash2, Edit } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { Button } from "@/components/button";
import { toast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";

import TaskCard from "./task-card";
import TaskModal from "./task-modal";
import FilterBar from "./filter-bar";
import { PRIORITIES } from "./task-priorities.js";

// TaskList
export const EditableTaskList = ({
  tasks: initialTasks,
  statuses,
  members,
}) => {
  const router = useRouter();
  const { orgId, prjId } = useParams();
  const [tasks, setTasks] = useState(initialTasks);
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(undefined);
  const [priority, setPriority] = useState(undefined);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const hasActiveFilters = useMemo(() => {
    return search || status || priority || (dateRange?.from && dateRange?.to);
  }, [search, status, priority, dateRange]);

  const handleResetFilters = () => {
    setSearch("");
    setStatus(undefined);
    setPriority(undefined);
    setDateRange({ from: null, to: null });
  };

  const filteredTasks = useMemo(() => {
    const fromDate = dateRange?.from ? new Date(dateRange.from) : null;
    const toDate = dateRange?.to ? new Date(dateRange.to) : null;
    const searchLower = search?.toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !search || task.title.toLowerCase().includes(searchLower);
      const matchesStatus = !status || task.status.id === status;
      const matchesPriority =
        !priority || PRIORITIES[task.priority] === priority;
      const matchesDate =
        !fromDate ||
        !toDate ||
        (() => {
          const taskDate = new Date(task.dueDate);
          return taskDate >= fromDate && taskDate <= toDate;
        })();

      return matchesSearch && matchesStatus && matchesPriority && matchesDate;
    });
  }, [tasks, search, status, priority, dateRange]);

  const handleEditTask = (task) => {
    const formattedTask = {
      ...task,
      priority: task.priority,
      status: task.status,
      assignedToProjectMemberIds: task.assignedTo.map((m) => m.id),
      reviewersProjectMemberIds: task.reviewers.map((m) => m.id),
    };

    setEditingTask(formattedTask);
    setIsModalOpen(true);
  };

  async function handleUpdateTask(taskData) {
    setIsLoading(true);
    const originalTask = tasks.find((task) => task.id === editingTask.id);
    console.log(originalTask);
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
          taskId: editingTask.id,
          changes,
        }),
      });

      if (!response.ok) {
        const res = await response.json();
        console.log(res);
        throw new Error(res.error);
      }

      router.refresh();
      toast({
        title: "Task updated successfully",
      });
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMarkAsDone(taskId) {
    try {
      const response = await fetch(API_MARK_TASK_AS_DONE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgId,
          prjId,
          taskId,
        }),
      });
      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.error);
      }
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                showDoneBtn: false,
                status: statuses.find((s) => s.id === res.statusId),
              }
            : task,
        ),
      );
    } catch (error) {
      console.log(error);
      toast({
        title: error.message,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6">
      <FilterBar
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        priority={priority}
        setPriority={setPriority}
        dateRange={dateRange}
        setDateRange={setDateRange}
        statuses={statuses}
        hasActiveFilters={hasActiveFilters}
        handleResetFilters={handleResetFilters}
      />

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No tasks available. Create a new one or adjust the filter.
          </p>
        </div>
      ) : (
        <div className="max-h-[calc(100vh-145px)] overflow-y-auto pr-4 -mr-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTasks.map((task, index) => (
              <TaskCard
                key={index}
                task={task}
                handleMarkAsDone={handleMarkAsDone}
                actions={
                  task.canEdit ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditTask(task)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  ) : null
                }
              />
            ))}
          </div>
        </div>
      )}

      <TaskModal
        task={editingTask}
        statuses={statuses}
        members={members}
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onSubmit={handleUpdateTask}
        isLoading={isLoading}
        submitButtonText="Update Task"
        title="Edit Task"
      />
    </div>
  );
};

// AI TaskList
export const LocalTaskList = ({ tasks, setTasks, statuses, members }) => {
  const { orgId, prjId } = useParams();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(undefined);
  const [priority, setPriority] = useState(undefined);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const hasActiveFilters = useMemo(() => {
    return search || status || priority || (dateRange?.from && dateRange?.to);
  }, [search, status, priority, dateRange]);

  const handleResetFilters = () => {
    setSearch("");
    setStatus(undefined);
    setPriority(undefined);
    setDateRange({ from: null, to: null });
  };

  const filteredTasks = useMemo(() => {
    const fromDate = dateRange?.from ? new Date(dateRange.from) : null;
    const toDate = dateRange?.to ? new Date(dateRange.to) : null;
    const searchLower = search?.toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !search || task.title.toLowerCase().includes(searchLower);
      const matchesStatus = !status || task.status.id === status;
      const matchesPriority = !priority || task.priority === priority;
      const matchesDate =
        !fromDate ||
        !toDate ||
        (() => {
          const taskDate = new Date(task.dueDate);
          return taskDate >= fromDate && taskDate <= toDate;
        })();

      return matchesSearch && matchesStatus && matchesPriority && matchesDate;
    });
  }, [tasks, search, status, priority, dateRange]);

  const handleAddTask = () => {
    const newTask = {
      id: `temp-${Date.now()}`,
      title: "",
      description: "",
      status: statuses[0],
      priority: "LOW",
      dueDate: new Date().toISOString(),
      assignedTo: [],
      reviewers: [],
    };
    setEditingTask(newTask);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask({
      ...task,
      assignedToProjectMemberIds: task.assignedTo?.map((m) => m.id),
      reviewersProjectMemberIds: task.reviewers?.map((m) => m.id),
    });
    setIsModalOpen(true);
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const handleUpdateTask = (taskData) => {
    const updatedTask = {
      id: editingTask.id,
      title: taskData.title,
      description: taskData.description,
      status: statuses.find((s) => s.id === taskData.status),
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      assignedTo: members.filter((m) =>
        taskData.assignedToProjectMemberIds.includes(m.id),
      ),
      reviewers: members.filter((m) =>
        taskData.reviewersProjectMemberIds.includes(m.id),
      ),
    };

    setTasks((prev) => {
      const isExisting = prev.some((task) => task.id === updatedTask.id);
      if (isExisting) {
        return prev.map((task) =>
          task.id === updatedTask.id ? updatedTask : task,
        );
      } else {
        return [...prev, updatedTask];
      }
    });

    setIsModalOpen(false);
  };

  const router = useRouter();
  const handleUploadTasks = async () => {
    setIsUploading(true);
    try {
      const response = await fetch(API_CREATE_BULK_TASK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgId,
          prjId,
          tasks: tasks.map((t) => ({ ...t, status: t.status?.id })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload tasks");
      }

      toast({
        title: "All Tasks uploaded successfully",
      });

      // Clear local tasks after successful upload
      setTasks([]);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <FilterBar
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          priority={priority}
          setPriority={setPriority}
          dateRange={dateRange}
          setDateRange={setDateRange}
          statuses={statuses}
          hasActiveFilters={hasActiveFilters}
          handleResetFilters={handleResetFilters}
        />
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No tasks available. Create a new one or adjust the filter.
          </p>
        </div>
      ) : (
        <div className="max-h-[calc(100vh-145px)] overflow-y-auto pr-4 -mr-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                actions={
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditTask(task)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTask(task.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                }
              />
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleAddTask} variant="outline">
              <Plus className="h-4 w-4 " />
              Add Task
            </Button>
            <Button
              onClick={handleUploadTasks}
              disabled={tasks.length === 0 || isUploading}
            >
              <Upload className="h-4 w-4 " />
              Confirm and Create tasks
            </Button>
          </div>
        </div>
      )}

      <TaskModal
        task={editingTask}
        statuses={statuses}
        members={members}
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onSubmit={handleUpdateTask}
        isLoading={false}
        submitButtonText={
          editingTask?.id.startsWith("temp-") ? "Add Task" : "Update Task"
        }
        title={editingTask?.id.startsWith("temp-") ? "Add Task" : "Edit Task"}
      />
    </div>
  );
};
