"use client";
import { useState } from "react";
import { FileUp } from "lucide-react";
import { Button } from "@/components/button";

import { exportToCSV } from "@/lib/utils";

export default function AssignmentHistoryExport({ assignmentHistory }) {
  return (
    <Button
      variant="outline"
      onClick={() => exportToCSV(assignmentHistory, "assignment-history")}
    >
      <FileUp size={20} />
      Export to CSV
    </Button>
  );
}
