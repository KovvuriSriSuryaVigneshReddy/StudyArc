import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { POST } from "@/app/api/generate/route";
import { NextRequest } from "next/server";

describe("/api/generate Route Handler", () => {
  const originalEnvKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    if (originalEnvKey) {
      process.env.GEMINI_API_KEY = originalEnvKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  });

  it("returns 400 Bad Request when API key is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "192.168.1.50",
      },
      body: JSON.stringify({
        content: "Valid lecture notes on calculus.",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain("API Key missing");
  });

  it("returns 400 Bad Request when lecture content is empty", async () => {
    const req = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "192.168.1.51",
      },
      body: JSON.stringify({
        apiKey: "AIzaSyFakeTestKey123",
        content: "   ",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain("No lecture content provided");
  });

  it("returns 400 Bad Request when content property is omitted from payload", async () => {
    const req = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "192.168.1.54",
      },
      body: JSON.stringify({
        apiKey: "AIzaSyFakeTestKey123",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain("No lecture content provided");
  });

  it("returns 400 Bad Request when content exceeds 25,000 characters", async () => {
    const hugeContent = "X".repeat(25001);
    const req = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "192.168.1.52",
      },
      body: JSON.stringify({
        apiKey: "AIzaSyFakeTestKey123",
        content: hugeContent,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain("Input exceeds maximum allowed size");
  });

  it("handles malformed JSON body gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const req = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "192.168.1.53",
      },
      body: "{ invalid_json: ",
    });

    const res = await POST(req);
    // Malformed JSON should be caught by catch handler
    expect([400, 500]).toContain(res.status);

    const data = await res.json();
    expect(data.error).toBeDefined();
    consoleSpy.mockRestore();
  });
});
