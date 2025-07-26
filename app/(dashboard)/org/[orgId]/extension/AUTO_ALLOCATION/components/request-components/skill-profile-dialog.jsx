import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  API_ORG_EXTENSION_AUTOALLOC_SKILLS_REQ_RESPOND,
  API_ORG_EXTENSION_AUTOALLOC_GENERATE_USER_SKILLS,
} from "@/constants/api-routes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog";
import { Button } from "@/components/button";
import { Label } from "@/components/label";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Badge } from "@/components/badge";

const SkillProfileDialog = ({
  isOpen,
  onOpenChange,
  initialData,
  allSkills,
  orgId,
  requestId,
  userName,
}) => {

  console.log("skills:", initialData.skills);
  const router = useRouter();
  const { toast } = useToast();
  const [skills, setSkills] = useState(initialData.skills);
  const [maxProjects, setMaxProjects] = useState(initialData.maxProjects);
  const [description, setDescription] = useState(initialData.description);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddSkill = (skill) => {
    console.log("Adding skill:", skill);
    setSkills((prevSkills) => [...prevSkills, skill]);
  };

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter((s) => s.id !== skill.id));
  };

  const filteredSkills = allSkills.filter(
    (skill) => !skills.some((memSkill) => memSkill.id === skill.id),
  );

  const handleGenerateUserSkills = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(
        API_ORG_EXTENSION_AUTOALLOC_GENERATE_USER_SKILLS,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orgId,
            skillId: requestId,
            userName,
            userData: description,
          }),
        },
      );
      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.error || "Failed to generate skills");
      }

      const newSkills = res.skills.map((skill) => ({
        title: skill.title,
        id: skill.id,
      }));
      setSkills(newSkills);
    } catch (error) {
      toast({
        title: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(
        API_ORG_EXTENSION_AUTOALLOC_SKILLS_REQ_RESPOND,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orgId,
            requestId,
            data: description,
            skillIds: skills.map((skill) => skill.id),
            maxProjects,
          }),
        },
      );
      if (!response.ok) {
        const res = await response.json();
        throw new Error(res?.error);
      }
      router.refresh();
      onOpenChange(false);
    } catch (err) {
      console.error("ERR in sending ext data:", err.message);
      toast({
        title: err.message,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Skill Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Bio</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter professional experience and expertise details..."
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="skills">Current Skills</Label>
            <div className="flex flex-wrap mt-2">
              {skills.map((skill) => (
                <Badge key={skill.id} variant="secondary" className="m-1">
                  {skill.title}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 text-xs"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateUserSkills}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Skills...
              </>
            ) : (
              "Auto Generate Skills"
            )}
          </Button>
          <div>
            <Label>Available Skills</Label>
            <div className="flex flex-wrap mt-2">
              {filteredSkills.map((skill) => (
                <Badge
                  key={skill.id}
                  variant="outline"
                  className="m-1 cursor-pointer"
                  onClick={() => handleAddSkill(skill)}
                >
                  {skill.title}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="maxProjects">Maximum Concurrent Projects</Label>
            <Input
              id="maxProjects"
              type="number"
              value={maxProjects}
              onChange={(e) => setMaxProjects(Number(e.target.value))}
              min={0}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SkillProfileDialog;
