"use client";
import { memo, useState, useMemo, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { Trash2, ArrowLeftRight, ChevronDown, Filter } from "lucide-react";
import { Checkbox } from "@/components/checkbox";
import { Badge } from "@/components/badge";

const MemoizedProjectCard = memo(function MemoizedProjectCard({
  project,
  projectIndex,
  memberData,
  memberMap,
  allProjectsData,
  maxMembers,
  onAddMember,
  onRemoveMember,
  onSwapMember,
}) {
  const availableMembers = useMemo(() => {
    return memberData.filter(
      (member) => !project.assignedMembers.some((s) => s.id === member.id),
    );
  }, [project.assignedMembers, memberData]);

  const [addMemberSearch, setAddMemberSearch] = useState("");
  const [swapMemberSearch, setSwapMemberSearch] = useState("");

  const filteredAddMembers = availableMembers.filter((member) =>
    member.name.toLowerCase().includes(addMemberSearch.toLowerCase()),
  );

  // Restructure assignedMembersToOtherProjects to group by project
  const membersGroupedByProjects = useMemo(() => {
    const projectGroups = new Map();
    
    allProjectsData.forEach((otherProject) => {
      if (otherProject.id === project.id) return;
      
      const assignedMembersNotInCurrentProject = otherProject.assignedMembers.filter(
        (member) => !project.assignedMembers.some((currentMember) => currentMember.id === member.id)
      );
      
      if (assignedMembersNotInCurrentProject.length > 0) {
        projectGroups.set(otherProject.id, {
          projectId: otherProject.id,
          projectName: otherProject.name,
          members: assignedMembersNotInCurrentProject
        });
      }
    });
    
    return Array.from(projectGroups.values());
  }, [allProjectsData, project.id, project.assignedMembers]);

  const filteredSwapProjects = useMemo(() => {
    if (!swapMemberSearch.trim()) return membersGroupedByProjects;
    
    const searchTerm = swapMemberSearch.toLowerCase();
    return membersGroupedByProjects
      .map(projectGroup => {
        // Filter members in this project group
        const filteredMembers = projectGroup.members.filter(member => 
          member.name.toLowerCase().includes(searchTerm)
        );
        
        // Only keep the project group if it has matching members
        if (filteredMembers.length > 0) {
          return {
            ...projectGroup,
            members: filteredMembers
          };
        }
        return null;
      })
      .filter(Boolean); // Remove null entries
  }, [membersGroupedByProjects, swapMemberSearch]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex gap-2 items-center flex-wrap">
          <CardTitle className="shrink-0">{project.name}</CardTitle>
          <Popover modal={true}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="max-w-sm justify-between">
                Add a Member Not Yet Assigned to This Project
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[330px] p-0">
              <Input
                placeholder="Search members..."
                value={addMemberSearch}
                onChange={(e) => setAddMemberSearch(e.target.value)}
              />
              <div className="max-h-[200px] mt-1 overflow-auto">
                {filteredAddMembers.map((member) => (
                  <Button
                    key={member.id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      if (project.assignedMembers.length >= maxMembers) {
                        toast({
                          title: `You're adding more than the defined Max members per project (${maxMembers})`,
                          variant: "warning",
                        });
                      }
                      onAddMember(project.id, member.id);
                    }}
                  >
                    {member.name}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Description: {project.description}</p>
        </div>
        <p>Skills Required: {project.skills.join(", ")}</p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {project.assignedMembers.map((member, index) => (
              <TableRow key={member.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{member.id}</TableCell>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.skills.join(", ")}</TableCell>
                <TableCell>{member.score ? (member.score * 100).toFixed(0) + '%' : 0 }</TableCell>
                <TableCell>
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveMember(project.id, member.id)}
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </Button>
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Swap member with"
                        >
                          <ArrowLeftRight className="h-5 w-5 text-blue-500" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[330px] p-0" side="left">
                        <Input
                          placeholder="Search members..."
                          value={swapMemberSearch}
                          onChange={(e) => setSwapMemberSearch(e.target.value)}
                        />
                        <div className="max-h-[250px] overflow-auto mt-1">
                          {filteredSwapProjects.length > 0 ? (
                            filteredSwapProjects.map((projectGroup) => (
                              <div key={projectGroup.projectId} className="border-b border-border last:border-0">
                                <div className="px-2 py-1 font-semibold">{projectGroup.projectName}</div>
                                {projectGroup.members.map(swapMember => (
                                  <Button
                                    key={`${projectGroup.projectId}-${swapMember.id}`}
                                    variant="ghost"
                                    className="w-full justify-start pl-4 text-sm"
                                    onClick={() =>
                                      onSwapMember(
                                        project.id,
                                        member.id,
                                        projectGroup.projectId,
                                        swapMember.id,
                                      )
                                    }
                                  >
                                    {swapMember.name}
                                  </Button>
                                ))}
                              </div>
                            ))
                          ) : (
                            <div className="p-2 text-center text-muted-foreground">
                              No members available to swap
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
});

export default function ProjectAssignments({
  assignmentResults,
  memberData,
  memberMap,
  maxMembers,
  onAddMember,
  onRemoveMember,
  onSwapMember,
  unassignedProjects,
  unassignedMembers,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [filterSearch, setFilterSearch] = useState("");

  // Get unique skills from projects and their assigned members' skills
  const availableSkills = useMemo(() => {
    const skills = new Set();
    assignmentResults.forEach((project) => {
      project.skills.forEach((skill) => skills.add(skill));
      project.assignedMembers.forEach((member) =>
        member.skills.forEach((skill) => skills.add(skill)),
      );
    });
    return Array.from(skills).sort();
  }, [assignmentResults]);

  const filteredSkills = useMemo(() => {
    return availableSkills.filter((skill) =>
      skill.toLowerCase().includes(filterSearch.toLowerCase()),
    );
  }, [availableSkills, filterSearch]);

  const filteredAssignments = useMemo(() => {
    let filtered = assignmentResults;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((project) => {
        if (project.name.toLowerCase().includes(query)) return true;
        if (project.id.toString().includes(query)) return true;
        if (project.description.toLowerCase().includes(query)) return true;
        return project.assignedMembers.some(
          (member) =>
            member.name.toLowerCase().includes(query) ||
            member.id.toString().includes(query),
        );
      });
    }

    if (selectedSkills.length > 0) {
      filtered = filtered.filter((project) =>
        selectedSkills.some(
          (skill) =>
            project.skills.includes(skill) ||
            project.assignedMembers.some((member) =>
              member.skills.includes(skill),
            ),
        ),
      );
    }

    return filtered;
  }, [assignmentResults, searchQuery, selectedSkills]);

  return (
    <div className="space-y-4">
      {unassignedProjects.some(
        (project) => project.assignedMembers?.length === 0,
      ) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Unassigned Projects</h3>
          <div className="text-sm text-muted-foreground">
            {unassignedProjects
              .filter((project) => project.assignedMembers?.length === 0)
              .map((project) => (
                <Button
                  key={project.id}
                  variant="link"
                  className="p-0 h-auto font-normal hover:underline"
                  onClick={() => setSearchQuery(project.name)}
                >
                  {project.name}
                </Button>
              ))
              .reduce((prev, curr) => [prev, ", ", curr])}
          </div>
        </div>
      )}

      {unassignedProjects.some(
        (project) => project.assignedMembers?.length > 0,
      ) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Partially Assigned Projects</h3>
          <div className="text-sm text-muted-foreground">
            {unassignedProjects
              .filter((project) => project.assignedMembers?.length > 0)
              .map((project) => (
                <Button
                  key={project.id}
                  variant="link"
                  className="p-0 h-auto font-normal hover:underline"
                  onClick={() => setSearchQuery(project.name)}
                >
                  {`${project.name} (${project.assignedMembers?.length})`}
                </Button>
              ))
              .reduce((prev, curr) => [prev, ", ", curr])}
          </div>
        </div>
      )}

      {unassignedMembers.some(
        (member) => !member.unassignedProjects?.length,
      ) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Unassigned Members</h3>
          <div className="text-sm text-muted-foreground">
            {unassignedMembers
              .filter((member) => !member.unassignedProjects?.length)
              .map((member) => member.name)
              .join(", ")}
          </div>
        </div>
      )}

      {unassignedMembers.some(
        (member) => member.unassignedProjects?.length > 0,
      ) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Partially Assigned Members</h3>
          <div className="text-sm text-muted-foreground">
            {unassignedMembers
              .filter((member) => member.unassignedProjects?.length > 0)
              .map(
                (member) =>
                  `${member.name} (${member.unassignedProjects?.length})`,
              )
              .join(", ")}
          </div>
        </div>
      )}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Search by Name, Description or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="shrink-0">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px]" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Selected Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedSkills.length > 0 ? (
                      selectedSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive"
                          onClick={() => {
                            setSelectedSkills((prev) =>
                              prev.filter((i) => i !== skill),
                            );
                          }}
                        >
                          {skill} ×
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No skills selected
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Available Skills</h4>
                  <Input
                    placeholder="Search skills..."
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    className="mb-2"
                  />
                  <div className="flex flex-wrap gap-1 max-h-[200px] overflow-y-auto">
                    {filteredSkills
                      .filter((skill) => !selectedSkills.includes(skill))
                      .map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => {
                            setSelectedSkills((prev) => [...prev, skill]);
                          }}
                        >
                          {skill}
                        </Badge>
                      ))}
                  </div>
                </div>

                {selectedSkills.length > 0 && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setSelectedSkills([])}
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedSkills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive"
                onClick={() => {
                  setSelectedSkills((prev) => prev.filter((i) => i !== skill));
                }}
              >
                {skill} ×
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-6">
        {filteredAssignments.map((project, projectIndex) => (
          <MemoizedProjectCard
            key={project.id}
            project={project}
            projectIndex={projectIndex}
            memberData={memberData}
            memberMap={memberMap}
            allProjectsData={assignmentResults}
            maxMembers={maxMembers}
            onAddMember={onAddMember}
            onRemoveMember={onRemoveMember}
            onSwapMember={onSwapMember}
          />
        ))}
      </div>
    </div>
  );
}
