"use client";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskCard from "./task-card";

export default function KanbanColumn({
  status,
  statuses,
  members,
  tasks,
  setTasks,
}) {
  const { setNodeRef } = useDroppable({
    id: status.id,
  });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col bg-muted/40 rounded-lg min-w-[330px] h-[calc(100vh-40px)]"
    >
      <div className="sticky top-0 px-3 py-2 font-medium bg-muted rounded-t-lg z-10">
        <div className="flex items-center justify-between">
          <h3>{status.name}</h3>
          <span className="bg-primary/10 text-primary text-sm font-bold px-2.5 py-0.5 rounded">
            {tasks.length}
          </span>
        </div>
      </div>
      <div className="pt-3 p-2 flex-1 overflow-y-auto">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                setTasks={setTasks}
                statuses={statuses}
                members={members}
              />
            ))}
          </div>
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}
