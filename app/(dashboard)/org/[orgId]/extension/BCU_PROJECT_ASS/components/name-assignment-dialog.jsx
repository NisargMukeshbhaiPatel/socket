"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/dialog";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Label } from "@/components/label";

export default function NameAssignmentDialog({ isOpen, onClose, onSave, defaultName }) {
  const [name, setName] = useState("");
  
  // Update name whenever dialog opens or default name changes
  useEffect(() => {
    if (isOpen && defaultName) {
      setName(defaultName);
    }
  }, [isOpen, defaultName]);
  
  const handleSave = () => {
    // Use default name if field is empty
    const assignmentName = name.trim() ? name : defaultName;
    onSave(assignmentName);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Assignment</DialogTitle>
          <DialogDescription>
            Enter a name for this assignment to help you identify it later.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Assignment Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter assignment name"
              autoFocus
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
