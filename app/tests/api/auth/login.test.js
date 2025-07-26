import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/api/auth/login/route";

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  })),
}));

vi.mock("@/lib/pb/auth", () => ({
  default: {
    authenticate: vi.fn(),
    getStoredAccounts: vi.fn().mockReturnValue([]),
  },
}));

import PBAuth from "@/lib/pb/auth";

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock Request and JSON methods
    global.Request = vi.fn();
    global.Request.prototype.json = vi.fn().mockResolvedValue({
      email: "test@example.com",
      password: "password123",
    });

    // Headers mock
    global.Headers = vi.fn().mockImplementation(() => ({
      append: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      set: vi.fn(),
    }));

    // Mock Response
    global.Response = vi.fn().mockImplementation((body, options) => {
      return {
        status: options?.status || 201,
        headers: new Headers(),
        json: async () => (typeof body === "string" ? JSON.parse(body) : body),
      };
    });
  });

  it("should login user successfully", async () => {
    // Mock successful login
    PBAuth.authenticate.mockResolvedValue({
      record: {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
      },
      token: "auth-token-123",
    });

    PBAuth.getStoredAccounts.mockReturnValue([{ id: "user123" }]);

    // Create mock request
    const request = new Request();

    // Call the API handler
    const response = await POST(request);

    // Check response
    expect(response.status).toBe(201);

    // Verify calls
    expect(PBAuth.authenticate).toHaveBeenCalledWith(
      expect.anything(),
      "test@example.com",
      "password123",
    );
  });

  it("should handle login failure", async () => {
    PBAuth.authenticate.mockRejectedValue(new Error("Authentication failed"));

    // Create mock request
    const request = new Request();

    // Call the API handler with try/catch
    let response;
    try {
      response = await POST(request);
    } catch (error) {
      fail("Route did not catch the error: " + error.message);
    }

    const data = await response.json();

    // Check response
    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
  });
});
