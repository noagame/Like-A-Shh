// @vitest-environment node
import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { getEventFlyerPath, removeUnusedEventFlyer } from "./event-image";

const base = "https://project.supabase.co/storage/v1/object/public/eventos/";

function database({ shared = false, readError = false, deleteError = false } = {}) {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: shared ? [{ id: "another-event" }] : [], error: readError ? { message: "offline" } : null }),
  };
  const storage = {
    getPublicUrl: vi.fn((path: string) => ({ data: { publicUrl: base + path } })),
    remove: vi.fn().mockResolvedValue({ error: deleteError ? { message: "denied" } : null }),
  };
  const client = { storage: { from: vi.fn(() => storage) }, from: vi.fn(() => query) };
  return { supabase: client as unknown as SupabaseClient, client, storage };
}

describe("event flyer cleanup", () => {
  it("resolves only a filename in the current project's flyer folder", () => {
    const { supabase } = database();
    expect(getEventFlyerPath(supabase, base + "flyers/old-flyer.png")).toBe("flyers/old-flyer.png");
  });

  it.each([
    "https://other.supabase.co/storage/v1/object/public/eventos/flyers/a.png",
    base.replace("eventos/", "galerias/") + "flyers/a.png",
    base + "flyers/nested/a.png",
    base + "flyers/%2e%2e%2fa.png",
    base + "flyers/a.png?download=1",
    "invalid-url",
  ])("does not delete an unowned or ambiguous URL: %s", async (url) => {
    const { supabase, client, storage } = database();
    await removeUnusedEventFlyer(supabase, url);
    expect(storage.remove).not.toHaveBeenCalled();
    expect(client.from).not.toHaveBeenCalled();
  });

  it("removes a detached flyer by its validated stored path", async () => {
    const { supabase, storage } = database();
    await removeUnusedEventFlyer(supabase, base + "flyers/old.png");
    expect(storage.remove).toHaveBeenCalledWith(["flyers/old.png"]);
  });

  it("keeps a flyer referenced by another event", async () => {
    const { supabase, storage } = database({ shared: true });
    await removeUnusedEventFlyer(supabase, base + "flyers/shared.png");
    expect(storage.remove).not.toHaveBeenCalled();
  });

  it("preserves the file when its references cannot be checked", async () => {
    const { supabase, storage } = database({ readError: true });
    await expect(removeUnusedEventFlyer(supabase, base + "flyers/old.png")).rejects.toThrow("comprobar");
    expect(storage.remove).not.toHaveBeenCalled();
  });

  it("reports denied storage cleanup", async () => {
    const { supabase } = database({ deleteError: true });
    await expect(removeUnusedEventFlyer(supabase, base + "flyers/old.png")).rejects.toThrow("Storage");
  });
});
