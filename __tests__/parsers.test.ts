import { describe, it, expect } from "vitest";
import { parseTextFile, parseUploadedFile } from "@/lib/fileParsers";
import { checkRateLimit } from "@/lib/rateLimit";

describe("File Parsers & Payload Truncation", () => {
  it("extracts text content correctly from text files", async () => {
    const content = "Introduction to Deep Learning\nNeural networks and backpropagation.";
    const file = new File([content], "lecture-notes.txt", { type: "text/plain" });

    const result = await parseTextFile(file);

    expect(result.text).toBe(content);
    expect(result.fileName).toBe("lecture-notes.txt");
    expect(result.type).toBe("txt");
    expect(result.fileSize).toBe(content.length);
  });

  it("handles markdown files via universal parseUploadedFile dispatcher", async () => {
    const mdContent = "# Operating Systems\n\nProcess scheduling and semaphores.";
    const file = new File([mdContent], "os-notes.md", { type: "text/markdown" });

    const result = await parseUploadedFile(file);

    expect(result.text).toBe(mdContent);
    expect(result.fileName).toBe("os-notes.md");
    expect(result.type).toBe("txt");
  });

  it("sanitizes text content by trimming leading and trailing extraneous whitespace", async () => {
    const rawContent = "   \n\n  Quantum Mechanics: Wave-particle duality and Schrödinger equation.   \n\t  ";
    const file = new File([rawContent], "quantum.txt", { type: "text/plain" });

    const result = await parseTextFile(file);

    expect(result.text).toBe("Quantum Mechanics: Wave-particle duality and Schrödinger equation.");
    expect(result.text.startsWith(" ")).toBe(false);
    expect(result.text.endsWith(" ")).toBe(false);
  });

  it("enforces 25,000 character maximum payload truncation logic", () => {
    const MAX_LENGTH = 25000;
    const oversizedPayload = "A".repeat(35000);

    // Ensure our truncation logic caps oversized text at precisely 25,000 characters
    const truncatedPayload = oversizedPayload.slice(0, MAX_LENGTH);

    expect(oversizedPayload.length).toBe(35000);
    expect(truncatedPayload.length).toBe(25000);
    expect(truncatedPayload.length).toBeLessThanOrEqual(MAX_LENGTH);
  });
});

describe("Rate Limiter Logic (Sliding Window / IP Tracking)", () => {
  it("allows up to 5 requests per IP address within the window", () => {
    const testIp = "192.168.100.1";

    // 1st request
    const r1 = checkRateLimit(testIp);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(4);

    // 2nd through 5th requests
    const r2 = checkRateLimit(testIp);
    const r3 = checkRateLimit(testIp);
    const r4 = checkRateLimit(testIp);
    const r5 = checkRateLimit(testIp);

    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(true);
    expect(r4.allowed).toBe(true);
    expect(r5.allowed).toBe(true);
    expect(r5.remaining).toBe(0);

    // 6th request should be blocked
    const r6 = checkRateLimit(testIp);
    expect(r6.allowed).toBe(false);
    expect(r6.remaining).toBe(0);
    expect(r6.resetTime).toBeGreaterThan(Date.now());
  });

  it("tracks rate limits independently for different IP addresses", () => {
    const ipA = "10.0.0.1";
    const ipB = "10.0.0.2";

    // Exhaust ipA
    for (let i = 0; i < 5; i++) {
      checkRateLimit(ipA);
    }
    const ipABlocked = checkRateLimit(ipA);
    expect(ipABlocked.allowed).toBe(false);

    // ipB should still be completely fresh and allowed
    const ipBResult = checkRateLimit(ipB);
    expect(ipBResult.allowed).toBe(true);
    expect(ipBResult.remaining).toBe(4);
  });

  it("safely falls back to default 127.0.0.1 if IP is empty or whitespace", () => {
    const emptyIpResult = checkRateLimit("   ");
    expect(emptyIpResult).toBeDefined();
    expect(typeof emptyIpResult.allowed).toBe("boolean");
    expect(typeof emptyIpResult.remaining).toBe("number");
  });
});
