import { describe, it, expect } from "vitest";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

describe("login flow contract", () => {
  it("accepts valid credentials payload", () => {
    const parsed = loginSchema.safeParse({
      email: "usuario@example.com",
      password: "segura123",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const parsed = loginSchema.safeParse({
      email: "correo-no-valido",
      password: "segura123",
    });

    expect(parsed.success).toBe(false);
  });
});
