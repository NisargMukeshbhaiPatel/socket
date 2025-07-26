"use client";

import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/dialog";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Trash2, Calendar, Edit2, Save, X } from "lucide-react";
import { ScrollArea } from "@/components/scroll-area";

export default function SavedAssignmentsModal({ isOpen, onClose, onLoadAssignment }) {
  const [savedAssignments, setSavedAssignments] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editName, setEditName] = useState("");

  // Load saved assignments from localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      const assignments = JSON.parse(localStorage.getItem("savedStudentAssignments") || "[]");
      setSavedAssignments(assignments);
    }
  }, [isOpen]);

  const handleDeleteAssignment = (index) => {
    const updatedAssignments = [...savedAssignments];
    updatedAssignments.splice(index, 1);
    
    // Update local state and localStorage
    setSavedAssignments(updatedAssignments);
    localStorage.setItem("savedStudentAssignments", JSON.stringify(updatedAssignments));
    
    toast({
      title: "Assignment deleted",
    });
  };

  const handleStartEdit = (index, name) => {
    setEditingIndex(index);
    setEditName(name);
  };

  const handleSaveEdit = (index) => {
    if (!editName.trim()) {
      toast({
        title: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    const updatedAssignments = [...savedAssignments];
    updatedAssignments[index] = {
      ...updatedAssignments[index],
      name: editName
    };
    
    setSavedAssignments(updatedAssignments);
    localStorage.setItem("savedStudentAssignments", JSON.stringify(updatedAssignments));
    setEditingIndex(null);
    
    toast({
      title: "Assignment name updated",
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Saved Assignments</DialogTitle>
        </DialogHeader>
        
        {savedAssignments.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No saved assignments found</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {savedAssignments.map((assignment, index) => (
                <div 
                  key={index}
                  className="border p-4 rounded-lg flex items-center gap-4 hover:bg-accent/20 transition-colors"
                >
                  <div className="flex-1">
                    {editingIndex === index ? (
                      <div className="flex gap-2 items-center">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Assignment name"
                          className="flex-1"
                        />
                        <Button size="sm" variant="ghost" onClick={() => handleSaveEdit(index)}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingIndex(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <h3 className="font-medium">{assignment.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(assignment.timestamp)}</span>
                        </div>
                        <div className="text-sm mt-1">
                          Students: {assignment.students?.length || 0}
                          {" · "}
                          Staff: {assignment.staff?.length || 0}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartEdit(index, assignment.name)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteAssignment(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => onLoadAssignment(assignment)}
                    >
                      Load
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
