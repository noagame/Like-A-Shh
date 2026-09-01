import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

describe("middleware security", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it("redirects unauthenticated users away from protected routes", async () => {
    const { middleware } = await import("../../middleware");
    const request = new NextRequest(new Request("http://localhost:3000/mi-cuenta"));

    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });
});
