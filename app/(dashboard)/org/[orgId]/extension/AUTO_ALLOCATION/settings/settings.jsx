"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useData } from "@/(dashboard)/context";
import { useDBTranslation } from "@/hooks/use-db-translation";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/label";
import { Input } from "@/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { Switch } from "@/components/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/card";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { ArrowLeft, X, Plus } from "lucide-react";
import { API_ORG_EXTENSION_AUTOALLOC_UPDATE_SETTINGS } from "@/constants/api-routes";

export default function Settings({ orgId, settings, allSkills }) {
  const router = useRouter();
  const tDB = useDBTranslation();

  const { getRolesByOrgId } = useData();
  const allRoles = getRolesByOrgId(orgId);

  const role = settings.assignedRoleId
    ? allRoles.find((r) => r.id === settings.assignedRoleId)?.id
    : null;

  const [selectedRole, setSelectedRole] = useState(role);
  useEffect(() => {
    if (!settings.assignedRoleId) {
      toast({
        title: "Please select an assignment role to use this Extension.",
        variant: "destructive",
      });
    }
  }, []);

  const [skills, setSkills] = useState(allSkills.map((s) => s.title));
  const [projectRoleName, setProjectRoleName] = useState(
    tDB(settings.prjRoleName),
  );
  const [reason, setReason] = useState(tDB(settings.reason));
  const [minMembers, setMinMembers] = useState(settings.minMembersPerProject);
  const [matchNoCommonSkills, setMatchNoCommonSkills] = useState(
    settings.matchMembersWithNoCommonSkills,
  );
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const updateSettings = async () => {
    try {
      if (!selectedRole || !projectRoleName || !skills.length) {
        throw new Error("Missing Required Fields");
      }

      const allSkillTitles = allSkills.map((skill) => skill.title);
      const skillsToAdd = skills.filter(
        (skill) => !allSkillTitles.includes(skill),
      );
      const skillsToDelete = allSkills.filter(
        (skill) => !skills.includes(skill.title),
      );

      const response = await fetch(
        API_ORG_EXTENSION_AUTOALLOC_UPDATE_SETTINGS,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orgId,
            role: selectedRole,
            projectRoleName,
            reason,
            minMembers,
            matchNoCommonSkills,
            skillsToAdd,
            skillsToDelete,
          }),
        },
      );

      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.error || "Failed to update settings");
      }

      toast({
        title: "Settings updated successfully!",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: error.message || "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={router.back}>
          <ArrowLeft className="h-8 w-8 " />
        </button>

        <h2 className="text-2xl font-bold">Extension Settings</h2>
      </div>

      <Card>
        <CardHeader className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="role-select">Role to Assign:</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="role-select" className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {allRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {tDB(role.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectRoleName">Project Role Name</Label>
            <Input
              id="projectRoleName"
              value={projectRoleName}
              onChange={(e) => setProjectRoleName(e.target.value)}
              placeholder="Enter project role name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Extension</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for extension"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minMembers">Minimum Members per Project</Label>
            <Input
              id="minMembers"
              type="number"
              value={minMembers}
              onChange={(e) => setMinMembers(Number(e.target.value))}
              min={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Skills to Check for Matching</Label>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <Badge key={i} variant="outline" className="text-md pb-[3px]">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="ml-1">
                    <X size={16} />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a new skill"
              />
              <Button
                onClick={addSkill}
                variant="outline"
                className="px-2"
                size="icon"
              >
                <Plus size={24} />
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="matchNoCommonSkills"
              checked={matchNoCommonSkills}
              onCheckedChange={setMatchNoCommonSkills}
            />
            <Label htmlFor="matchNoCommonSkills">
              Match Members with No Common Skills
            </Label>
          </div>
        </CardHeader>
        <CardFooter>
          <Button onClick={updateSettings} className="w-full">
            Apply Settings
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
