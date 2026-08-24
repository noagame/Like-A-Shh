import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkLoginRateLimit } from "./rate-limit";

describe("rate-limit utilities", () => {
  let consoleWarnSpy: any;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return success: true and log a warning if Upstash is not configured", async () => {
    const result = await checkLoginRateLimit("127.0.0.1");

    expect(result).toEqual({ success: true });
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN no configurados")
    );
  });
});
