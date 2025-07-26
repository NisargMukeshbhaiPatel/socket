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

const MemoizedStaffCard = memo(function MemoizedStaffCard({
  staff,
  staffIndex,
  studentData,
  studentMap,
  allStaffData,
  maxStudents,
  onAddStudent,
  onRemoveStudent,
  onSwapStudent,
}) {
  const availableStudents = useMemo(() => {
    return studentData.filter(
      (student) => !staff.assignedStudents.some((s) => s.id === student.id),
    );
  }, [staff.assignedStudents, studentData]);

  const [addStudentSearch, setAddStudentSearch] = useState("");
  const [swapStudentSearch, setSwapStudentSearch] = useState("");

  const filteredAddStudents = availableStudents.filter((student) =>
    student.name.toLowerCase().includes(addStudentSearch.toLowerCase()),
  );

  // Group students by staff
  const studentsGroupedByStaff = useMemo(() => {
    const staffWithStudents = {};
    
    allStaffData.forEach((otherStaff) => {
      if (otherStaff.id === staff.id) return; // Skip current staff
      
      const assignedStudents = otherStaff.assignedStudents.filter(student => 
        !staff.assignedStudents.some(s => s.id === student.id)
      );
      
      if (assignedStudents.length > 0) {
        staffWithStudents[otherStaff.id] = {
          id: otherStaff.id,
          name: otherStaff.name,
          students: assignedStudents.map(student => ({
            id: student.id,
            name: student.name,
            course: student.course,
            interests: student.interests,
            performance: student.performance
          }))
        };
      }
    });
    
    return staffWithStudents;
  }, [allStaffData, staff.id, staff.assignedStudents]);

  // Filter staff and their students
  const filteredStaffWithStudents = useMemo(() => {
    const result = {};
    const searchTerm = swapStudentSearch.toLowerCase();
    
    Object.values(studentsGroupedByStaff).forEach(staffObj => {
      // Filter by staff name or student names
      if (staffObj.name.toLowerCase().includes(searchTerm)) {
        result[staffObj.id] = staffObj;
      } else {
        const matchingStudents = staffObj.students.filter(student => 
          student.name.toLowerCase().includes(searchTerm)
        );
        
        if (matchingStudents.length > 0) {
          result[staffObj.id] = {
            ...staffObj,
            students: matchingStudents
          };
        }
      }
    });
    
    return result;
  }, [studentsGroupedByStaff, swapStudentSearch]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex gap-2 items-center flex-wrap">
          <CardTitle className="shrink-0">{staff.name}</CardTitle>
          <Popover modal={true}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="max-w-sm justify-between">
                Add a Student Not Yet Assigned to This Staff
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[330px] p-0">
              <Input
                placeholder="Search students..."
                value={addStudentSearch}
                onChange={(e) => setAddStudentSearch(e.target.value)}
              />
              <div className="max-h-[200px] mt-1 overflow-auto">
                {filteredAddStudents.map((student) => (
                  <Button
                    key={student.id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      if (staff.assignedStudents.length >= maxStudents) {
                        toast({
                          title: `You're adding more than the defined Max students per supervisor (${maxStudents})`,
                          variant: "warning",
                        });
                      }
                      onAddStudent(staff.id, student.id);
                    }}
                  >
                    {student.name}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>Interests: {staff.interests.join(", ")}</p>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Interests</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.assignedStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.id}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.course}</TableCell>
                <TableCell>{student.interests.join(", ")}</TableCell>
                <TableCell>{student?.performance}</TableCell>
                <TableCell>
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveStudent(staff.id, student.id)}
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </Button>
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Swap student with"
                        >
                          <ArrowLeftRight className="h-5 w-5 text-blue-500" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[330px] p-0" side="left">
                        <Input
                          placeholder="Search students or staff..."
                          value={swapStudentSearch}
                          onChange={(e) => setSwapStudentSearch(e.target.value)}
                        />
                        <div className="max-h-[250px] overflow-auto mt-1">
                          {Object.keys(filteredStaffWithStudents).length > 0 ? (
                            Object.values(filteredStaffWithStudents).map((staffObj) => (
                              <div key={staffObj.id} className="border-b border-border last:border-0">
                                <div className="px-2 py-1 font-semibold">{staffObj.name}</div>
                                {staffObj.students.map(swapStudent => (
                                  <Button
                                    key={`${staffObj.id}-${swapStudent.id}`}
                                    variant="ghost"
                                    className="w-full justify-start pl-4 text-sm"
                                    onClick={() =>
                                      onSwapStudent(
                                        staff.id,
                                        student.id,
                                        staffObj.id,
                                        swapStudent.id,
                                      )
                                    }
                                  >
                                    {swapStudent.name}
                                  </Button>
                                ))}
                              </div>
                            ))
                          ) : (
                            <div className="p-2 text-center text-muted-foreground">
                              No students available to swap
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

export default function StaffAssignments({
  assignmentResults,
  studentData,
  studentMap,
  maxStudents,
  onAddStudent,
  onRemoveStudent,
  onSwapStudent,
  unassignedStaff,
  unassignedStudents,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [filterSearch, setFilterSearch] = useState("");

  // Get unique interests from staff and their assigned students
  const availableInterests = useMemo(() => {
    const interests = new Set();
    assignmentResults.forEach((staff) => {
      staff.interests.forEach((interest) => interests.add(interest));
      staff.assignedStudents.forEach((student) =>
        student.interests.forEach((interest) => interests.add(interest)),
      );
    });
    return Array.from(interests).sort();
  }, [assignmentResults]);

  const filteredInterests = useMemo(() => {
    return availableInterests.filter((interest) =>
      interest.toLowerCase().includes(filterSearch.toLowerCase()),
    );
  }, [availableInterests, filterSearch]);

  const filteredAssignments = useMemo(() => {
    let filtered = assignmentResults;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((staff) => {
        if (staff.name.toLowerCase().includes(query)) return true;
        if (staff.id.toString().includes(query)) return true;
        return staff.assignedStudents.some(
          (student) =>
            student.name.toLowerCase().includes(query) ||
            student.id.toString().includes(query),
        );
      });
    }

    if (selectedInterests.length > 0) {
      filtered = filtered.filter((staff) =>
        selectedInterests.some(
          (interest) =>
            staff.interests.includes(interest) ||
            staff.assignedStudents.some((student) =>
              student.interests.includes(interest),
            ),
        ),
      );
    }

    return filtered;
  }, [assignmentResults, searchQuery, selectedInterests]);

  return (
    <div className="space-y-4">
      {unassignedStaff.some(staff => staff.assignedStudents?.length === 0) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Unassigned Staff</h3>
          <div className="text-sm text-muted-foreground">
            {unassignedStaff
              .filter(staff => staff.assignedStudents?.length === 0)
              .map((staff) => (
                <Button
                  key={staff.id}
                  variant="link"
                  className="p-0 h-auto font-normal hover:underline"
                  onClick={() => setSearchQuery(staff.name)}
                >
                  {staff.name}
                </Button>
              ))
              .reduce((prev, curr) => [prev, ", ", curr])}
          </div>
        </div>
      )}

      {unassignedStaff.some(staff => staff.assignedStudents?.length > 0) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Partially Assigned Staff</h3>
          <div className="text-sm text-muted-foreground">
            {unassignedStaff
              .filter(staff => staff.assignedStudents?.length > 0)
              .map((staff) => (
                <Button
                  key={staff.id}
                  variant="link"
                  className="p-0 h-auto font-normal hover:underline"
                  onClick={() => setSearchQuery(staff.name)}
                >
                  {`${staff.name} (${staff.assignedStudents?.length})`}
                </Button>
              ))
              .reduce((prev, curr) => [prev, ", ", curr])}
          </div>
        </div>
      )}

      {unassignedStudents.some(student => !student.unassignedStaff?.length) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Unassigned Students</h3>
          <div className="text-sm text-muted-foreground">
            {unassignedStudents
              .filter(student => !student.unassignedStaff?.length)
              .map((student) => student.name)
              .join(", ")}
          </div>
        </div>
      )}

      {unassignedStudents.some(student => student.unassignedStaff?.length > 0) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Partially Assigned Students</h3>
          <div className="text-sm text-muted-foreground">
            {unassignedStudents
              .filter(student => student.unassignedStaff?.length > 0)
              .map((student) => `${student.name} (${student.unassignedStaff?.length})`)
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
            <PopoverContent className="w-[400px]" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Selected Interests</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedInterests.length > 0 ? (
                      selectedInterests.map((interest) => (
                        <Badge
                          key={interest}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive"
                          onClick={() => {
                            setSelectedInterests((prev) =>
                              prev.filter((i) => i !== interest),
                            );
                          }}
                        >
                          {interest} ×
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No interests selected
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Available Interests</h4>
                  <Input
                    placeholder="Search interests..."
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    className="mb-2"
                  />
                  <div className="flex flex-wrap gap-1 max-h-[200px] overflow-y-auto">
                    {filteredInterests
                      .filter(
                        (interest) => !selectedInterests.includes(interest),
                      )
                      .map((interest) => (
                        <Badge
                          key={interest}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => {
                            setSelectedInterests((prev) => [...prev, interest]);
                          }}
                        >
                          {interest}
                        </Badge>
                      ))}
                  </div>
                </div>

                {selectedInterests.length > 0 && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setSelectedInterests([])}
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {selectedInterests.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedInterests.map((interest) => (
              <Badge
                key={interest}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive"
                onClick={() => {
                  setSelectedInterests((prev) =>
                    prev.filter((i) => i !== interest),
                  );
                }}
              >
                {interest} ×
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-6">
        {filteredAssignments.map((staff, staffIndex) => (
          <MemoizedStaffCard
            key={staff.id}
            staff={staff}
            staffIndex={staffIndex}
            studentData={studentData}
            studentMap={studentMap}
            allStaffData={assignmentResults}
            maxStudents={maxStudents}
            onAddStudent={onAddStudent}
            onRemoveStudent={onRemoveStudent}
            onSwapStudent={onSwapStudent}
          />
        ))}
      </div>
    </div>
  );
}
