import { describe, it, expect } from "vitest";

describe("environment configuration", () => {
  it("should expose a node environment for runtime checks", () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });

  it("should allow an app URL fallback to be computed safely", () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    expect(siteUrl).toMatch(/^(https?:\/\/|http:\/\/)/);
  });
});
