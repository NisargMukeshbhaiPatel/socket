import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/api/project/create/route";
import PBUser from "@/lib/pb/user";
import { prettifyPBError } from "@/lib/pretty-print";

// Mock dependencies
vi.mock("@/lib/pb/user", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("@/lib/pretty-print", () => ({
  prettifyPBError: vi.fn((error) =>
    error ? `Pretty: ${JSON.stringify(error)}` : undefined,
  ),
}));

describe("POST /api/project/create", () => {
  let mockRequest;
  let mockPBUser;
  let mockPBOrg;
  let mockProject;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock project
    mockProject = {
      project: { id: "project123" },
      createStatus: vi.fn().mockImplementation((name, description) => {
        return Promise.resolve({ id: `status-${name}`, name, description });
      }),
      createRole: vi.fn().mockResolvedValue({}),
      addExtension: vi.fn().mockResolvedValue({}),
      editDoneStatus: vi.fn().mockResolvedValue({}),
    };

    // Mock PB org
    mockPBOrg = {
      createProject: vi.fn().mockResolvedValue(mockProject),
    };

    // Mock PB user
    mockPBUser = {
      getOrg: vi.fn().mockResolvedValue(mockPBOrg),
    };
    PBUser.get.mockResolvedValue(mockPBUser);

    // Mock request
    mockRequest = {
      json: vi.fn().mockResolvedValue({
        orgId: "org123",
        name: "Test Project",
        description: "Project Description",
        templateId: "template123",
        projectRoles: [
          {
            name: "Manager",
            isAdmin: true,
            perms: ["manage"],
            color: "#ff0000",
          },
        ],
        taskStatuses: [
          { name: "To Do", description: "Tasks to be done" },
          { name: "In Progress", description: "Tasks in progress" },
          { name: "Done", description: "Completed tasks" },
        ],
        doneTaskIndex: 2,
        extensions: [{ id: "ext1", config: { enabled: true } }],
      }),
    };
  });

  it("should create a project successfully with all options", async () => {
    // Call the API handler
    const response = await POST(mockRequest);
    const data = await response.json();

    // Check response
    expect(response.status).toBe(201);
    expect(data).toEqual({ prjId: "project123" });

    // Verify calls
    expect(PBUser.get).toHaveBeenCalledTimes(1);
    expect(mockPBUser.getOrg).toHaveBeenCalledWith("org123");
    expect(mockPBOrg.createProject).toHaveBeenCalledWith(
      "Test Project",
      "Project Description",
      "template123",
    );

    // Verify task statuses creation
    expect(mockProject.createStatus).toHaveBeenCalledTimes(3);
    expect(mockProject.createStatus).toHaveBeenNthCalledWith(
      1,
      "To Do",
      "Tasks to be done",
    );

    // Verify role creation
    expect(mockProject.createRole).toHaveBeenCalledWith(
      "Manager",
      true,
      ["manage"],
      "#ff0000",
    );

    // Verify extension creation
    expect(mockProject.addExtension).toHaveBeenCalledWith("ext1", {
      enabled: true,
    });

    // Verify done status setting
    expect(mockProject.editDoneStatus).toHaveBeenCalledWith("status-Done");
  });

  it("should create a project with minimal options", async () => {
    // Mock request with minimal data
    mockRequest.json.mockResolvedValue({
      orgId: "org123",
      name: "Minimal Project",
      description: "Minimal Description",
      templateId: "template123",
      // No projectRoles, taskStatuses, extensions
    });

    // Call the API handler
    const response = await POST(mockRequest);
    const data = await response.json();

    // Check response
    expect(response.status).toBe(201);
    expect(data).toEqual({ prjId: "project123" });

    // Verify the optional calls were not made
    expect(mockProject.createStatus).not.toHaveBeenCalled();
    expect(mockProject.createRole).not.toHaveBeenCalled();
    expect(mockProject.addExtension).not.toHaveBeenCalled();
    expect(mockProject.editDoneStatus).not.toHaveBeenCalled();
  });

  it("should handle missing organization ID", async () => {
    // Mock missing orgId
    mockRequest.json.mockResolvedValue({
      name: "Test Project",
      description: "Project Description",
      templateId: "template123",
    });

    // Mock error
    const error = new Error("Organization ID is required");
    mockPBUser.getOrg.mockRejectedValue(error);

    // Call the API handler
    const response = await POST(mockRequest);
    const data = await response.json();

    // Check response
    expect(response.status).toBe(400);
    expect(data.error).toBe("Organization ID is required");
  });

  it("should handle validation errors", async () => {
    // Mock validation error
    const error = new Error("Validation failed");
    error.data = { name: { message: "Project name is required" } };
    mockPBOrg.createProject.mockRejectedValue(error);

    // Call the API handler
    const response = await POST(mockRequest);
    const data = await response.json();

    // Check response
    expect(response.status).toBe(400);
    expect(prettifyPBError).toHaveBeenCalledWith(error.data);
    expect(data.error).toContain("Pretty:");
  });
});
