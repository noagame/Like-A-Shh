import { describe, it, expect } from "vitest";
import { slugify } from "../../lib/slugify";

describe("slugify", () => {
  it("should convert accented text into a URL-safe slug", () => {
    expect(slugify("Curso de Pole Dance en Chile")).toBe("curso-de-pole-dance-en-chile");
  });

  it("should trim invalid characters and collapse separators", () => {
    expect(slugify("   Festival!!! 2026   ")).toBe("festival-2026");
  });
});
