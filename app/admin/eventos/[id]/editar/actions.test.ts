// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ authorize: vi.fn(), cleanup: vi.fn(), revalidate: vi.fn() }));
vi.mock("@/lib/auth/authorize", () => ({ requireAdmin: mocks.authorize }));
vi.mock("@/lib/event-image", () => ({ removeUnusedEventFlyer: mocks.cleanup }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } }));

import { updateEvent } from "./actions";

const id = "event-id";
const oldImage = "https://project.supabase.co/storage/v1/object/public/eventos/flyers/old.png";
const current = {
  id, image_url: oldImage, purchase_url: null, categories: { name: "Evento" },
  start_time: "2020-01-01T10:00:27+00:00", end_time: "2020-01-01T12:00:27+00:00",
};

function form() {
  const data = new FormData();
  Object.entries({ title: "Evento", start_time: "2020-01-01T10:00", end_time: "2020-01-01T12:00", status: "published", location: "Santiago" })
    .forEach(([key, value]) => data.set(key, value));
  return data;
}

function png() {
  return new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], "new.png", { type: "image/png" });
}

function database(imageUrl: string | null = oldImage) {
  const read = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: { ...current, image_url: imageUrl }, error: null }) };
  const update = {
    update: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), is: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: { id }, error: null }),
  };
  const storage = {
    upload: vi.fn().mockResolvedValue({ error: null }), remove: vi.fn().mockResolvedValue({ error: null }),
    getPublicUrl: vi.fn((path: string) => ({ data: { publicUrl: `https://project.supabase.co/storage/v1/object/public/eventos/${path}` } })),
  };
  const client = { from: vi.fn().mockReturnValueOnce(read).mockReturnValue(update), storage: { from: vi.fn(() => storage) } };
  mocks.authorize.mockResolvedValue({ supabase: client });
  return { client, update, storage };
}

beforeEach(() => { vi.clearAllMocks(); mocks.cleanup.mockResolvedValue(undefined); });

describe("event image editing", () => {
  it("keeps the existing image and exact past timestamps when the image is unchanged", async () => {
    const { update, storage } = database();
    await expect(updateEvent(id, form())).rejects.toThrow(/^REDIRECT:\/admin\/eventos$/);
    const changes = update.update.mock.calls[0][0];
    expect(changes).not.toHaveProperty("image_url");
    expect(changes).toMatchObject({ start_time: current.start_time, end_time: current.end_time });
    expect(storage.upload).not.toHaveBeenCalled();
    expect(mocks.cleanup).not.toHaveBeenCalled();
    expect(mocks.revalidate).toHaveBeenCalledWith("/");
  });

  it("adds a validated image to an event without one", async () => {
    const { update, storage } = database(null);
    const data = form(); data.set("flyer", png());
    await expect(updateEvent(id, data)).rejects.toThrow(/^REDIRECT:\/admin\/eventos$/);
    expect(storage.upload).toHaveBeenCalledOnce();
    expect(update.update.mock.calls[0][0].image_url).toMatch(/\/flyers\/.+\.png$/);
    expect(update.is).toHaveBeenCalledWith("image_url", null);
    expect(mocks.cleanup).not.toHaveBeenCalled();
  });

  it("replaces an image, then cleans up the old image after persistence", async () => {
    const { update, storage } = database();
    const data = form(); data.set("flyer", png());
    await expect(updateEvent(id, data)).rejects.toThrow(/^REDIRECT:\/admin\/eventos$/);
    expect(update.eq).toHaveBeenCalledWith("image_url", oldImage);
    expect(mocks.cleanup).toHaveBeenCalledWith(expect.anything(), oldImage);
    expect(mocks.cleanup.mock.invocationCallOrder[0]).toBeGreaterThan(update.single.mock.invocationCallOrder[0]);
    expect(storage.remove).not.toHaveBeenCalled();
  });

  it("removes the image without deleting the event", async () => {
    const { update } = database();
    const data = form(); data.set("remove_flyer", "on"); data.set("image_url", "https://other.example/untrusted.png");
    await expect(updateEvent(id, data)).rejects.toThrow(/^REDIRECT:\/admin\/eventos$/);
    expect(update.update).toHaveBeenCalledWith(expect.objectContaining({ image_url: null }));
    expect(mocks.cleanup).toHaveBeenCalledWith(expect.anything(), oldImage);
  });

  it("rolls back the newly uploaded file when saving or concurrent-image validation fails", async () => {
    const { update, storage } = database();
    update.single.mockResolvedValue({ data: null, error: { message: "conflict" } } as never);
    const data = form(); data.set("flyer", png());
    await expect(updateEvent(id, data)).rejects.toThrow(/REDIRECT:.*\?error=/);
    expect(storage.remove).toHaveBeenCalledWith([storage.upload.mock.calls[0][0]]);
    expect(mocks.cleanup).not.toHaveBeenCalled();
  });

  it("keeps the saved change and reports cleanup failure without rolling back the new image", async () => {
    const { update, storage } = database();
    mocks.cleanup.mockRejectedValueOnce(new Error("Storage unavailable"));
    const data = form(); data.set("flyer", png());
    await expect(updateEvent(id, data)).rejects.toThrow(/REDIRECT:.*\?warning=/);
    expect(update.update).toHaveBeenCalledOnce();
    expect(storage.remove).not.toHaveBeenCalled();
    expect(mocks.revalidate).toHaveBeenCalledWith("/");
  });

  it("rejects a forged image before uploading or changing the event", async () => {
    const { update, storage } = database();
    const data = form(); data.set("flyer", new File(["not png"], "bad.png", { type: "image/png" }));
    await expect(updateEvent(id, data)).rejects.toThrow(/REDIRECT:.*\?error=/);
    expect(storage.upload).not.toHaveBeenCalled();
    expect(update.update).not.toHaveBeenCalled();
  });

  it("rejects simultaneous replacement and removal", async () => {
    const { update, storage } = database();
    const data = form(); data.set("flyer", png()); data.set("remove_flyer", "on");
    await expect(updateEvent(id, data)).rejects.toThrow(/REDIRECT:.*\?error=/);
    expect(storage.upload).not.toHaveBeenCalled();
    expect(update.update).not.toHaveBeenCalled();
  });

  it("still rejects changed dates in the past", async () => {
    const { update } = database();
    const data = form(); data.set("start_time", "2020-01-02T10:00");
    await expect(updateEvent(id, data)).rejects.toThrow(/REDIRECT:.*\?error=/);
    expect(update.update).not.toHaveBeenCalled();
  });

  it("denies unauthorized image changes before reading or uploading", async () => {
    const { client, storage } = database();
    mocks.authorize.mockRejectedValueOnce(new Error("No autorizado."));
    const data = form(); data.set("flyer", png());
    await expect(updateEvent(id, data)).rejects.toThrow("No autorizado");
    expect(client.from).not.toHaveBeenCalled();
    expect(storage.upload).not.toHaveBeenCalled();
  });
});
