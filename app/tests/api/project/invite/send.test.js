import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/api/project/invite/send/route";
import PBUser from "@/lib/pb/user";

// Mock dependencies
vi.mock("@/lib/pb/user", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("@/lib/pretty-print", () => ({
  prettifyPBError: vi.fn((error) => `Pretty: ${error}`),
}));

// Mock Response constructor
global.Response = vi.fn().mockImplementation((body, options) => {
  return {
    status: options?.status || 200,
    headers: new Headers(),
    json: async () => (typeof body === "string" ? JSON.parse(body) : body),
  };
});

describe("POST /api/project/invite/send", () => {
  let mockRequest;
  let mockPBUser;
  let mockPBOrg;
  let mockPBProject;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create project mock with createInvite method
    mockPBProject = {
      createInvite: vi.fn().mockResolvedValue({}),
    };

    // Create org mock with getProject method
    mockPBOrg = {
      getProject: vi.fn().mockResolvedValue(mockPBProject),
    };

    // Mock PB user
    mockPBUser = {
      getOrg: vi.fn().mockResolvedValue(mockPBOrg),
    };

    PBUser.get.mockResolvedValue(mockPBUser);

    // Mock request with the correct parameters
    mockRequest = {
      json: vi.fn().mockResolvedValue({
        orgId: "org123",
        projectId: "project123",
        memberIds: ["member1", "member2"],
        roleIds: ["role1", "role2"],
      }),
    };
  });

  it("should send project invites successfully", async () => {
    // Call the API handler
    const response = await POST(mockRequest);

    // Verify response status
    expect(response.status).toBe(201);

    // Verify method calls
    expect(PBUser.get).toHaveBeenCalledTimes(1);
    expect(mockPBUser.getOrg).toHaveBeenCalledWith("org123");
    expect(mockPBOrg.getProject).toHaveBeenCalledWith("project123");
    expect(mockPBProject.createInvite).toHaveBeenCalledTimes(2);
    expect(mockPBProject.createInvite).toHaveBeenCalledWith("member1", [
      "role1",
      "role2",
    ]);
    expect(mockPBProject.createInvite).toHaveBeenCalledWith("member2", [
      "role1",
      "role2",
    ]);
  });

  it("should handle missing organization ID", async () => {
    // Mock missing orgId
    mockRequest.json.mockResolvedValue({
      projectId: "project123",
      memberIds: ["member1"],
      roleIds: ["role1"],
    });

    // Mock error
    mockPBUser.getOrg.mockRejectedValue(
      new Error("Organization ID is required"),
    );

    // Call the API handler
    const response = await POST(mockRequest);
    const data = await response.json();

    // Check response
    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
  });

  it("should handle missing project ID", async () => {
    // Mock missing projectId
    mockRequest.json.mockResolvedValue({
      orgId: "org123",
      memberIds: ["member1"],
      roleIds: ["role1"],
    });

    // Mock error
    mockPBOrg.getProject.mockRejectedValue(new Error("Project ID is required"));

    // Call the API handler
    const response = await POST(mockRequest);
    const data = await response.json();

    // Check response
    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
  });

  it("should handle API errors", async () => {
    // Mock API error
    mockPBProject.createInvite.mockRejectedValue(
      new Error("Invalid operation"),
    );

    // Call the API handler
    const response = await POST(mockRequest);
    const data = await response.json();

    // Check response
    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
  });
});
