import { describe, it, expect } from "vitest";
import { transformProjectsData, transformMemberData, allocate } from "../../../(dashboard)/org/[orgId]/extension/BCU_PROJECT_ASS/utils";

describe("Project Based Assignment Utils", () => {
  describe("transformProjectsData", () => {
    it("should transform projects data correctly", () => {
      const input = [
        ["Name", "Description", "Skills"],
        ["Project A", "Test project", "javascript,react"],
        ["Project B", "Another project", "python,django"]
      ];
      
      const result = transformProjectsData(input);
      
      expect(result.projects).toHaveLength(2);
      expect(result.uniqueSkills).toContain("javascript");
      expect(result.uniqueSkills).toContain("react");
    });
  });

  describe("transformMemberData", () => {
    it("should transform member data correctly", () => {
      const input = [
        ["Name", "Email", "Skills"],
        ["John Doe", "john@test.com", "javascript,react"],
        ["Jane Doe", "jane@test.com", "python,django"]
      ];
      
      const result = transformMemberData(input);
      
      expect(result.members).toHaveLength(2);
      expect(result.uniqueSkills).toContain("javascript");
      expect(result.uniqueSkills).toContain("python");
    });
  });

  describe("allocate", () => {
    it("should allocate projects to members correctly", () => {
      const projects = [
        { id: 1, name: "Project A", skills: ["javascript", "react"] },
        { id: 2, name: "Project B", skills: ["python", "django"] }
      ];

      const members = [
        { id: 1, name: "Member 1", skills: ["javascript", "react"] },
        { id: 2, name: "Member 2", skills: ["python", "django"] }
      ];

      const config = {
        fairShare: true,
        maxProjectPerMember: 1,
        maxMembers: 1,
        randomize: false
      };

      const result = allocate(projects, members, config);

      expect(result.projects).toHaveLength(2);
      expect(result.members).toHaveLength(2);
      expect(result.assignments).toBeDefined();
      
      // Verify allocations follow rules
      result.projects.forEach(project => {
        expect(project.assignedMembers.length).toBeLessThanOrEqual(config.maxMembers);
      });

      result.members.forEach(member => {
        expect(member.assignedProjects.length).toBeLessThanOrEqual(config.maxProjectPerMember);
      });
    });
  });
});
