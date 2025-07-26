import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/api/org/invite/send/route";
import PBUser from "@/lib/pb/user";
import { prettifyPBError } from "@/lib/pretty-print";

// Mock dependencies
vi.mock("@/lib/pb/user", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("@/lib/pretty-print", () => ({
  prettifyPBError: vi.fn((error) => `Pretty: ${JSON.stringify(error)}`),
}));

describe("POST /api/org/invite/send", () => {
  let mockRequest;
  let mockPBUser;
  let mockPBOrg;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock PB org
    mockPBOrg = {
      invite: vi.fn().mockResolvedValue({}),
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
        emails: ["user1@example.com", "user2@example.com"],
        roleIds: ["role1", "role2"],
      }),
    };
  });

  it("should send invites successfully", async () => {
    // Call the API handler
    const response = await POST(mockRequest);

    // Check response
    expect(response.status).toBe(201);

    // Verify calls
    expect(PBUser.get).toHaveBeenCalledTimes(1);
    expect(mockPBUser.getOrg).toHaveBeenCalledWith("org123");

    // Verify invites were sent
    expect(mockPBOrg.invite).toHaveBeenCalledTimes(2);
    expect(mockPBOrg.invite).toHaveBeenCalledWith("user1@example.com", [
      "role1",
      "role2",
    ]);
    expect(mockPBOrg.invite).toHaveBeenCalledWith("user2@example.com", [
      "role1",
      "role2",
    ]);
  });

  it("should handle when no emails are provided", async () => {
    mockRequest.json.mockResolvedValue({
      orgId: "org123",
      emails: [],
      roleIds: ["role1", "role2"],
    });

    const response = await POST(mockRequest);

    expect(response.status).toBe(201);

    expect(mockPBOrg.invite).not.toHaveBeenCalled();
  });

  it("should handle missing organization ID", async () => {
    // Mock missing orgId
    mockRequest.json.mockResolvedValue({
      emails: ["user1@example.com"],
      roleIds: ["role1"],
    });

    // Mock error with both message and data property
    const error = new Error("Organization ID is required");
    mockPBUser.getOrg.mockRejectedValue(error);

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Pretty:");
  });

  it("should handle API errors with data", async () => {
    // Create error with data property
    const errorWithData = new Error("Validation failed");
    errorWithData.data = {
      email: { message: "Invalid email format" },
    };

    // Mock invite to throw error with data
    mockPBOrg.invite.mockRejectedValue(errorWithData);

    // Call the API handler
    const response = await POST(mockRequest);
    const data = await response.json();

    // Check response
    expect(response.status).toBe(400);
    expect(prettifyPBError).toHaveBeenCalledWith(errorWithData.data);
    expect(data.error).toContain("Pretty:");
  });
});
