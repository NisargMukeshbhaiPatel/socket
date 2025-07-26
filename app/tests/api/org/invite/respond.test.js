import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/api/org/invite/respond/route";
import PBUser from "@/lib/pb/user";

// Mock dependencies
vi.mock("@/lib/pb/user", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("POST /api/org/invite/respond", () => {
  let mockRequest;
  let mockPBUser;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock PB user
    mockPBUser = {
      acceptInvite: vi.fn().mockResolvedValue({}),
    };
    PBUser.get.mockResolvedValue(mockPBUser);

    // Mock request
    mockRequest = {
      json: vi.fn().mockResolvedValue({
        inviteId: "invite123",
        accepted: true
      })
    };
  });

  it("should accept an invite successfully", async () => {
    // Call the API handler
    const response = await POST(mockRequest);

    // Check response
    expect(response.status).toBe(201);
    
    // Verify calls
    expect(PBUser.get).toHaveBeenCalledTimes(1);
    expect(mockPBUser.acceptInvite).toHaveBeenCalledWith(
      "invite123",
      true
    );
  });

  it("should decline an invite successfully", async () => {
    // Set accepted to false
    mockRequest.json.mockResolvedValue({
      inviteId: "invite123",
      accepted: false
    });

    // Call the API handler
    const response = await POST(mockRequest);

    // Check response
    expect(response.status).toBe(201);
    
    // Verify calls
    expect(mockPBUser.acceptInvite).toHaveBeenCalledWith(
      "invite123",
      false
    );
  });

  it("should handle missing invite ID", async () => {
    // Mock missing inviteId
    mockRequest.json.mockResolvedValue({
      accepted: true
    });

    // Mock error from acceptInvite
    mockPBUser.acceptInvite.mockRejectedValue(
      new Error("Invite ID is required")
    );

    // Call the API handler
    const response = await POST(mockRequest);
    const data = await response.json();

    // Check response
    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Invite ID is required" });
  });

  it("should handle API errors", async () => {
    // Mock API error
    mockPBUser.acceptInvite.mockRejectedValue(
      new Error("Invalid invite or permission denied")
    );

    // Call the API handler
    const response = await POST(mockRequest);
    const data = await response.json();

    // Check response
    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Invalid invite or permission denied" });
  });
});

