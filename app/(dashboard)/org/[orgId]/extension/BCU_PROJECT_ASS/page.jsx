"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

import { handleFileParsing } from "@/lib/utils";
import { transformMemberData, transformProjectsData } from "./utils";
import { ORG_DASHBOARD } from "@/constants/page-routes";

import Link from "next/link";
import { Input } from "@/components/input";
import { TableCell, TableRow } from "@/components/table";
import { ArrowLeft, CircleAlert, Search, X, Loader2, History } from "lucide-react";
import { Button } from "@/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";
import ImportCard from "./components/import-card";
import DataTable from "./components/data-table";
import InterestBadge from "./components/interest-badge";
import AssignmentModal from "./components/assignment-modal";
import SavedAssignmentsModal from "./components/saved-assignments-modal";

export default function BcuProjectAssPage() {
  const { orgId } = useParams();
  const [projectsData, setProjectsData] = useState([]);
  const [skills, setSkills] = useState([]);
  const [memberData, setMemberData] = useState([]);

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isSavedAssignmentsModalOpen, setIsSavedAssignmentsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importType, setImportType] = useState(null);
  const [generatingSkills, setGeneratingSkills] = useState(null);
  const [generatingAllSkills, setGeneratingAllSkills] = useState(false);
  const [loadedAssignmentData, setLoadedAssignmentData] = useState(null);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  const filteredSkills = skills.filter((skill) =>
    skill.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const applyDataFilters = (data) => {
    if (selectedSkills.length === 0 && searchQuery === "") {
      return data;
    }

    return data.filter((item) => {
      const hasSelectedSkill =
        selectedSkills.length === 0 ||
        item.skills.some((skill) => selectedSkills.includes(skill));

      const matchesSearch =
        searchQuery === "" ||
        item.skills.some((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      return hasSelectedSkill && matchesSearch;
    });
  };

  const filteredProjectsData = applyDataFilters(projectsData);
  const filteredMemberData = applyDataFilters(memberData);

  const handleImport = async (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    setImportType(type);
    try {
      handleFileParsing(file, async (_, data) => {
        if (type === "projects") {
          const { projects, uniqueSkills } = transformProjectsData(data);
          setSkills((prevSkills) => [
            ...new Set([...prevSkills, ...uniqueSkills]),
          ]);
          setProjectsData(projects);
        } else {
          const { members, uniqueSkills } = transformMemberData(data);
          setSkills((prevSkills) => [
            ...new Set([...prevSkills, ...uniqueSkills]),
          ]);
          setMemberData(members);
        }
        setIsLoading(false);
        setImportType(null);
      });
    } catch (error) {
      toast({
        title: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      setImportType(null);
    }
  };

  const handleProjectsImport = (event) => handleImport(event, "projects");
  const handleMemberImport = (event) => handleImport(event, "member");

  const updateSkills = (oldSkill, newSkills) => {
    const uniqueNewSkills = newSkills.filter(
      (newSkill) => !skills.includes(newSkill),
    );
    setSkills(skills.filter((i) => i !== oldSkill).concat(uniqueNewSkills));

    setProjectsData(
      projectsData.map((project) => {
        if (project.skills.includes(oldSkill)) {
          const currentSkills = project.skills.filter((i) => i !== oldSkill);
          return {
            ...project,
            skills: currentSkills.concat(newSkills),
          };
        }
        return project;
      }),
    );

    setMemberData(
      memberData.map((member) => {
        if (member.interests.includes(oldSkill)) {
          const currentInterests = member.interests.filter(
            (i) => i !== oldSkill,
          );
          return {
            ...member,
            interests: currentInterests.concat(newSkills),
          };
        }
        return member;
      }),
    );
  };

  const handleEditSkill = (oldSkill, newSkill) => {
    updateSkills(oldSkill, [newSkill]);
  };

  const handleSplitSkill = (oldSkill, newSkills) => {
    updateSkills(oldSkill, newSkills);
  };
  const handleToggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((i) => i !== skill) : [...prev, skill],
    );
  };

  const handleGenerateSkills = async (project) => {
    setGeneratingSkills(project.id);
    try {
      const response = await fetch("/api/org/extension/BCU_PROJECT_ASS/generate-skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName: project.name,
          projectDescription: project.description,
          availableSkills: JSON.stringify(skills)
        }),
      });

      if (!response.ok) throw new Error("Failed to generate skills");
      
      const generatedSkills = await response.json();
      setProjectsData(projectsData.map(p => 
        p.id === project.id ? { ...p, skills: generatedSkills } : p
      ));
      setSkills(prevSkills => [...new Set([...prevSkills, ...generatedSkills])]);
      
      toast({
        title: "Skills generated successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to generate skills",
        variant: "destructive",
      });
    }
    setGeneratingSkills(null);
  };

  const handleGenerateAllSkills = async () => {
    setGeneratingAllSkills(true);
    const projectsWithoutSkills = projectsData.filter(p => !p.skills.length);
    
    try {
      for (const project of projectsWithoutSkills) {
        const response = await fetch("/api/org/extension/BCU_PROJECT_ASS/generate-skills", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectName: project.name,
            projectDescription: project.description,
            availableSkills: JSON.stringify(skills)
          }),
        });

        if (!response.ok) throw new Error(`Failed to generate skills for project ${project.id}`);
        
        const generatedSkills = await response.json();
        setProjectsData(prevData => prevData.map(p => 
          p.id === project.id ? { ...p, skills: generatedSkills } : p
        ));
        setSkills(prevSkills => [...new Set([...prevSkills, ...generatedSkills])]);
      }
      
      toast({
        title: "Generated skills for all projects successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to generate all skills",
        variant: "destructive",
      });
    }
    setGeneratingAllSkills(false);
  };

  const handleExportProjects = () => {
    const csvContent = [
      ["Name", "Description", "Skills"],
      ...projectsData.map(project => [
        project.name,
        project.description,
        project.skills.join(", ")
      ])
    ]
    .map(row => row.map(cell => `"${cell}"`).join(","))
    .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "projects_with_skills.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSkills = () => {
    const csvContent = [
      ...skills.map(skill => [`"${skill}"`])
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "skills_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateProjectsAndMembers = (newProjects, newMembers) => {
    setProjectsData(newProjects);
    setMemberData(newMembers);
    
    const projectSkills = newProjects.flatMap(project => project.skills || []);
    const memberSkills = newMembers.flatMap(member => member.skills || []);
    const uniqueSkills = [...new Set([...projectSkills, ...memberSkills])].sort();
    setSkills(uniqueSkills);
    
    toast({
      title: "Projects and members data loaded from saved assignment",
    });
  };

  const handleLoadSavedAssignment = (savedAssignment) => {
    try {
      const hasSavedProjects = savedAssignment.projects && savedAssignment.projects.length > 0;
      const hasSavedMembers = savedAssignment.members && savedAssignment.members.length > 0;
      
      if (hasSavedProjects && hasSavedMembers) {
        handleUpdateProjectsAndMembers(savedAssignment.projects, savedAssignment.members);
      }
      
      // Store the saved assignment for the modal to use
      setLoadedAssignmentData(savedAssignment);
      setIsSavedAssignmentsModalOpen(false);
      
      if (savedAssignment.projectAssignments && savedAssignment.projectAssignments.length > 0) {
        setIsAssignmentModalOpen(true);
      }
      
      toast({
        title: "Saved assignment loaded successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to load saved assignment",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  // Clear loaded assignment data when closing the assignment modal
  const handleCloseAssignmentModal = () => {
    setIsAssignmentModalOpen(false);
    setLoadedAssignmentData(null);
  };

  return (
    <div className="container mx-auto px-6">
      <div className="flex gap-2 mr-auto mb-4">
        <Link href={ORG_DASHBOARD(orgId)}>
          <ArrowLeft className="h-8 w-8 -ml-10 cursor-pointer" />
        </Link>
        <h1 className="text-2xl font-bold">Project based Allocation</h1>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <ImportCard
          title="Import Projects"
          handleFileChange={handleProjectsImport}
          isLoading={isLoading && importType === "projects"}
        />
        <ImportCard
          title="Import Members"
          handleFileChange={handleMemberImport}
          isLoading={isLoading && importType === "member"}
        />
      </div>
      
      <div className="flex gap-4 mb-8">
        <Button
          className="flex-1"
          onClick={() => setIsAssignmentModalOpen(true)}
          disabled={projectsData.length === 0 || memberData.length === 0}
        >
          Set Criteria & Assign Projects
        </Button>
        <Button
          variant="outline"
          onClick={() => setIsSavedAssignmentsModalOpen(true)}
        >
          <History className="h-5 w-5 mr-2" />
          Saved Assignments
        </Button>
      </div>
      
      <AssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={handleCloseAssignmentModal}
        projectsData={projectsData}
        memberData={memberData}
        onUpdateProjectsAndMembers={handleUpdateProjectsAndMembers}
        loadedAssignmentData={loadedAssignmentData}
      />
      
      <SavedAssignmentsModal 
        isOpen={isSavedAssignmentsModalOpen}
        onClose={() => setIsSavedAssignmentsModalOpen(false)}
        onLoadAssignment={handleLoadSavedAssignment}
      />
      
      <div className="mb-8">
        <div className="flex gap-1">
          <h2 className="text-2xl font-semibold mb-2">View/Edit Skills</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <CircleAlert className="h-6 w-6 mb-2" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Editing Skills affects both projects and member data. Import
                  both before Editing.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search skills..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearch}
            />
            {searchQuery && (
              <button
                className="absolute right-2 top-2.5"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[340px] overflow-y-auto">
          {selectedSkills.length > 0 || searchQuery ? (
            <div className="w-full mb-2 flex items-center">
              <span className="text-md mr-2">
                {selectedSkills.length > 0 ? "Filtering Skills:" : "Searching:"}
              </span>
              <button
                className="text-md text-muted-foreground underline"
                onClick={() => {
                  setSelectedSkills([]);
                  setSearchQuery("");
                }}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="w-full mb-2">
              <p className="text-md text-muted-foreground italic">
                Search or click on skills to filter content
              </p>
            </div>
          )}
          <div className="flex flex-wrap">
            {filteredSkills.map((skill) => (
              <InterestBadge
                key={crypto.randomUUID()}
                interest={skill}
                onEdit={handleEditSkill}
                onSplit={handleSplitSkill}
                isSelected={selectedSkills.includes(skill)}
                onToggleSelect={handleToggleSkill}
                disabled={projectsData.length === 0 || memberData.length === 0}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Projects Data</h2>
            {projectsData.some(p => !p.skills.length) && (
              <Button 
                size="sm"
                onClick={handleGenerateAllSkills}
                disabled={generatingAllSkills}
              >
                {generatingAllSkills ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating All Skills
                  </>
                ) : (
                  'Generate All Missing Skills'
                )}
              </Button>
            )}
          </div>
          <DataTable
            columns={["ID", "Name", "Description", "Skills Required"]}
            data={filteredProjectsData}
            renderRow={(item) => (
              <TableRow key={crypto.randomUUID()}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  {item.skills.length > 0 ? (
                    item.skills.join(", ")
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => handleGenerateSkills(item)}
                      disabled={generatingSkills === item.id}
                    >
                      {generatingSkills === item.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating
                        </>
                      ) : (
                        'Generate Skills'
                      )}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button
              size="sm"
              onClick={handleExportSkills}
              disabled={skills.length === 0}
            >
              Export Skills List
            </Button>
            <Button
              size="sm"
              onClick={handleExportProjects}
              disabled={projectsData.length === 0}
            >
              Export Projects with Skills
            </Button>
          </div>
        </div>
        <DataTable
          title="Member Data"
          columns={["ID", "Name", "Email", "Skills"]}
          data={filteredMemberData}
          renderRow={(item) => (
            <TableRow key={crypto.randomUUID()}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.email}</TableCell>
              <TableCell>{item.skills.join(", ")}</TableCell>
            </TableRow>
          )}
        />
      </div>
    </div>
  );
}
