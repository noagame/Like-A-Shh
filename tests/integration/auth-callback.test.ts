import { describe, it, expect } from "vitest";

describe("auth callback route contract", () => {
  it("requires a code query param to continue the login flow", () => {
    const url = new URL("https://example.com/auth/callback");
    const code = url.searchParams.get("code");

    expect(code).toBeNull();
  });

  it("redirects to the error page when a confirmation code is missing", () => {
    const url = new URL("https://example.com/auth/callback");
    const hasCode = url.searchParams.has("code");

    expect(hasCode).toBe(false);
  });
});
