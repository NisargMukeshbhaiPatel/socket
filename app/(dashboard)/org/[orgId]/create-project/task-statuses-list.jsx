import React, { useState } from "react";
import { Button } from "@/components/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { Badge } from "@/components/badge";
import { ScrollArea } from "@/components/scroll-area";
import { Pencil, Trash, Plus } from "lucide-react";
import TaskStatusModal from "./task-status-modal";

export default function TaskStatusesList({
  tasks,
  setTasks,
  selectedDoneTaskIndex,
  setSelectedDoneTaskIndex,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const openAddTaskModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDoneStatusSelectionChange = (value) => {
    const index = Number.parseInt(value);
    setSelectedDoneTaskIndex(index);
  };

  const handleSaveTask = (task) => {
    if (!task.name.trim()) {
      return;
    }
    if (editingTask) {
      const updatedTasks = tasks.map((t) =>
        t.id === editingTask.id ? { ...task, id: editingTask.id } : t,
      );
      setTasks(updatedTasks);
    } else {
      const newTask = { ...task, id: crypto.randomUUID() };
      setTasks([...tasks, newTask]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteTask = (taskId) => {
    let shouldAdjustSelection = false;
    const updatedTasks = tasks.filter((task, index) => {
      if (task.id === taskId && index <= selectedDoneTaskIndex) {
        shouldAdjustSelection =
          index === selectedDoneTaskIndex ? "remove" : "shift";
      }
      return task.id !== taskId;
    });

    if (shouldAdjustSelection === "remove") {
      setSelectedDoneTaskIndex(-1);
    } else if (shouldAdjustSelection === "shift") {
      setSelectedDoneTaskIndex(selectedDoneTaskIndex - 1);
    }

    setTasks(updatedTasks);
  };

  return (
    <>
      {tasks.length > 0 ? (
        <ScrollArea className="h-[180px]">
          {tasks.map((task) => (
            <Card key={task.id} className="mb-4">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <Badge className="text-md">{task.name}</Badge>
                  </CardTitle>
                  <div className="flex">
                    <Button
                      variant="ghost"
                      type="button"
                      size="sm"
                      onClick={() => openEditTaskModal(task)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      type="button"
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{task.description}</p>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      ) : (
        <Card className="mb-4">
          <CardHeader>
            <p className="text-muted-foreground">
              No tasks yet. Add a new task.
            </p>
          </CardHeader>
        </Card>
      )}
      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
        <Button
          type="button"
          className="flex-grow"
          onClick={openAddTaskModal}
          variant="outline"
        >
          <Plus className="w-6 h-6 -ml-1" /> Add New Task Status
        </Button>
        <Select
          value={selectedDoneTaskIndex}
          onValueChange={handleDoneStatusSelectionChange}
        >
          <SelectTrigger className="sm:max-w-xs w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={-1}>Select Done Status</SelectItem>
            {tasks.map((task, index) => (
              <SelectItem key={index} value={index}>
                {task.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <TaskStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask || undefined}
      />
    </>
  );
}
