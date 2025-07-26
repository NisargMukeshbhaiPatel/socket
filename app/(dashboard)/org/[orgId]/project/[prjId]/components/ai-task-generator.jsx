"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { API_SUGGEST_TASKS } from "@/constants/api-routes";
import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { LocalTaskList } from "./task-list";
import { Loader2, LayoutList, Sparkles } from "lucide-react";

export default function AITaskGenerator({ members, statuses }) {
  const { orgId, prjId } = useParams();
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_SUGGEST_TASKS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgId,
          prjId,
        }),
      });

      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.error);
      }
      if (res.tasks.length < 0) {
        toast({
          title: "0 Tasks Generated",
          variant: "destructive",
        });
      }
      setGeneratedTasks(
        res.tasks.map((s, i) => ({ ...s, id: i.toString() })) || [],
      );
    } catch (err) {
      console.error(err);
      toast({
        title: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="max-w-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutList />
            AI Task Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button
              onClick={generateTasks}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Generate Tasks
            </Button>
          </div>
        </CardContent>
      </Card>
      {generatedTasks.length > 0 && (
        <>
          <div className="flex my-4">
            <h2 className="text-2xl font-bold ">Generated Tasks</h2>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <LocalTaskList
            tasks={generatedTasks}
            setTasks={setGeneratedTasks}
            members={members}
            statuses={statuses}
          />
        </>
      )}
    </>
  );
}
