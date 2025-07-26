"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { exportStudentAssignments } from "../utils";
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
import StudentAssignments from "./student-assignment";
import StaffAssignments from "./staff-assignment";
import NameAssignmentDialog from "./name-assignment-dialog";

import { allocate } from "@/api/org/extension/BCU_ASSIGNMENT/allocate/route";

const tooltips = {
  maxStudents:
    "Define the maximum number of students each staff member can supervise.",
  interestBias:
    "Adjusts allocation based on student preferences for supervisors. Higher values prioritize matching student interests.",
  departmentBias:
    "Controls the tendency to assign students to supervisors within the same department. Higher values increase department-based allocation.",
  performanceBias:
    "Influences allocation based on student performance. Higher values prioritize assigning top-performing students to supervisors.",
  maxStaffPerStudent:
    "Defines how many staff members can be assigned to a single student.",
  fairShare:
    "Determines whether students should be fairly distributed among the staff.",
  randomize:
    "Randomizes the default order of staff and students before calculating the score matrix. Helpful when there are many students with no specified interests.",
  equalDistribution:
    "Enables fair share and sets the maximum students per staff to ensure equal distribution.",
};

export default function AssignmentModal({
  isOpen,
  onClose,
  staffData,
  studentData,
  loadedAssignmentData,
}) {
  const [params, setParams] = useState({
    maxStudents: 1,
    interestBias: 1.0,
    departmentBias: 0.3,
    performanceBias: 0.5,
    maxStaffPerStudent: 1,
    fairShare: true,
    randomize: false,
    equalDistribution: true,
  });
  const studentMap = useMemo(() => {
    const max = Math.ceil(studentData.length / staffData.length);
    setParams((prev) => ({
      ...prev,
      maxStudents: max,
    }));
    const map = new Map();
    studentData.forEach((student) => map.set(student.id, student));
    return map;
  }, [studentData]);

  const [assignmentResults, setAssignmentResults] = useState([]);

  const [assignedStudentsToStaffData, setAssignedStudentsToStaffData] =
    useState([]);

  const unassignedStudents = useMemo(() => {
    return assignedStudentsToStaffData.filter(
      (student) => student.assignedStaff.length < params.maxStaffPerStudent,
    );
  }, [assignedStudentsToStaffData]);

  const unassignedStaff = useMemo(() => {
    return assignmentResults.filter(
      (staff) => staff.assignedStudents.length < params.maxStudents,
    );
  }, [assignmentResults]);

  const [activeTab, setActiveTab] = useState("staff");
  const [isLoading, setIsLoading] = useState(false);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [defaultAssignmentName, setDefaultAssignmentName] = useState("");

  const assign = async (config) => {
    if (staffData.length === 0 || studentData.length === 0) {
      toast({
        title: "Please import both staff and student data before uploading",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = allocate(staffData, studentData, config);
      setAssignmentResults(result.staff);
      setAssignedStudentsToStaffData(result.students);
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

  const handleSwapStudent = useCallback(
    (staffId1, studentId1, staffId2, studentId2) => {
      const staffIndex1 = assignmentResults.findIndex(
        (staff) => staff.id === staffId1,
      );
      const staffIndex2 = assignmentResults.findIndex(
        (staff) => staff.id === staffId2,
      );

      if (staffIndex1 === -1 || staffIndex2 === -1) {
        console.error("Staff not found");
        return;
      }

      const staff1 = assignmentResults[staffIndex1];
      const staff2 = assignmentResults[staffIndex2];
      const student1 = studentMap.get(studentId1);
      const student2 = studentMap.get(studentId2);

      if (!student1 || !student2) {
        console.error("Student not found");
        return;
      }

      setAssignmentResults((prevStaffs) => {
        const newStaffs = [...prevStaffs];

        newStaffs[staffIndex1] = {
          ...staff1,
          assignedStudents: [
            ...staff1.assignedStudents.filter((s) => s.id !== studentId1),
            student2,
          ],
        };
        newStaffs[staffIndex2] = {
          ...staff2,
          assignedStudents: [
            ...staff2.assignedStudents.filter((s) => s.id !== studentId2),
            student1,
          ],
        };

        return newStaffs;
      });

      setAssignedStudentsToStaffData((prevStudents) => {
        return prevStudents.map((student) => {
          if (student.id === studentId1) {
            return {
              ...student,
              assignedStaff: student.assignedStaff.map((s) =>
                s.id === staffId1
                  ? {
                    id: staffId2,
                    name: staff2.name,
                    interests: staff2.interests,
                    course: staff2.course,
                    email: staff2.email,
                  }
                  : s,
              ),
            };
          } else if (student.id === studentId2) {
            return {
              ...student,
              assignedStaff: student.assignedStaff.map((s) =>
                s.id === staffId2
                  ? {
                    id: staffId1,
                    name: staff1.name,
                    interests: staff1.interests,
                    course: staff1.course,
                    email: staff1.email,
                  }
                  : s,
              ),
            };
          }
          return student;
        });
      });
    },
    [assignmentResults, studentMap],
  );

  const handleAddStudent = useCallback(
    (staffId, studentId) => {
      const studentToAdd = studentData.find((s) => s.id === studentId);
      if (!studentToAdd) return;

      setAssignmentResults((prev) =>
        prev.map((staff) => {
          if (staff.id !== staffId) return staff;

          // Check if current assigned students exceed maxStudents
          if (staff.assignedStudents.length >= params.maxStudents) {
            setTimeout(() => {
              toast({
                title: `You're adding more than the defined Max students per supervisor (${params.maxStudents})`,
                variant: "warning",
              });
            }, 0);
          }
          return {
            ...staff,
            assignedStudents: [...staff.assignedStudents, studentToAdd],
          };
        }),
      );
      setAssignedStudentsToStaffData((prevData) => {
        const updatedData = prevData.map((student) => {
          if (student.id === studentId) {
            const staffMember = assignmentResults.find(
              (staff) => staff.id === staffId,
            );
            if (staffMember) {
              return {
                ...student,
                assignedStaff: [...student.assignedStaff, staffMember],
              };
            }
          }
          return student;
        });
        return updatedData;
      });
    },
    [studentData, assignmentResults],
  );

  const handleRemoveStudent = useCallback((staffId, studentId) => {
    setAssignmentResults((prev) =>
      prev.map((staff) =>
        staff.id === staffId
          ? {
            ...staff,
            assignedStudents: staff.assignedStudents.filter(
              (s) => s.id !== studentId,
            ),
          }
          : staff,
      ),
    );
    setAssignedStudentsToStaffData((prevData) => {
      const updatedData = prevData.map((student) => {
        if (student.id === studentId) {
          return {
            ...student,
            assignedStaff: student.assignedStaff.filter(
              (staff) => staff.id !== staffId,
            ),
          };
        }
        return student;
      });
      return updatedData;
    });
  }, []);

  const handleAddStaff = useCallback((studentId, staffId) => {
    const staffToAdd = staffData.find((s) => s.id === staffId);
    if (!staffToAdd) return;

    setAssignmentResults((prev) =>
      prev.map((staff) => {
        if (staff.id !== staffId) return staff;
        return {
          ...staff,
          assignedStudents: [
            ...staff.assignedStudents,
            studentMap.get(studentId),
          ],
        };
      }),
    );

    setAssignedStudentsToStaffData((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) return student;
        return {
          ...student,
          assignedStaff: [
            ...student.assignedStaff,
            {
              id: staffToAdd.id,
              name: staffToAdd.name,
              interests: staffToAdd.interests,
              course: staffToAdd.course,
              email: staffToAdd.email,
            },
          ],
        };
      }),
    );
  }, [staffData, studentMap]);

  const handleRemoveStaff = useCallback((studentId, staffId) => {
    setAssignmentResults((prev) =>
      prev.map((staff) => {
        if (staff.id !== staffId) return staff;
        return {
          ...staff,
          assignedStudents: staff.assignedStudents.filter(
            (s) => s.id !== studentId,
          ),
        };
      }),
    );

    setAssignedStudentsToStaffData((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) return student;
        return {
          ...student,
          assignedStaff: student.assignedStaff.filter((s) => s.id !== staffId),
        };
      }),
    );
  }, []);

  const handleSwapStaff = useCallback((studentId1, staffId1, staffId2, studentId2) => {
    const staff2 = staffData.find((s) => s.id === staffId2);
    if (!staff2) return;

    setAssignmentResults((prev) => {
      const newAssignments = [...prev];
      const staff1Index = newAssignments.findIndex(s => s.id === staffId1);
      const staff2Index = newAssignments.findIndex(s => s.id === staffId2);
      
      if (staff1Index !== -1) {
        // Remove student1 from staff1
        newAssignments[staff1Index] = {
          ...newAssignments[staff1Index],
          assignedStudents: newAssignments[staff1Index].assignedStudents.filter(
            (s) => s.id !== studentId1
          )
        };
      }

      if (staff2Index !== -1) {
        // Add student1 to staff2
        newAssignments[staff2Index] = {
          ...newAssignments[staff2Index],
          assignedStudents: [
            ...newAssignments[staff2Index].assignedStudents.filter(s => !studentId2 || s.id !== studentId2),
            studentMap.get(studentId1)
          ]
        };
        
        // If studentId2 is provided, add it to staff1
        if (studentId2 && staff1Index !== -1) {
          const student2 = studentMap.get(studentId2);
          if (student2) {
            newAssignments[staff1Index] = {
              ...newAssignments[staff1Index],
              assignedStudents: [
                ...newAssignments[staff1Index].assignedStudents,
                student2
              ]
            };
          }
        }
      }
      
      return newAssignments;
    });

    setAssignedStudentsToStaffData((prev) => {
      return prev.map((student) => {
        // Handle student1
        if (student.id === studentId1) {
          return {
            ...student,
            assignedStaff: student.assignedStaff.map((s) =>
              s.id === staffId1 ? {
                id: staffId2,
                name: staff2.name,
                interests: staff2.interests,
                course: staff2.course,
                email: staff2.email
              } : s
            ),
          };
        }
        
        // Handle student2 if provided
        if (studentId2 && student.id === studentId2) {
          const staff1 = staffData.find(s => s.id === staffId1);
          if (staff1) {
            return {
              ...student,
              assignedStaff: [
                ...student.assignedStaff.filter(s => s.id !== staffId2),
                {
                  id: staffId1,
                  name: staff1.name,
                  interests: staff1.interests,
                  course: staff1.course,
                  email: staff1.email
                }
              ]
            };
          }
        }
        
        return student;
      });
    });
  }, [staffData, studentMap]);

  const handleExport = () => {
    exportStudentAssignments(assignedStudentsToStaffData);
  };

  const handleSaveClick = () => {
    if (assignmentResults.length === 0) {
      toast({
        title: "No assignments to save",
        variant: "destructive",
      });
      return;
    }

    const defaultName = `Assignment ${new Date().toLocaleString()}`;
    setDefaultAssignmentName(defaultName);
    setIsNameDialogOpen(true);
  };

  const handleSaveAssignments = (assignmentName) => {
    const assignmentData = {
      timestamp: new Date().toISOString(),
      name: assignmentName,
      criteria: {
        maxStudents: params.maxStudents,
        interestBias: params.interestBias,
        departmentBias: params.departmentBias,
        performanceBias: params.performanceBias,
        maxStaffPerStudent: params.maxStaffPerStudent,
        fairShare: params.fairShare,
        randomize: params.randomize,
        equalDistribution: params.equalDistribution,
      },
      staff: staffData,
      students: studentData,
      staffAssignments: assignmentResults.map((staff) => ({
        staffId: staff.id,
        studentIds: staff.assignedStudents.map((student) => student.id),
      })),
    };

    const savedAssignments = JSON.parse(
      localStorage.getItem("savedStudentAssignments") || "[]",
    );
    savedAssignments.push(assignmentData);

    localStorage.setItem(
      "savedStudentAssignments",
      JSON.stringify(savedAssignments),
    );

    toast({
      title: "Assignments saved successfully",
    });
  };

  useEffect(() => {
    if (isOpen && loadedAssignmentData) {
      try {
        if (loadedAssignmentData.criteria) {
          setParams({
            maxStudents:
              loadedAssignmentData.criteria.maxStudents || params.maxStudents,
            interestBias:
              loadedAssignmentData.criteria.interestBias || params.interestBias,
            departmentBias:
              loadedAssignmentData.criteria.departmentBias ||
              params.departmentBias,
            performanceBias:
              loadedAssignmentData.criteria.performanceBias ||
              params.performanceBias,
            maxStaffPerStudent:
              loadedAssignmentData.criteria.maxStaffPerStudent ||
              params.maxStaffPerStudent,
            fairShare:
              loadedAssignmentData.criteria.fairShare !== undefined
                ? loadedAssignmentData.criteria.fairShare
                : params.fairShare,
            randomize:
              loadedAssignmentData.criteria.randomize !== undefined
                ? loadedAssignmentData.criteria.randomize
                : params.randomize,
            equalDistribution:
              loadedAssignmentData.criteria.equalDistribution !== undefined
                ? loadedAssignmentData.criteria.equalDistribution
                : params.equalDistribution,
          });
        }

        if (
          loadedAssignmentData.staffAssignments &&
          loadedAssignmentData.staffAssignments.length > 0
        ) {
          const hasSavedStaff =
            loadedAssignmentData.staff && loadedAssignmentData.staff.length > 0;
          const hasSavedStudents =
            loadedAssignmentData.students &&
            loadedAssignmentData.students.length > 0;

          const staffToUse = hasSavedStaff
            ? loadedAssignmentData.staff
            : staffData;
          const studentsToUse = hasSavedStudents
            ? loadedAssignmentData.students
            : studentData;

          const studentMapToUse = new Map();
          studentsToUse.forEach((student) =>
            studentMapToUse.set(student.id, student),
          );

          const loadedResults = loadedAssignmentData.staffAssignments
            .map((item) => {
              const staff = staffToUse.find((s) => s.id === item.staffId);
              if (!staff) return null;

              const assignedStudents = item.studentIds
                .map((studentId) => studentMapToUse.get(studentId))
                .filter(Boolean);

              return {
                ...staff,
                assignedStudents,
              };
            })
            .filter(Boolean);

          const mappedStudents = studentsToUse.map((student) => {
            const assignedStaff = [];

            loadedAssignmentData.staffAssignments.forEach((item) => {
              if (item.studentIds.includes(student.id)) {
                const staff = staffToUse.find((s) => s.id === item.staffId);
                if (staff) {
                  assignedStaff.push({
                    id: staff.id,
                    name: staff.name,
                    interests: staff.interests,
                    course: staff.course,
                    email: staff.email,
                  });
                }
              }
            });

            return {
              ...student,
              assignedStaff,
            };
          });

          setAssignmentResults(loadedResults);
          setAssignedStudentsToStaffData(mappedStudents);
        }
      } catch (error) {
        toast({
          title: "Failed to load assignment data",
          variant: "destructive",
        });
        console.error(error);
      }
    }
  }, [isOpen, loadedAssignmentData, staffData, studentData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Set Criteria & Assign Staff</DialogTitle>
        </DialogHeader>

        <TooltipProvider delayDuration={300}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            <div className="space-y-4">
              {[
                { id: "interestBias", label: "Interest Bias" },
                { id: "departmentBias", label: "Course Bias" },
                { id: "performanceBias", label: "Performance Bias" },
              ].map(({ id, label }) => (
                <div key={id} className="flex items-center gap-2 flex-1">
                  <Label htmlFor={id} className="w-32">
                    {label}
                  </Label>
                  <Slider
                    id={id}
                    min={0}
                    max={1}
                    step={0.1}
                    value={[params[id]]}
                    onValueChange={([value]) =>
                      setParams({ ...params, [id]: value })
                    }
                    className="flex-1"
                  />
                  <span className="w-8 text-right">
                    {params[id].toFixed(1)}
                  </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <CircleAlert className="h-6 w-6 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="w-80">{tooltips[id]}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Label className="shrink-0" htmlFor="maxStudents">
                  Max Students
                </Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min={1}
                  value={params.maxStudents}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      maxStudents: Number.parseInt(e.target.value),
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
                    <p className="w-80">{tooltips.maxStudents}</p>
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
                    const max = Math.ceil(studentData.length / staffData.length);
                    setParams({
                      ...params,
                      equalDistribution: checked,
                      fairShare: checked ? true : params.fairShare,
                      maxStudents: checked ? max : params.maxStudents,
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
              <div className="flex items-center gap-2">
                <Label className="shrink-0" htmlFor="maxStaffPerStudent">
                  Max Staff Per Student
                </Label>
                <Input
                  id="maxStaffPerStudent"
                  type="number"
                  min={1}
                  value={params.maxStaffPerStudent}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      maxStaffPerStudent: Number.parseInt(e.target.value),
                    })
                  }
                  className="w-20"
                />
                <Tooltip>
                  <TooltipTrigger>
                    <CircleAlert className="h-6 w-6 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="w-80">{tooltips.maxStaffPerStudent}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </TooltipProvider>

        <Button onClick={handleAssign} disabled={isLoading}>
          Assign Staff to Students
        </Button>

        <div className="space-y-4">
          <div className="py-4 sticky -top-[24px] z-10 flex gap-2 items-center bg-background border-b border-accent-foreground">
            <h3 className="text-lg font-semibold">Assignment Results</h3>
            <Button variant="outline" onClick={handleExport}>
              <FileDown className="h-5 w-5" />
              Download Assignments
            </Button>
            <Button
              variant="outline"
              onClick={handleSaveClick}
              disabled={assignmentResults.length === 0}
            >
              <Save className="h-5 w-5 mr-2" />
              Save Assignments
            </Button>
            <div className="flex ml-auto border bg-muted rounded-lg">
              <Button
                variant={activeTab === "staff" ? "default" : "ghost"}
                className="flex-1 rounded-r-none"
                onClick={() => setActiveTab("staff")}
              >
                Staffs {"(" + staffData.length + ")"}
              </Button>
              <Button
                variant={activeTab === "student" ? "default" : "ghost"}
                className="flex-1 rounded-l-none"
                onClick={() => setActiveTab("student")}
              >
                Students {"(" + studentData.length + ")"}
              </Button>
            </div>
          </div>

          <div className="overflow-y-hidden overflow-x-auto">
            <div
              className={`w-full transition-opacity duration-300 ${activeTab === "student"
                  ? "visible opacity-100 h-full"
                  : "invisible opacity-0 h-0"
                }`}
            >
              <StudentAssignments
                assignedStudentsToStaffData={assignedStudentsToStaffData}
                staffData={staffData}
                unassignedStudents={unassignedStudents}
                unassignedStaff={unassignedStaff}
                maxStaffPerStudent={params.maxStaffPerStudent}
                onAddStaff={handleAddStaff}
                onRemoveStaff={handleRemoveStaff}
                onSwapStaff={handleSwapStaff}
                assignmentResults={assignmentResults}
              />
            </div>
            <div
              className={`w-full transition-opacity duration-300 ${activeTab === "staff"
                  ? "visible opacity-100 h-full"
                  : "invisible opacity-0 h-0"
                }`}
            >
              <StaffAssignments
                assignmentResults={assignmentResults}
                studentData={studentData}
                studentMap={studentMap}
                unassignedStudents={unassignedStudents}
                unassignedStaff={unassignedStaff}
                maxStudents={params.maxStudents}
                onAddStudent={handleAddStudent}
                onRemoveStudent={handleRemoveStudent}
                onSwapStudent={handleSwapStudent}
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
