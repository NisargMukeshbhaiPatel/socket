import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Run cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Safe stringify that handles circular references
function safeStringify(obj) {
  const seen = new WeakSet();
  return JSON.stringify(obj, (_, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
    }
    return value;
  });
}

// Mock Response
global.Response = class {
  constructor(body, options = {}) {
    if (typeof body === "string") {
      this.body = body;
    } else {
      try {
        this.body = safeStringify(body);
      } catch (e) {
        this.body = JSON.stringify({ error: "Could not stringify body" });
      }
    }
    this.status = options.status || 200;
    this.headers = options.headers || {};
    this._headers = new Map(Object.entries(this.headers));
  }

  json() {
    return Promise.resolve(JSON.parse(this.body));
  }

  text() {
    return Promise.resolve(this.body);
  }
};

// Mock Request
global.Request = class {
  constructor(url, options = {}) {
    this.url = url || "http://localhost:3000/api/test";
    this.method = options.method || "GET";
    this.headers = options.headers || {};
    this.body = options.body || null;
  }

  async json() {
    return this._mockJson || {};
  }

  async formData() {
    return this._mockFormData || new FormData();
  }

  async text() {
    return this._mockText || "";
  }

  // Helper methods for tests
  setMockJson(data) {
    this._mockJson = data;
    return this;
  }

  setMockFormData(data) {
    this._mockFormData = data;
    return this;
  }
};

// Mock Headers
global.Headers = class {
  constructor(init) {
    this._headers = new Map();
    if (init) {
      for (const [key, value] of Object.entries(init)) {
        this._headers.set(key.toLowerCase(), value);
      }
    }
  }

  append(name, value) {
    this._headers.set(name.toLowerCase(), value);
  }

  get(name) {
    return this._headers.get(name.toLowerCase()) || null;
  }
};
