import { describe, it, expect } from "vitest";
import { validateEventDateRange } from "./event-date-validation";

describe("validateEventDateRange", () => {
  it("rejects a start date in the past", () => {
    const now = new Date("2026-09-01T12:00:00Z");
    expect(() =>
      validateEventDateRange("2026-08-31T10:00", "2026-09-01T12:30", now)
    ).toThrow("La fecha de inicio no puede estar en el pasado.");
  });

  it("rejects an end date earlier than the start date", () => {
    const now = new Date("2026-09-01T10:00:00Z");
    expect(() =>
      validateEventDateRange("2026-09-01T12:00", "2026-09-01T11:30", now)
    ).toThrow("La fecha de fin debe ser posterior a la fecha de inicio.");
  });

  it("accepts a valid future range", () => {
    const now = new Date("2026-09-01T10:00:00Z");
    expect(() =>
      validateEventDateRange("2026-09-01T12:00", "2026-09-01T13:30", now)
    ).not.toThrow();
  });
});
