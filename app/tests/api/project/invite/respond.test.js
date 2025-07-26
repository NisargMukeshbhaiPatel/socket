import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/api/project/invite/respond/route";
import PBUser from "@/lib/pb/user";

// Mock dependencies
vi.mock("@/lib/pb/user", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("POST /api/project/invite/respond", () => {
  let mockRequest;
  let mockPBUser;
  let mockPBOrg;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock PB org
    mockPBOrg = {
      acceptProjectInvite: vi.fn().mockResolvedValue({}),
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
        inviteId: "invite123",
        accepted: true,
      }),
    };
  });

  it("should accept a project invite successfully", async () => {
    // Call the API handler
    const response = await POST(mockRequest);

    // Check response
    expect(response.status).toBe(201);

    // Verify calls
    expect(PBUser.get).toHaveBeenCalledTimes(1);
    expect(mockPBUser.getOrg).toHaveBeenCalledWith("org123");
    expect(mockPBOrg.acceptProjectInvite).toHaveBeenCalledWith(
      "invite123",
      true,
    );
  });

  it("should decline a project invite successfully", async () => {
    // Set accepted to false
    mockRequest.json.mockResolvedValue({
      orgId: "org123",
      inviteId: "invite123",
      accepted: false,
    });

    // Call the API handler
    const response = await POST(mockRequest);

    // Check response
    expect(response.status).toBe(201);

    // Verify calls
    expect(mockPBOrg.acceptProjectInvite).toHaveBeenCalledWith(
      "invite123",
      false,
    );
  });

  it("should handle missing invite ID", async () => {
    // Mock missing inviteId
    mockRequest.json.mockResolvedValue({
      orgId: "org123",
      accepted: true,
    });

    // Mock error
    const error = new Error("Invite ID is required");
    mockPBOrg.acceptProjectInvite.mockRejectedValue(error);

    // Call the API handler
    const response = await POST(mockRequest);
    const data = await response.json();

    // Check response
    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Invite ID is required" });
  });

  it("should handle missing organization ID", async () => {
    // Mock missing orgId
    mockRequest.json.mockResolvedValue({
      inviteId: "invite123",
      accepted: true,
    });

    // Mock error
    const error = new Error("Organization ID is required");
    mockPBUser.getOrg.mockRejectedValue(error);

    // Call the API handler
    const response = await POST(mockRequest);
    const data = await response.json();

    // Check response
    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Organization ID is required" });
  });
});
