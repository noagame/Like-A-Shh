import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("rate-limit utilities", () => {
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("should block access in production when Upstash is not configured", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const { checkLoginRateLimit } = await import("./rate-limit");
    const result = await checkLoginRateLimit("127.0.0.1");

    expect(result).toEqual({ success: false, retryAfter: 60 });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("[rate-limit] Upstash no configurado en producción")
    );
  });

  it("should allow access in development when Upstash is not configured", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const { checkLoginRateLimit } = await import("./rate-limit");
    const result = await checkLoginRateLimit("127.0.0.1");

    expect(result).toEqual({ success: true });
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[rate-limit] Upstash no configurado en desarrollo")
    );
  });
});
