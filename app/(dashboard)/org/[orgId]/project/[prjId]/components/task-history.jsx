"use client";
import { useState } from "react";
import { Button } from "@/components/button";
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog";
import { ScrollArea } from "@/components/scroll-area";
import { Separator } from "@/components/separator";
import { Badge } from "@/components/badge";
import { Avatar, AvatarFallback } from "@/components/avatar";
import { Clock } from "lucide-react";

// Helper function to format the changed value based on its type
const formatChangedValue = (change, value) => {
  if (change === "ASSIGNED_TO" || change === "REVIEWERS") {
    if (Array.isArray(value) && value.length === 0) {
      return "None";
    }

    if (Array.isArray(value)) {
      return value.map((user) => user.name).join(", ");
    }
  }

  if (change === "DUE_DATE") {
    if (!value || value === "not fixed" || value === "") {
      return "None"; // or any other default value you prefer
    }
    return format(parseISO(value), "PPP");
  }

  return value;
};
// Helper function to get a human-readable change description
const getChangeDescription = (change) => {
  const changeMap = {
    TITLE: "Title changed to",
    DESC: "Description updated to",
    DUE_DATE: "Due date set to",
    STATUS: "Status changed to",
    PRIORITY: "Priority set to",
    ASSIGNED_TO: "Assigned to",
    REVIEWERS: "Reviewers set to",
  };

  return changeMap[change] || "Changed";
};

export default function TaskHistoryButton({ groupedHistory }) {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setShowHistory(true)}>
        <Clock />
        History
      </Button>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-md max-h-[80vh] pr-0">
          <DialogHeader>
            <DialogTitle>Task History</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            {groupedHistory.map((group) => (
              <div key={group.date} className="mb-6">
                <div className="sticky top-0 bg-background pt-2 pb-1 z-10">
                  <Badge variant="outline" className="mb-2">
                    {group.formattedDate}
                  </Badge>
                </div>
                <div className="space-y-4">
                  {group.items.map((item) => (
                    <div key={item.id} className="relative pl-6 pb-2">
                      <div className="absolute left-0 top-0">{item.icon}</div>
                      <div className="flex flex-col gap-1 pl-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {item.changedBy.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {item.changedBy.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(parseISO(item.date), "h:mm a")}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            {getChangeDescription(item.change)}
                          </span>{" "}
                          <span className="font-medium">
                            {formatChangedValue(item.change, item.changedValue)}
                          </span>
                        </div>
                      </div>
                      <Separator className="mt-2" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
