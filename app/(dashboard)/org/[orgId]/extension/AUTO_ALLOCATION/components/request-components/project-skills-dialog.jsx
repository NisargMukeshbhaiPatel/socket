"use client";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { X, Loader2 } from "lucide-react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog";
import { ScrollArea } from "@/components/scroll-area";
import {
  API_ORG_EXTENSION_AUTOALLOC_PROJECT_SKILLS_UPDATE,
  API_ORG_EXTENSION_AUTOALLOC_PROJECT_SKILLS_GENERATE,
} from "@/constants/api-routes";

const ProjectSkillsDialog = forwardRef(
  (
    {
      orgId,
      isOpen,
      onClose,
      projectId,
      projectSkillId,
      projectName,
      projectDesc,
      currentSkills,
      onSave,
      allSkills,
    },
    ref,
  ) => {
    const [skills, setSkills] = useState(currentSkills);
    const [loading, setLoading] = useState(false);
    const [generatingSkills, setGeneratingSkills] = useState(false);

    useEffect(() => {
      setSkills(currentSkills);
    }, [currentSkills, isOpen]);

    const handleToggleSkill = (skill) => {
      setSkills((prev) =>
        prev.some((s) => skill.id === s.id)
          ? prev.filter((s) => s.id !== skill.id)
          : [...prev, skill],
      );
    };

    const generateSkills = async (projectDetails = null) => {
      setGeneratingSkills(true);
      try {
        // Use either passed project details or current modal's details
        const details = projectDetails || {
          projectId,
          projectSkillId,
          projectName,
          projectDescription: projectDesc,
        };

        const response = await fetch(
          API_ORG_EXTENSION_AUTOALLOC_PROJECT_SKILLS_GENERATE,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orgId,
              projectSkillId: details.projectSkillId,
              projectId: details.projectId,
              projectName: details.projectName,
              projectDescription: details.projectDescription,
            }),
          },
        );

        const res = await response.json();
        if (!response.ok) {
          throw new Error(res.error || "Failed to generate skills");
        }

        if (!res.skills.length) {
          toast({
            title: `No skills could be generated for ${details.projectName}`,
          });
          return null;
        }

        const newSkills = res.skills
          .map((genSkillId) =>
            allSkills.find((skill) => skill.id === genSkillId),
          )
          .filter(Boolean);

        // If called directly (not through ref), update modal state
        if (!projectDetails) {
          setSkills(newSkills);
        }

        return newSkills;
      } catch (error) {
        console.error("Error generating skills:", error);
        toast({
          title: error.message,
          variant: "destructive",
        });
        return null;
      } finally {
        setGeneratingSkills(false);
      }
    };

    // Expose generateSkills method through ref
    useImperativeHandle(ref, () => ({
      generateSkills,
    }));

    const handleSave = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          API_ORG_EXTENSION_AUTOALLOC_PROJECT_SKILLS_UPDATE,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orgId,
              projectId,
              projectSkillId,
              skillIds: skills.map((skill) => skill.id),
            }),
          },
        );

        if (!response.ok) {
          const res = await response.json();
          throw new Error(res.error || "Failed to save skills");
        }
        onSave(projectId, skills);
        onClose();
      } catch (error) {
        console.error("Error saving skills:", error);
        toast({
          title: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Skills for {projectName}</DialogTitle>
            <DialogDescription>{projectDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="font-medium">Current Skills</div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill.id}
                  variant="secondary"
                  className="flex items-center pb-1 gap-1 cursor-pointer"
                  onClick={() => handleToggleSkill(skill)}
                >
                  {skill.title}
                  <X className="h-4 w-4" />
                </Badge>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => generateSkills()}
              disabled={generatingSkills}
            >
              {generatingSkills ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Auto Generate Skills"
              )}
            </Button>
            {skills.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No skills added yet.
              </p>
            )}
          </div>
          <div className="font-medium mt-2">All Skills</div>
          <ScrollArea className="max-h-[200px]">
            <div className="flex flex-wrap gap-2 pb-4">
              {allSkills.map((skill) => (
                <Badge
                  key={skill.id}
                  variant={
                    skills.some((s) => skill.id === s.id)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => handleToggleSkill(skill)}
                >
                  {skill.title}
                </Badge>
              ))}
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);

ProjectSkillsDialog.displayName = "ProjectSkillsDialog";
export default ProjectSkillsDialog;
