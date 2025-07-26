"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";

 const projects = [
  { id: 1, name: 'Project Alpha' },
  { id: 2, name: 'Project Beta' },
  { id: 3, name: 'Project Gamma' },
  { id: 4, name: 'Project Delta' },
  { id: 5, name: 'Project Epsilon' },
];


export function ProjectSelectionModal({
  isOpen,
  onClose,
  onProjectsSelected,
}) {
  const [selectedProjects, setSelectedProjects] = useState([]);

  const handleProjectToggle = (projectId) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId],
    );
  };

  const handleSubmit = () => {
    onProjectsSelected(selectedProjects);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Projects</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="flex items-center space-x-2">
              <Checkbox
                id={`project-${project.id}`}
                checked={selectedProjects.includes(project.id)}
                onCheckedChange={() => handleProjectToggle(project.id)}
              />
              <label htmlFor={`project-${project.id}`}>{project.name}</label>
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add to Projects</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
