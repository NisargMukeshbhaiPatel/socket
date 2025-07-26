"use client";
import { API_CREATE_TASK } from "@/constants/api-routes";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
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
  DialogTrigger,
} from "@/components/dialog";
import { Label } from "@/components/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";
import { Plus, Info } from "lucide-react";

import MultiSelect from "./multi-select";
import TaskModal from "./task-modal";

export default function CreateTaskButton({ statuses, members }) {
  const { orgId, prjId } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleCreateTask(taskData) {
    setIsLoading(true);

    const completeTaskData = {
      ...taskData,
      orgId,
      prjId,
    };

    try {
      const response = await fetch(API_CREATE_TASK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(completeTaskData),
      });

      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.error);
      }
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        title: error.message || "Failed to create task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus size={18} />
        Create Task
      </Button>
      <TaskModal
        statuses={statuses}
        members={members}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onSubmit={handleCreateTask}
        isLoading={isLoading}
        submitButtonText="Create"
        title="Create New Task"
      />
    </>
  );
}
