"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import {
  exportMemberAssignments,
  allocate,
} from "../utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog";
import { Button } from "@/components/button";
import { Slider } from "@/components/slider";
import { Switch } from "@/components/switch";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { CircleAlert, FileDown, Save } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";
import MemberAssignments from "./member-assignment";
import ProjectAssignments from "./project-assignment";
import NameAssignmentDialog from "./name-assignment-dialog";

const tooltips = {
  maxMembers:
    "Define the maximum number of members each staff member can supervise.",
  maxStaffPerMember:
    "Defines how many staff members can be assigned to a single member.",
  fairShare:
    "Determines whether members should be fairly distributed among the staff.",
  randomize:
    "Randomizes the default order of staff and members before calculating the score matrix. Helpful when there are many members with no specified interests.",
  equalDistribution:
    "Enables fair share and sets the maximum members per staff to ensure equal distribution.",
};

export default function AssignmentModal({
  isOpen,
  onClose,
  projectsData,
  memberData,
  onUpdateProjectsAndMembers,
  loadedAssignmentData,
}) {
  const [params, setParams] = useState({
    maxMembers: 1,
    maxProjectsPerMember: 1,
    fairShare: true,
    randomize: false,
    equalDistribution: true,
  });
  const memberMap = useMemo(() => {
    const max = Math.ceil(memberData.length / projectsData.length);
    setParams((prev) => ({
      ...prev,
      maxMembers: max,
    }));
    const map = new Map();
    memberData.forEach((member) => map.set(member.id, member));
    return map;
  }, [memberData]);

  const [assignmentResults, setAssignmentResults] = useState([]);

  const [assignedMembersToProjectsData, setAssignedMembersToProjectsData] =
    useState([]);

  const unassignedMembers = useMemo(() => {
    return assignedMembersToProjectsData.filter(
      (member) => member.assignedProjects.length < params.maxProjectsPerMember,
    );
  }, [assignedMembersToProjectsData]);

  const unassignedProjects = useMemo(() => {
    return assignmentResults.filter(
      (project) => project.assignedMembers.length < params.maxMembers,
    );
  }, [assignmentResults]);

  const [activeTab, setActiveTab] = useState("projects");
  const [isLoading, setIsLoading] = useState(false);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [defaultAssignmentName, setDefaultAssignmentName] = useState("");

  const assign = async (config) => {
    if (projectsData.length === 0 || memberData.length === 0) {
      toast({
        title: "Please import both projects and member data before uploading",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = allocate(projectsData, memberData, config);
      setAssignmentResults(result.projects);
      setAssignedMembersToProjectsData(result.members);
    } catch (error) {
      toast({
        title: error.message,
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    await assign(params);
  };

  const handleSwapMember = useCallback(
    (projectId1, memberId1, projectId2, memberId2) => {
      const projectIndex1 = assignmentResults.findIndex(
        (project) => project.id === projectId1,
      );
      const projectIndex2 = assignmentResults.findIndex(
        (project) => project.id === projectId2,
      );

      if (projectIndex1 === -1 || projectIndex2 === -1) {
        console.error("Project not found");
        return;
      }

      const project1 = assignmentResults[projectIndex1];
      const project2 = assignmentResults[projectIndex2];
      const member1 = memberMap.get(memberId1);
      const member2 = memberMap.get(memberId2);

      if (!member1 || !member2) {
        console.error("Member not found");
        return;
      }

      setAssignmentResults((prevProjects) => {
        const newProjects = [...prevProjects];

        newProjects[projectIndex1] = {
          ...project1,
          assignedMembers: [
            ...project1.assignedMembers.filter((s) => s.id !== memberId1),
            member2,
          ],
        };
        newProjects[projectIndex2] = {
          ...project2,
          assignedMembers: [
            ...project2.assignedMembers.filter((s) => s.id !== memberId2),
            member1,
          ],
        };

        return newProjects;
      });

      setAssignedMembersToProjectsData((prevMembers) => {
        return prevMembers.map((member) => {
          if (member.id === memberId1) {
            return {
              ...member,
              assignedProjects: member.assignedProjects.map((p) =>
                p.id === projectId1
                  ? {
                      id: projectId2,
                      name: project2.name,
                      skills: project2.skills,
                    }
                  : p,
              ),
            };
          } else if (member.id === memberId2) {
            return {
              ...member,
              assignedProjects: member.assignedProjects.map((p) =>
                p.id === projectId2
                  ? {
                      id: projectId1,
                      name: project1.name,
                      skills: project1.skills,
                    }
                  : p,
              ),
            };
          }
          return member;
        });
      });
    },
    [assignmentResults, memberMap],
  );

  const handleAddMember = useCallback(
    (projectId, memberId) => {
      const memberToAdd = memberData.find((s) => s.id === memberId);
      if (!memberToAdd) return;

      setAssignmentResults((prev) =>
        prev.map((project) => {
          if (project.id !== projectId) return project;

          // Check if current assigned members exceed maxMembers
          if (project.assignedMembers.length >= params.maxMembers) {
            setTimeout(() => {
              toast({
                title: `You're adding more than the defined Max members per project (${params.maxMembers})`,
                variant: "warning",
              });
            }, 0);
          }
          return {
            ...project,
            assignedMembers: [...project.assignedMembers, memberToAdd],
          };
        }),
      );
      setAssignedMembersToProjectsData((prevData) => {
        const updatedData = prevData.map((member) => {
          if (member.id === memberId) {
            const projectMember = assignmentResults.find(
              (project) => project.id === projectId,
            );
            if (projectMember) {
              return {
                ...member,
                assignedProjects: [...member.assignedProjects, projectMember],
              };
            }
          }
          return member;
        });
        return updatedData;
      });
    },
    [memberData, assignmentResults],
  );

  const handleRemoveMember = useCallback((projectId, memberId) => {
    setAssignmentResults((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? {
              ...project,
              assignedMembers: project.assignedMembers.filter(
                (s) => s.id !== memberId,
              ),
            }
          : project,
      ),
    );
    setAssignedMembersToProjectsData((prevData) => {
      const updatedData = prevData.map((member) => {
        if (member.id === memberId) {
          return {
            ...member,
            assignedProjects: member.assignedProjects.filter(
              (project) => project.id !== projectId,
            ),
          };
        }
        return member;
      });
      return updatedData;
    });
  }, []);

  const handleAddProject = useCallback(
    (memberId, projectId) => {
      const projectToAdd = projectsData.find((p) => p.id === projectId);
      if (!projectToAdd) return;

      setAssignmentResults((prev) =>
        prev.map((project) => {
          if (project.id !== projectId) return project;
          return {
            ...project,
            assignedMembers: [
              ...project.assignedMembers,
              memberMap.get(memberId),
            ],
          };
        }),
      );

      setAssignedMembersToProjectsData((prev) =>
        prev.map((member) => {
          if (member.id !== memberId) return member;
          return {
            ...member,
            assignedProjects: [
              ...member.assignedProjects,
              {
                id: projectToAdd.id,
                name: projectToAdd.name,
                skills: projectToAdd.skills,
                description: projectToAdd.description,
              },
            ],
          };
        }),
      );
    },
    [projectsData, memberMap],
  );

  const handleRemoveProject = useCallback((memberId, projectId) => {
    setAssignmentResults((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        return {
          ...project,
          assignedMembers: project.assignedMembers.filter(
            (s) => s.id !== memberId,
          ),
        };
      }),
    );

    setAssignedMembersToProjectsData((prev) =>
      prev.map((member) => {
        if (member.id !== memberId) return member;
        return {
          ...member,
          assignedProjects: member.assignedProjects.filter(
            (p) => p.id !== projectId,
          ),
        };
      }),
    );
  }, []);

  const handleSwapProject = useCallback((memberId1, projectId1, projectId2, memberId2) => {
    const project2 = projectsData.find((s) => s.id === projectId2);
    if (!project2) return;

    setAssignmentResults((prev) => {
      const newAssignments = [...prev];
      const project1Index = newAssignments.findIndex(s => s.id === projectId1);
      const project2Index = newAssignments.findIndex(s => s.id === projectId2);
      
      if (project1Index !== -1) {
        // Remove student1 from staff1
        newAssignments[project1Index] = {
          ...newAssignments[project1Index],
          assignedMembers: newAssignments[project1Index].assignedMembers.filter(
            (s) => s.id !== memberId1
          )
        };
      }

      if (project2Index !== -1) {
        // Add student1 to staff2
        newAssignments[project2Index] = {
          ...newAssignments[project2Index],
          assignedMembers: [
            ...newAssignments[project2Index].assignedMembers.filter(s => !memberId2 || s.id !== memberId2),
            memberMap.get(memberId1)
          ]
        };
        
        // If studentId2 is provided, add it to staff1
        if (memberId2 && project1Index !== -1) {
          const member2 = memberMap.get(memberId2);
          if (member2) {
            newAssignments[project1Index] = {
              ...newAssignments[project1Index],
              assignedMembers: [
                ...newAssignments[project1Index].assignedMembers,
                member2
              ]
            };
          }
        }
      }
      
      return newAssignments;
    });


    setAssignedMembersToProjectsData((prev) => {
      return prev.map((member) => {
        // Handle student1
        if (member.id === memberId1) {
          return {
            ...member,
            assignedProjects: member.assignedProjects.map((s) =>
              s.id === projectId1 ? {
                id: project2.id,
                name: project2.name,
                skills: project2.skills,
                description: project2.description,
              } : s
            ),
          };
        }
        
        // Handle student2 if provided
        if (memberId2 && member.id === memberId2) {
          const project1 = projectsData.find(s => s.id === projectId1);
          if (project1) {
            return {
              ...member,
              assignedProjects: [
                ...member.assignedProjects.filter(s => s.id !== projectId2),
                {
                  id: project1.id,
                  name: project1.name,
                  skills: project1.skills,
                  description: project1.description,
                }
              ]
            };
          }
        }
        
        return member;
      });
    });
  }, [projectsData, memberMap]);

  const handleExport = () => {
    exportMemberAssignments(assignedMembersToProjectsData);
  };

  const handleSaveClick = () => {
    if (assignmentResults.length === 0) {
      toast({
        title: "No assignments to save",
        variant: "destructive",
      });
      return;
    }

    // Create default name with current date/time
    const defaultName = `Assignment ${new Date().toLocaleString()}`;
    setDefaultAssignmentName(defaultName);
    setIsNameDialogOpen(true);
  };

  const handleSaveAssignments = (assignmentName) => {
    const assignmentData = {
      timestamp: new Date().toISOString(),
      name: assignmentName,
      criteria: {
        maxMembers: params.maxMembers,
        maxProjectsPerMember: params.maxProjectsPerMember,
        fairShare: params.fairShare,
        randomize: params.randomize,
        equalDistribution: params.equalDistribution,
      },
      projects: projectsData,
      members: memberData,
      projectAssignments: assignmentResults.map(project => ({
        projectId: project.id,
        memberIds: project.assignedMembers.map(member => member.id)
      }))
    };

    const savedAssignments = JSON.parse(localStorage.getItem('savedProjectAssignments') || '[]');
    savedAssignments.push(assignmentData);
    
    localStorage.setItem('savedProjectAssignments', JSON.stringify(savedAssignments));
    
    toast({
      title: "Assignments saved successfully",
    });
  };

  useEffect(() => {
    if (isOpen && loadedAssignmentData) {
      try {
        // Load criteria from saved assignment
        if (loadedAssignmentData.criteria) {
          setParams({
            maxMembers: loadedAssignmentData.criteria.maxMembers || params.maxMembers,
            maxProjectsPerMember: loadedAssignmentData.criteria.maxProjectsPerMember || params.maxProjectsPerMember,
            fairShare: loadedAssignmentData.criteria.fairShare !== undefined ? loadedAssignmentData.criteria.fairShare : params.fairShare,
            randomize: loadedAssignmentData.criteria.randomize !== undefined ? loadedAssignmentData.criteria.randomize : params.randomize,
            equalDistribution: loadedAssignmentData.criteria.equalDistribution !== undefined ? loadedAssignmentData.criteria.equalDistribution : params.equalDistribution,
          });
        }
        
        // Process project assignments from the saved data
        if (loadedAssignmentData.projectAssignments && loadedAssignmentData.projectAssignments.length > 0) {
          const hasSavedProjects = loadedAssignmentData.projects && loadedAssignmentData.projects.length > 0;
          const hasSavedMembers = loadedAssignmentData.members && loadedAssignmentData.members.length > 0;
          
          const projectsToUse = hasSavedProjects ? loadedAssignmentData.projects : projectsData;
          const membersToUse = hasSavedMembers ? loadedAssignmentData.members : memberData;
          
          const memberMapToUse = new Map();
          membersToUse.forEach(member => memberMapToUse.set(member.id, member));
          
          const loadedResults = loadedAssignmentData.projectAssignments.map(item => {
            const project = projectsToUse.find(p => p.id === item.projectId);
            if (!project) return null;
            
            const assignedMembers = item.memberIds
              .map(memberId => memberMapToUse.get(memberId))
              .filter(Boolean);
              
            return {
              ...project,
              assignedMembers
            };
          }).filter(Boolean);

          const mappedMembers = membersToUse.map(member => {
            const assignedProjects = [];
            
            loadedAssignmentData.projectAssignments.forEach(item => {
              if (item.memberIds.includes(member.id)) {
                const project = projectsToUse.find(p => p.id === item.projectId);
                if (project) {
                  assignedProjects.push({
                    id: project.id,
                    name: project.name,
                    skills: project.skills,
                    description: project.description,
                  });
                }
              }
            });
            
            return {
              ...member,
              assignedProjects
            };
          });

          setAssignmentResults(loadedResults);
          setAssignedMembersToProjectsData(mappedMembers);
        }
      } catch (error) {
        toast({
          title: "Failed to load assignment data",
          variant: "destructive",
        });
        console.error(error);
      }
    }
  }, [isOpen, loadedAssignmentData, projectsData, memberData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Set Criteria & Assign Projects</DialogTitle>
        </DialogHeader>

        <TooltipProvider delayDuration={300}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="shrink-0" htmlFor="maxMembers">
                  Max Members
                </Label>
                <Input
                  id="maxMembers"
                  type="number"
                  min={1}
                  value={params.maxMembers}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      maxMembers: Number.parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                  disabled={params.equalDistribution}
                />
                <Tooltip>
                  <TooltipTrigger>
                    <CircleAlert className="h-6 w-6 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="w-80">{tooltips.maxMembers}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <Label className="shrink-0" htmlFor="maxProjectsPerMember">
                  Max Projects Per Member
                </Label>
                <Input
                  id="maxProjectsPerMember"
                  type="number"
                  min={1}
                  value={params.maxProjectsPerMember}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      maxProjectsPerMember: Number.parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <Tooltip>
                  <TooltipTrigger>
                    <CircleAlert className="h-6 w-6 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="w-80">{tooltips.maxStaffPerMember}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="w-48" htmlFor="equalDistribution">
                  Equal Distribution
                </Label>
                <Switch
                  id="equalDistribution"
                  checked={params.equalDistribution}
                  onCheckedChange={(checked) => {
                    const max = Math.ceil(
                      memberData.length / projectsData.length,
                    );
                    setParams({
                      ...params,
                      equalDistribution: checked,
                      fairShare: checked ? true : params.fairShare,
                      maxMembers: checked ? max : params.maxMembers,
                    });
                  }}
                />
                <Tooltip>
                  <TooltipTrigger>
                    <CircleAlert className="h-6 w-6 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="w-80">{tooltips.equalDistribution}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <Label className="w-48" htmlFor="randomize">
                  Randomize
                </Label>
                <Switch
                  id="randomize"
                  checked={params.randomize}
                  onCheckedChange={(checked) =>
                    setParams({ ...params, randomize: checked })
                  }
                />
                <Tooltip>
                  <TooltipTrigger>
                    <CircleAlert className="h-6 w-6 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="w-80">{tooltips.randomize}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <Label className="w-48" htmlFor="fairShare">
                  Fair Share
                </Label>
                <Switch
                  id="fairShare"
                  checked={params.fairShare}
                  onCheckedChange={(checked) =>
                    setParams({ ...params, fairShare: checked })
                  }
                  disabled={params.equalDistribution}
                />
                <Tooltip>
                  <TooltipTrigger>
                    <CircleAlert className="h-6 w-6 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="w-80">{tooltips.fairShare}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </TooltipProvider>

        <Button onClick={handleAssign} disabled={isLoading}>
          Assign Projects to Members
        </Button>

        <div className="space-y-4">
          <div className="py-4 sticky -top-[24px] z-10 flex gap-2 items-center bg-background border-b border-accent-foreground">
            <h3 className="text-lg font-semibold">Assignment Results</h3>
            <Button variant="outline" onClick={handleExport}>
              <FileDown className="h-5 w-5" />
              Download Assignments
            </Button>
            <Button variant="outline" onClick={handleSaveClick} disabled={assignmentResults.length === 0}>
              <Save className="h-5 w-5 mr-2" />
              Save Assignments
            </Button>
            <div className="flex ml-auto border bg-muted rounded-lg">
              <Button
                variant={activeTab === "projects" ? "default" : "ghost"}
                className="flex-1 rounded-r-none"
                onClick={() => setActiveTab("projects")}
              >
                Projects {"(" + projectsData.length + ")"}
              </Button>
              <Button
                variant={activeTab === "member" ? "default" : "ghost"}
                className="flex-1 rounded-l-none"
                onClick={() => setActiveTab("member")}
              >
                Members {"(" + memberData.length + ")"}
              </Button>
            </div>
          </div>

          <div className="overflow-y-hidden overflow-x-auto">
            <div
              className={`w-full transition-opacity duration-300 ${
                activeTab === "member"
                  ? "visible opacity-100 h-full"
                  : "invisible opacity-0 h-0"
              }`}
            >
              <MemberAssignments
                assignedMembersToProjectsData={assignedMembersToProjectsData}
                projectsData={projectsData}
                unassignedMembers={unassignedMembers}
                unassignedProjects={unassignedProjects}
                maxProjectsPerMember={params.maxProjectsPerMember}
                onAddProject={handleAddProject}
                onRemoveProject={handleRemoveProject}
                onSwapProject={handleSwapProject}
                assignmentResults={assignmentResults}
              />
            </div>
            <div
              className={`w-full transition-opacity duration-300 ${
                activeTab === "projects"
                  ? "visible opacity-100 h-full"
                  : "invisible opacity-0 h-0"
              }`}
            >
              <ProjectAssignments
                assignmentResults={assignmentResults}
                memberData={memberData}
                memberMap={memberMap}
                unassignedMembers={unassignedMembers}
                unassignedProjects={unassignedProjects}
                maxMembers={params.maxMembers}
                onAddMember={handleAddMember}
                onRemoveMember={handleRemoveMember}
                onSwapMember={handleSwapMember}
              />
            </div>
          </div>
        </div>
        
        <NameAssignmentDialog 
          isOpen={isNameDialogOpen}
          onClose={() => setIsNameDialogOpen(false)}
          onSave={handleSaveAssignments}
          defaultName={defaultAssignmentName}
        />
      </DialogContent>
    </Dialog>
  );
}
