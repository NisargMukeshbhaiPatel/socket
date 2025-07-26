import { describe, it, expect } from "vitest";
import { allocate } from "../../../api/org/extension/BCU_ASSIGNMENT/allocate/route";

describe("BCU Assignment Allocation", () => {
  const createTestData = () => {
    const staff = [
      {
        name: "Staff 1",
        interests: ["math", "physics"],
      },
      {
        name: "Staff 2",
        interests: ["chemistry", "biology"],
      }
    ];

    const students = [
      {
        name: "Student 1",
        interests: ["math"],
        course: "Science",
        performance: 0.8
      },
      {
        name: "Student 2",
        interests: ["biology"],
        course: "Medical",
        performance: 0.9
      }
    ];

    return { staff, students };
  };

  describe("basic allocation", () => {
    it("should allocate students to staff members", () => {
      const { staff, students } = createTestData();
      const config = {
        maxStudents: 2,
        maxStaffPerStudent: 1,
        fairShare: false,
        randomize: false,
        interestBias: 1,
        departmentBias: 0.5,
        performanceBias: 0.5
      };

      const result = allocate(staff, students, config);

      expect(result.assignments).toBeDefined();
      expect(result.assignments.length).toBeGreaterThan(0);
      expect(result.staff[0].assignedStudents).toBeDefined();
      expect(result.students[0].assignedStaff).toBeDefined();
    });

    it("should respect maxStudents limit", () => {
      const { staff, students } = createTestData();
      const config = {
        maxStudents: 1,
        maxStaffPerStudent: 1,
        fairShare: false
      };

      const result = allocate(staff, students, config);

      result.staff.forEach(staffMember => {
        expect(staffMember.assignedStudents.length).toBeLessThanOrEqual(config.maxStudents);
      });
    });
  });

  describe("fairShare allocation", () => {
    it("should distribute students evenly when fairShare is true", () => {
      const { staff, students } = createTestData();
      const config = {
        maxStudents: 2,
        maxStaffPerStudent: 1,
        fairShare: true
      };

      const result = allocate(staff, students, config);

      const assignmentCounts = result.staff.map(s => s.assignedStudents.length);
      const maxCount = Math.max(...assignmentCounts);
      const minCount = Math.min(...assignmentCounts);
      expect(maxCount - minCount).toBeLessThanOrEqual(1);
    });
  });

  describe("bias configurations", () => {
    it("should prioritize interest matching when interestBias is high", () => {
      const { staff, students } = createTestData();
      const config = {
        maxStudents: 2,
        maxStaffPerStudent: 1,
        interestBias: 1,
        departmentBias: 0,
        performanceBias: 0
      };

      const result = allocate(staff, students, config);
      
      // Math interest student should be assigned to Staff 1 who has math interest
      const mathStaff = result.staff.find(s => 
        s.assignedStudents.some(student => student.name === "Student 1")
      );
      expect(mathStaff.name).toBe("Staff 1");
    });
  });
});
