"use client";
import { memo, useState, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/table";
import { Badge } from "@/components/badge";
import { Trash2, ArrowLeftRight, ChevronDown, Filter } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/popover";

const MemoizedMemberCard = memo(function MemoizedMemberCard({
  member,
  projectsData,
  maxProjectPerMember,
  onAddProject,
  onRemoveProject,
  onSwapProject,
  assignmentResults
}) {
  const [addProjectSearch, setAddProjectSearch] = useState("");
  const [swapProjectSearch, setSwapProjectSearch] = useState("");

  const availableProject = useMemo(() => {
    return projectsData.filter(
      (project) => !member.assignedProjects.some((s) => s.id === project.id),
    );
  }, [projectsData, member.assignedProjects]);

  const filteredAddProject = useMemo(() => {
    return availableProject.filter((project) =>
      project.name.toLowerCase().includes(addProjectSearch.toLowerCase()),
    );
  }, [availableProject, addProjectSearch]);

  const projectWithAssignedMembers = useMemo(() => {
    const result = [];
    projectsData.forEach(project => {
      if (member.assignedProjects.some(s => s.id === project.id)) return;
      
      const foundProject = assignmentResults.find(s => s.id === project.id);
      if (foundProject && foundProject.assignedMembers.length > 0) {
        result.push({
          ...project,
          assignedMembers: foundProject.assignedMembers.map(s => ({
            id: s.id,
            name: s.name
          }))
        });
      } else {
        result.push({
          ...project,
          assignedMembers: []
        });
      }
    });
    return result;
  }, [projectsData, member.assignedProjects, assignmentResults]);

  const filteredSwapProject = useMemo(() => {
    return projectWithAssignedMembers.filter((project) =>
      project.name.toLowerCase().includes(swapProjectSearch.toLowerCase())
    );
  }, [projectWithAssignedMembers, swapProjectSearch]);

  return (
    <Card key={member.id} className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex gap-2 items-center flex-wrap">
            <CardTitle>{member.name}</CardTitle>
            <Popover modal={true}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="max-w-sm justify-between"
                  disabled={
                    member.assignedProjects.length >= maxProjectPerMember
                  }
                >
                  Add Project Member
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[330px] p-0">
                <Input
                  placeholder="Search project..."
                  value={addProjectSearch}
                  onChange={(e) => setAddProjectSearch(e.target.value)}
                />
                <div className="max-h-[200px] mt-1 overflow-auto">
                  {filteredAddProject.map((project) => (
                    <Button
                      key={project.id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => onAddProject(member.id, project.id)}
                    >
                      {project.name}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-muted-foreground">
              ID: {member.id}
            </span>
            {member.performance && (
              <span className="text-sm">Performance: {member.performance}</span>
            )}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Email: {member.email || "Not specified"}</p>
          <p>
            {member.skills.length > 0
              ? "Skills: " + member.skills.join(", ")
              : "No skills specified"}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {member.assignedProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.id}</TableCell>
                <TableCell>{project.name}</TableCell>
                <TableCell>
                  {project.skills.length > 0 ? (
                    project.skills.join(", ")
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveProject(member.id, project.id)}
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </Button>
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Swap project with"
                        >
                          <ArrowLeftRight className="h-5 w-5 text-blue-500" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[330px] p-0" side="left">
                        <Input
                          placeholder="Search project..."
                          value={swapProjectSearch}
                          onChange={(e) => setSwapProjectSearch(e.target.value)}
                        />
                        <div className="max-h-[250px] overflow-auto mt-1">
                          {filteredSwapProject.length > 0 ? (
                            filteredSwapProject.map((swapProject) => (
                              <div key={swapProject.id} className="border-b border-border last:border-0">
                                <div className="px-2 py-1 font-semibold">{swapProject.name}</div>
                                {swapProject.assignedMembers.length > 0 ? (
                                  swapProject.assignedMembers.map(assignedMember => (
                                    <Button
                                      key={`${swapProject.id}-${assignedMember.id}`}
                                      variant="ghost"
                                      className="w-full justify-start pl-4 text-sm"
                                      onClick={() =>
                                        onSwapProject(
                                          member.id,
                                          project.id,
                                          swapProject.id,
                                          assignedMember.id
                                        )
                                      }
                                    >
                                      {assignedMember.name}
                                    </Button>
                                  ))
                                ) : (
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start pl-4 text-sm"
                                    onClick={() =>
                                      onSwapProject(
                                        member.id,
                                        project.id,
                                        swapProject.id
                                      )
                                    }
                                  >
                                    No students assigned
                                  </Button>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="p-2 text-center text-muted-foreground">
                              No staff available to swap
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

export default function MemberAssignments({
  assignedMembersToProjectsData: assignedMembersToProjectsData,
  projectsData,
  maxProjectPerMember,
  onAddProject,
  onRemoveProject,
  onSwapProject,
  unassignedMembers,
  unassignedProjects,
  assignmentResults,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [skillsearch, setSkillsearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  // Get unique skills and courses
  const { availableSkills, availableCourses } = useMemo(() => {
    const skills = new Set();
    const courses = new Set();

    assignedMembersToProjectsData.forEach((member) => {
      member.skills.forEach((skill) => skills.add(skill));
      if (member.course) courses.add(member.course);
      member.assignedProjects.forEach((project) => {
        project.skills.forEach((skill) => skills.add(skill));
        if (project.course) courses.add(project.course);
      });
    });

    return {
      availableSkills: Array.from(skills).sort(),
      availableCourses: Array.from(courses).sort(),
    };
  }, [assignedMembersToProjectsData]);

  const unassignedProjectsList = useMemo(() => {
    const assignedProjectIds = new Set(
      assignedMembersToProjectsData.flatMap((member) =>
        member.assignedProjects.map((project) => project.id),
      ),
    );
    return projectsData.filter(
      (project) => !assignedProjectIds.has(project.id),
    );
  }, [assignedMembersToProjectsData, projectsData]);

  const filteredMembers = useMemo(() => {
    let filtered = assignedMembersToProjectsData;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((member) => {
        if (member.name.toLowerCase().includes(query)) return true;
        if (member.id.toString().includes(query)) return true;
        return member.assignedProjects.some(
          (project) =>
            project.name.toLowerCase().includes(query) ||
            project.id.toString().includes(query),
        );
      });
    }

    if (selectedSkills.length > 0) {
      filtered = filtered.filter((member) =>
        selectedSkills.some(
          (skill) =>
            member.skills.includes(skill) ||
            member.assignedProjects.some((project) =>
              project.skills.includes(skill),
            ),
        ),
      );
    }

    if (selectedCourses.length > 0) {
      filtered = filtered.filter(
        (member) =>
          selectedCourses.includes(member.course) ||
          member.assignedProjects.some((project) =>
            selectedCourses.includes(project.course),
          ),
      );
    }

    return filtered;
  }, [
    assignedMembersToProjectsData,
    searchQuery,
    selectedSkills,
    selectedCourses,
  ]);

  const filteredSkills = useMemo(() => {
    return availableSkills.filter((skill) =>
      skill.toLowerCase().includes(skillsearch.toLowerCase()),
    );
  }, [availableSkills, skillsearch]);

  const filteredCourses = useMemo(() => {
    return availableCourses.filter((course) =>
      course.toLowerCase().includes(courseSearch.toLowerCase()),
    );
  }, [availableCourses, courseSearch]);

  return (
    <div className="w-full space-y-4">
      {unassignedMembers.some(
        (member) => !member.unassignedProjects?.length,
      ) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Unassigned Members</h3>
          <div className="text-sm text-muted-foreground">
            {unassignedMembers
              .filter((member) => !member.unassignedProjects?.length)
              .map((member) => (
                <Button
                  key={member.id}
                  variant="link"
                  className="p-0 h-auto font-normal hover:underline"
                  onClick={() => setSearchQuery(member.name)}
                >
                  {member.name}
                </Button>
              ))
              .reduce((prev, curr) => [prev, ", ", curr])}
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
              .map((member) => (
                <Button
                  key={member.id}
                  variant="link"
                  className="p-0 h-auto font-normal hover:underline"
                  onClick={() => setSearchQuery(member.name)}
                >
                  {`${member.name} (${member.unassignedProjects?.length})`}
                </Button>
              ))
              .reduce((prev, curr) => [prev, ", ", curr])}
          </div>
        </div>
      )}

      {unassignedProjects.some(
        (project) => project.assignedMembers?.length === 0,
      ) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Unassigned Project</h3>
          <div className="text-sm text-muted-foreground">
            {unassignedProjects
              .filter((project) => project.assignedMembers?.length === 0)
              .map((project) => project.name)
              .join(", ")}
          </div>
        </div>
      )}

      {unassignedProjects.some(
        (project) => project.assignedMembers?.length > 0,
      ) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Partially Assigned Project</h3>
          <div className="text-sm text-muted-foreground">
            {unassignedProjects
              .filter((project) => project.assignedMembers?.length > 0)
              .map(
                (project) =>
                  `${project.name} (${project.assignedMembers?.length})`,
              )
              .join(", ")}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Search by Name or ID..."
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
            <PopoverContent className="w-[720px]" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Selected Filters</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedSkills.map((skill) => (
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
                        {skill}
                      </Badge>
                    ))}
                    {selectedCourses.map((course) => (
                      <Badge
                        key={course}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive"
                        onClick={() => {
                          setSelectedCourses((prev) =>
                            prev.filter((c) => c !== course),
                          );
                        }}
                      >
                        {course}
                      </Badge>
                    ))}
                    {selectedSkills.length === 0 &&
                      selectedCourses.length === 0 && (
                        <span className="text-sm text-muted-foreground">
                          No filters selected
                        </span>
                      )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Skills</h4>
                  <Input
                    placeholder="Search skills..."
                    value={skillsearch}
                    onChange={(e) => setSkillsearch(e.target.value)}
                    className="mb-2"
                  />
                  <div className="flex flex-wrap gap-1 max-h-[150px] overflow-y-auto">
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

                <div className="space-y-2">
                  <h4 className="font-medium">Courses</h4>
                  <Input
                    placeholder="Search courses..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    className="mb-2"
                  />
                  <div className="flex flex-wrap gap-1 max-h-[150px] overflow-y-auto">
                    {filteredCourses
                      .filter((course) => !selectedCourses.includes(course))
                      .map((course) => (
                        <Badge
                          key={course}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => {
                            setSelectedCourses((prev) => [...prev, course]);
                          }}
                        >
                          {course}
                        </Badge>
                      ))}
                  </div>
                </div>

                {(selectedSkills.length > 0 || selectedCourses.length > 0) && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setSelectedSkills([]);
                      setSelectedCourses([]);
                    }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {(selectedSkills.length > 0 || selectedCourses.length > 0) && (
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
                {skill}
              </Badge>
            ))}
            {selectedCourses.map((course) => (
              <Badge
                key={course}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive"
                onClick={() => {
                  setSelectedCourses((prev) =>
                    prev.filter((c) => c !== course),
                  );
                }}
              >
                {course}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {unassignedProjectsList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Not Yet Assigned Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {unassignedProjectsList.map((project) => (
                <Badge
                  key={project.id}
                  variant="secondary"
                  className="px-3 py-1"
                >
                  {project.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No members found matching your search criteria
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredMembers.map((member) => (
            <MemoizedMemberCard
              key={member.id}
              member={member}
              projectsData={projectsData}
              maxProjectPerMember={maxProjectPerMember}
              onAddProject={onAddProject}
              onRemoveProject={onRemoveProject}
              onSwapProject={onSwapProject}
              assignmentResults={assignmentResults}
            />
          ))}
        </div>
      )}
    </div>
  );
}
