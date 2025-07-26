"use client";
import { toast } from "@/hooks/use-toast";
import { useDBTranslation } from "@/hooks/use-db-translation";
import { useState, useRef } from "react";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { Badge } from "@/components/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/ui/components/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { Loader2, Pencil } from "lucide-react";
import ProjectSkillsDialog from "./request-components/project-skills-dialog";
import ProjectAssignModal from "./ProjectAssignModal";

export default function ProjectsList({
  orgId,
  role,
  allSkills,
  assignmentHistory,
  unassignedProjects,
  selectedProjects,
  setSelectedProjects,
}) {
  const [projects, setProjects] = useState(unassignedProjects);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const skillsModalRef = useRef(null);
  const tDB = useDBTranslation();

  const handleProjectToggle = (projectId) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId],
    );
  };

  const handleSaveSkills = (projectId, newSkills) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId ? { ...project, skills: newSkills } : project,
      ),
    );
  };

  const handleGenerateAll = async () => {
    setIsLoading(true);
    try {
      const projectsWithoutSkills = projects.filter(
        (project) => !project.skills || project.skills.length === 0,
      );

      if (projectsWithoutSkills.length === 0) {
        toast({
          title: "All projects already have skills assigned",
        });
        return;
      }

      for (const project of projectsWithoutSkills) {
        const newSkills = await skillsModalRef.current?.generateSkills({
          projectId: project.id,
          projectSkillId: project.projectSkillId,
          projectName: project.name,
          projectDescription: project.description,
        });

        if (newSkills) {
          handleSaveSkills(project.id, newSkills);
        }
      }

      toast({
        title: "Finished generating skills for all projects",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProjects(projects.map((project) => project.id));
    } else {
      setSelectedProjects([]);
    }
  };

  const allSelected =
    projects.length > 0 && selectedProjects.length === projects.length;

  const editingProject = projects.find((p) => p.id === editingProjectId) || {};

  return (
    <div>
      <h2 className="text-2xl inline-block font-semibold mb-4 mr-4">
        Select Projects
      </h2>
      <Button onClick={() => setShowAssignModal(true)} variant="outline">
        View Project Assignments
      </Button>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  id="select-all-projects"
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Project Name</TableHead>
              <TableHead>Project Skills</TableHead>
              <TableHead>
                Already Assigned{role ? " " + tDB(role) : ""}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <Checkbox
                    id={`project-${project.id}`}
                    checked={selectedProjects.includes(project.id)}
                    onCheckedChange={() => handleProjectToggle(project.id)}
                  />
                </TableCell>
                <TableCell>
                  <label
                    htmlFor={`project-${project.id}`}
                    className="cursor-pointer"
                  >
                    {project.name}
                  </label>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-2">
                    {project.skills.map((skill) => (
                      <Badge key={skill.id} variant="secondary">
                        {skill.title}
                      </Badge>
                    ))}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingProjectId(project.id)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit Skills</span>
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  {project.assignedMembers.join(", ")}
                  {project.rejectedMembers.length > 0 && (
                    <>
                      {project.assignedMembers.length > 0 && ", "}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-muted-foreground cursor-help">
                              {project.rejectedMembers.join(", ")}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Invite Rejected</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {projects.length > 0 && (
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={handleGenerateAll}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Auto Generate Empty-Skills"
            )}
          </Button>
        )}
      </div>
      {showAssignModal && (
        <ProjectAssignModal
          assignmentHistory={assignmentHistory}
          onClose={() => setShowAssignModal(false)}
        />
      )}
      <ProjectSkillsDialog
        ref={skillsModalRef}
        isOpen={!!editingProjectId}
        onClose={() => setEditingProjectId(null)}
        projectId={editingProject.id || ""}
        projectSkillId={editingProject.projectSkillId}
        projectName={editingProject.name || ""}
        projectDesc={editingProject.description || ""}
        currentSkills={editingProject.skills || []}
        onSave={handleSaveSkills}
        allSkills={allSkills}
        orgId={orgId}
      />
    </div>
  );
}
