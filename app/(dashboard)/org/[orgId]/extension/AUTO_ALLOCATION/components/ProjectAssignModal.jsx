import { Button } from "@/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/dialog";
import AssignmentHistoryTable from "./AssignmentHistoryTable";

export default function ProjectAssignModal({ onClose, assignmentHistory }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Project Assignments</DialogTitle>
        </DialogHeader>
        <div className="mt-4 overflow-x-auto">
          <AssignmentHistoryTable assignmentHistory={assignmentHistory} />
        </div>
        <DialogClose asChild>
          <Button className="mt-4">Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
