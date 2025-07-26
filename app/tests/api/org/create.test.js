import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/api/org/create/route";

import PBUser from "@/lib/pb/user";
import PBOrg from "@/lib/pb/org";
import { prettifyPBError } from "@/lib/pretty-print";

// Mock dependencies
vi.mock("@/lib/pb/user", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("@/lib/pb/org", () => ({
  default: {
    create: vi.fn(),
  },
}));

vi.mock("@/lib/pretty-print", () => ({
  prettifyPBError: vi.fn((error) => `Pretty: ${error}`),
}));

describe("POST /api/org/create", () => {
  let mockFormData;
  let mockOrgInstance;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock form data
    mockFormData = {
      get: vi.fn((key) => {
        const data = {
          name: "Test Org",
          description: "Test Description",
          org_template: "default",
          roles: JSON.stringify([
            { name: "Admin", isAdmin: true, perms: ["*"], color: "#ff0000" },
          ]),
          extensions: JSON.stringify([
            { id: "ext1", config: { enabled: true } },
          ]),
        };
        return data[key] || null;
      }),
    };

    // Mock request
    global.Request = vi.fn();
    global.Request.prototype.formData = vi.fn().mockResolvedValue(mockFormData);

    // Mock PB user
    PBUser.get.mockResolvedValue({ id: "user123" });

    // Mock org instance
    mockOrgInstance = {
      id: "org123",
      createRole: vi.fn().mockResolvedValue({}),
      addExtension: vi.fn().mockResolvedValue({}),
    };

    // Mock PB org creation
    PBOrg.create.mockResolvedValue(mockOrgInstance);
  });

  it("should create an organization successfully", async () => {
    // Create mock request
    const request = new Request();

    // Call the API handler
    const response = await POST(request);
    const data = await response.json();

    // Check response
    expect(response.status).toBe(201);
    expect(data).toEqual({ orgId: "org123" });

    // Verify calls
    expect(PBUser.get).toHaveBeenCalledTimes(1);
    expect(PBOrg.create).toHaveBeenCalledWith(
      { id: "user123" },
      "Test Org",
      null, // icon_file
      "Test Description",
      "default",
    );

    // Verify role creation
    expect(mockOrgInstance.createRole).toHaveBeenCalledWith(
      "Admin",
      true,
      ["*"],
      "#ff0000",
    );

    // Verify extension creation
    expect(mockOrgInstance.addExtension).toHaveBeenCalledWith("ext1", {
      enabled: true,
    });
  });

  it("should handle missing form data", async () => {
    mockFormData.get = vi.fn((key) => {
      if (key === "name") return null;
      const data = {
        description: "Test Description",
        org_template: "default",
        roles: JSON.stringify([
          { name: "Admin", isAdmin: true, perms: ["*"], color: "#ff0000" },
        ]),
        extensions: JSON.stringify([{ id: "ext1", config: { enabled: true } }]),
      };

      return data[key] || null;
    });

    const request = new Request();

    // Mock PBOrg.create to throw an error
    PBOrg.create.mockRejectedValue({
      data: { name: { message: "Name is required" } },
      message: "Validation failed",
    });

    // Call the API handler
    const response = await POST(request);
    const data = await response.json();

    // Check response
    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
    expect(prettifyPBError).toHaveBeenCalled();
  });

  it("should handle file uploads correctly", async () => {
    // Create a mock File
    const mockFile = new File(["dummy content"], "test-icon.png", {
      type: "image/png",
    });

    // Override mock to return file for icon_file
    mockFormData.get = vi.fn((key) => {
      if (key === "icon_file") return mockFile;
      const data = {
        name: "Test Org",
        description: "Test Description",
        org_template: "default",
        roles: JSON.stringify([]),
        extensions: JSON.stringify([]),
      };
      return data[key] || null;
    });

    const request = new Request();

    // Call the API handler
    const response = await POST(request);

    // Check response
    expect(response.status).toBe(201);

    // Verify calls with file
    expect(PBOrg.create).toHaveBeenCalledWith(
      { id: "user123" },
      "Test Org",
      mockFile, // icon_file should be passed
      "Test Description",
      "default",
    );
  });
});
