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

const MemoizedStudentCard = memo(function MemoizedStudentCard({
  student,
  staffData,
  maxStaffPerStudent,
  onAddStaff,
  onRemoveStaff,
  onSwapStaff,
  assignmentResults,
}) {
  const [addStaffSearch, setAddStaffSearch] = useState("");
  const [swapStaffSearch, setSwapStaffSearch] = useState("");

  const availableStaff = useMemo(() => {
    return staffData.filter(
      (staff) => !student.assignedStaff.some((s) => s.id === staff.id)
    );
  }, [staffData, student.assignedStaff]);

  const filteredAddStaff = useMemo(() => {
    return availableStaff.filter((staff) =>
      staff.name.toLowerCase().includes(addStaffSearch.toLowerCase())
    );
  }, [availableStaff, addStaffSearch]);

  const staffWithAssignedStudents = useMemo(() => {
    const result = [];
    staffData.forEach(staff => {
      if (student.assignedStaff.some(s => s.id === staff.id)) return;
      
      const foundStaff = assignmentResults.find(s => s.id === staff.id);
      if (foundStaff && foundStaff.assignedStudents.length > 0) {
        result.push({
          ...staff,
          assignedStudents: foundStaff.assignedStudents.map(s => ({
            id: s.id,
            name: s.name
          }))
        });
      } else {
        result.push({
          ...staff,
          assignedStudents: []
        });
      }
    });
    return result;
  }, [staffData, student.assignedStaff, assignmentResults]);

  const filteredSwapStaff = useMemo(() => {
    return staffWithAssignedStudents.filter((staff) =>
      staff.name.toLowerCase().includes(swapStaffSearch.toLowerCase())
    );
  }, [staffWithAssignedStudents, swapStaffSearch]);

  return (
    <Card key={student.id} className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex gap-2 items-center flex-wrap">
            <CardTitle>{student.name}</CardTitle>
            <Popover modal={true}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="max-w-sm justify-between"
                  disabled={student.assignedStaff.length >= maxStaffPerStudent}
                >
                  Add Staff Member
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[330px] p-0">
                <Input
                  placeholder="Search staff..."
                  value={addStaffSearch}
                  onChange={(e) => setAddStaffSearch(e.target.value)}
                />
                <div className="max-h-[200px] mt-1 overflow-auto">
                  {filteredAddStaff.map((staff) => (
                    <Button
                      key={staff.id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => onAddStaff(student.id, staff.id)}
                    >
                      {staff.name}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-muted-foreground">
              ID: {student.id}
            </span>
            {student.performance && (
              <span className="text-sm">
                Performance: {student.performance}
              </span>
            )}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>
            Course: {student.course || "Not specified"}
          </p>
          <p>
            {student.interests.length > 0 ? (
              "Interests: " + student.interests.join(", ")
            ) : "No interests specified"
            }
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Interests</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {student.assignedStaff.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell>{staff.id}</TableCell>
                <TableCell>{staff.name}</TableCell>
                <TableCell>
                  {staff.interests.length > 0 ? (
                    staff.interests.join(", ")
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveStaff(student.id, staff.id)}
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </Button>
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Swap staff with"
                        >
                          <ArrowLeftRight className="h-5 w-5 text-blue-500" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[330px] p-0" side="left">
                        <Input
                          placeholder="Search staff..."
                          value={swapStaffSearch}
                          onChange={(e) => setSwapStaffSearch(e.target.value)}
                        />
                        <div className="max-h-[250px] overflow-auto mt-1">
                          {filteredSwapStaff.length > 0 ? (
                            filteredSwapStaff.map((swapStaff) => (
                              <div key={swapStaff.id} className="border-b border-border last:border-0">
                                <div className="px-2 py-1 font-semibold">{swapStaff.name}</div>
                                {swapStaff.assignedStudents.length > 0 ? (
                                  swapStaff.assignedStudents.map(assignedStudent => (
                                    <Button
                                      key={`${swapStaff.id}-${assignedStudent.id}`}
                                      variant="ghost"
                                      className="w-full justify-start pl-4 text-sm"
                                      onClick={() =>
                                        onSwapStaff(
                                          student.id,
                                          staff.id,
                                          swapStaff.id,
                                          assignedStudent.id
                                        )
                                      }
                                    >
                                      {assignedStudent.name}
                                    </Button>
                                  ))
                                ) : (
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start pl-4 text-sm"
                                    onClick={() =>
                                      onSwapStaff(
                                        student.id,
                                        staff.id,
                                        swapStaff.id
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

export default function StudentsAssignments({
  assignedStudentsToStaffData,
  staffData,
  maxStaffPerStudent,
  onAddStaff,
  onRemoveStaff,
  onSwapStaff,
  unassignedStudents,
  unassignedStaff,
  assignmentResults,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [interestSearch, setInterestSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  // Get unique interests and courses
  const { availableInterests, availableCourses } = useMemo(() => {
    const interests = new Set();
    const courses = new Set();

    assignedStudentsToStaffData.forEach(student => {
      student.interests.forEach(interest => interests.add(interest));
      if (student.course) courses.add(student.course);
      student.assignedStaff.forEach(staff => {
        staff.interests.forEach(interest => interests.add(interest));
        if (staff.course) courses.add(staff.course);
      });
    });

    return {
      availableInterests: Array.from(interests).sort(),
      availableCourses: Array.from(courses).sort()
    };
  }, [assignedStudentsToStaffData]);

  const unassignedStaffList = useMemo(() => {
    const assignedStaffIds = new Set(
      assignedStudentsToStaffData.flatMap(student =>
        student.assignedStaff.map(staff => staff.id)
      )
    );
    return staffData.filter(staff => !assignedStaffIds.has(staff.id));
  }, [assignedStudentsToStaffData, staffData]);

  const filteredStudents = useMemo(() => {
    let filtered = assignedStudentsToStaffData;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((student) => {
        if (student.name.toLowerCase().includes(query)) return true;
        if (student.id.toString().includes(query)) return true;
        return student.assignedStaff.some(
          (staff) =>
            staff.name.toLowerCase().includes(query) ||
            staff.id.toString().includes(query)
        );
      });
    }

    if (selectedInterests.length > 0) {
      filtered = filtered.filter(student =>
        selectedInterests.some(interest =>
          student.interests.includes(interest) ||
          student.assignedStaff.some(staff =>
            staff.interests.includes(interest)
          )
        )
      );
    }

    if (selectedCourses.length > 0) {
      filtered = filtered.filter(student =>
        selectedCourses.includes(student.course) ||
        student.assignedStaff.some(staff =>
          selectedCourses.includes(staff.course)
        )
      );
    }

    return filtered;
  }, [assignedStudentsToStaffData, searchQuery, selectedInterests, selectedCourses]);

  const filteredInterests = useMemo(() => {
    return availableInterests.filter(interest =>
      interest.toLowerCase().includes(interestSearch.toLowerCase())
    );
  }, [availableInterests, interestSearch]);

  const filteredCourses = useMemo(() => {
    return availableCourses.filter(course =>
      course.toLowerCase().includes(courseSearch.toLowerCase())
    );
  }, [availableCourses, courseSearch]);

  return (
    <div className="w-full space-y-4">

      {unassignedStudents.some(student => !student.unassignedStaff?.length) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Unassigned Students</h3>
          <div className="text-sm text-muted-foreground">
            {unassignedStudents
              .filter(student => !student.unassignedStaff?.length)
              .map((student) => (
                <Button
                  key={student.id}
                  variant="link"
                  className="p-0 h-auto font-normal hover:underline"
                  onClick={() => setSearchQuery(student.name)}
                >
                  {student.name}
                </Button>
              ))
              .reduce((prev, curr) => [prev, ', ', curr])}
          </div>
        </div>
      )}

      {unassignedStudents.some(student => student.unassignedStaff?.length > 0) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Partially Assigned Students</h3>
          <div className="text-sm text-muted-foreground">
            {unassignedStudents
              .filter(student => student.unassignedStaff?.length > 0)
              .map((student) => (
                <Button
                  key={student.id}
                  variant="link"
                  className="p-0 h-auto font-normal hover:underline"
                  onClick={() => setSearchQuery(student.name)}
                >
                  {`${student.name} (${student.unassignedStaff?.length})`}
                </Button>
              ))
              .reduce((prev, curr) => [prev, ', ', curr])}
          </div>
        </div>
      )}

      {unassignedStaff.some(staff => staff.assignedStudents?.length === 0) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Unassigned Staff</h3>
          <div className="text-sm text-muted-foreground">
            {unassignedStaff
              .filter(staff => staff.assignedStudents?.length === 0)
              .map(staff => staff.name)
              .join(", ")}
          </div>
        </div>
      )}

      {unassignedStaff.some(staff => staff.assignedStudents?.length > 0) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Partially Assigned Staff</h3>
          <div className="text-sm text-muted-foreground">
            {unassignedStaff
              .filter(staff => staff.assignedStudents?.length > 0)
              .map(staff => `${staff.name} (${staff.assignedStudents?.length})`)
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
                    {selectedInterests.map(interest => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive"
                        onClick={() => {
                          setSelectedInterests(prev =>
                            prev.filter(i => i !== interest)
                          );
                        }}
                      >
                        {interest}
                      </Badge>
                    ))}
                    {selectedCourses.map(course => (
                      <Badge
                        key={course}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive"
                        onClick={() => {
                          setSelectedCourses(prev =>
                            prev.filter(c => c !== course)
                          );
                        }}
                      >
                        {course}
                      </Badge>
                    ))}
                    {selectedInterests.length === 0 && selectedCourses.length === 0 && (
                      <span className="text-sm text-muted-foreground">
                        No filters selected
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Interests</h4>
                  <Input
                    placeholder="Search interests..."
                    value={interestSearch}
                    onChange={(e) => setInterestSearch(e.target.value)}
                    className="mb-2"
                  />
                  <div className="flex flex-wrap gap-1 max-h-[150px] overflow-y-auto">
                    {filteredInterests
                      .filter(interest => !selectedInterests.includes(interest))
                      .map(interest => (
                        <Badge
                          key={interest}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => {
                            setSelectedInterests(prev => [...prev, interest]);
                          }}
                        >
                          {interest}
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
                      .filter(course => !selectedCourses.includes(course))
                      .map(course => (
                        <Badge
                          key={course}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => {
                            setSelectedCourses(prev => [...prev, course]);
                          }}
                        >
                          {course}
                        </Badge>
                      ))}
                  </div>
                </div>

                {(selectedInterests.length > 0 || selectedCourses.length > 0) && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setSelectedInterests([]);
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
        {(selectedInterests.length > 0 || selectedCourses.length > 0) && (
          <div className="flex flex-wrap gap-1">
            {selectedInterests.map(interest => (
              <Badge
                key={interest}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive"
                onClick={() => {
                  setSelectedInterests(prev =>
                    prev.filter(i => i !== interest)
                  );
                }}
              >
                {interest}
              </Badge>
            ))}
            {selectedCourses.map(course => (
              <Badge
                key={course}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive"
                onClick={() => {
                  setSelectedCourses(prev =>
                    prev.filter(c => c !== course)
                  );
                }}
              >
                {course}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {unassignedStaffList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Not Yet Assigned Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {unassignedStaffList.map((staff) => (
                <Badge
                  key={staff.id}
                  variant="secondary"
                  className="px-3 py-1"
                >
                  {staff.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No students found matching your search criteria
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredStudents.map((student) => (
            <MemoizedStudentCard
              key={student.id}
              student={student}
              staffData={staffData}
              assignmentResults={assignmentResults || []}
              maxStaffPerStudent={maxStaffPerStudent}
              onAddStaff={onAddStaff}
              onRemoveStaff={onRemoveStaff}
              onSwapStaff={onSwapStaff}
            />
          ))}
        </div>
      )}
    </div>
  );
}
