// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  client: vi.fn(),
  uploadFlyer: vi.fn(),
  rollbackFlyer: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.client }));
vi.mock("@/lib/infrastructure/factories/flyer", () => ({
  uploadFlyer: mocks.uploadFlyer,
  rollbackFlyer: mocks.rollbackFlyer,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); },
}));

import { createCourse, updateCourse } from "@/app/admin/cursos/actions";

const courseId = "10000000-0000-4000-8000-000000000001";

function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  Object.entries({
    title: "Clases Particulares Online",
    description: "Una clase personalizada de movimiento.",
    url: "https://wa.me/56971577711?text=Mi%20mensaje",
    link_label: "Consultar horarios",
    status: "published",
    ...overrides,
  }).forEach(([key, value]) => data.set(key, value));
  return data;
}

function database(role: string | null = "admin") {
  const result: { error: { message: string } | null } = { error: null };
  const courses = {
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn(async () => ({ data: result.error ? null : { id: courseId }, error: result.error })),
    then: (resolve: (value: typeof result) => unknown) => Promise.resolve(result).then(resolve),
  };
  const profiles = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: role ? { role } : null, error: null }),
  };
  const client = {
    from: vi.fn((table: string) => table === "profiles" ? profiles : courses),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: courseId } }, error: null }),
    },
  };
  mocks.client.mockResolvedValue(client);
  return { client, courses, profiles, result };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.uploadFlyer.mockResolvedValue(null);
  mocks.rollbackFlyer.mockResolvedValue(undefined);
});

describe("course links persisted by admin actions", () => {
  it("creates a course with its custom destination and trimmed label", async () => {
    const { courses } = database();

    await expect(createCourse(form({ link_label: "  Consultar horarios  " })))
      .rejects.toThrow("REDIRECT:/admin/cursos");

    expect(courses.insert).toHaveBeenCalledWith(expect.objectContaining({
      title: "Clases Particulares Online",
      url: "https://wa.me/56971577711?text=Mi%20mensaje",
      link_label: "Consultar horarios",
    }));
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/cursos");
  });

  it("updates only the selected course and persists a custom sales link", async () => {
    const { courses } = database();

    await expect(updateCourse(courseId, form({
      url: "https://hotmart.com/curso",
      link_label: "Comprar mi programa",
      status: "draft",
    }))).rejects.toThrow("REDIRECT:/admin/cursos");

    expect(courses.update).toHaveBeenCalledWith(expect.objectContaining({
      url: "https://hotmart.com/curso",
      link_label: "Comprar mi programa",
      status: "draft",
    }));
    expect(courses.eq).toHaveBeenCalledWith("id", courseId);
    expect(courses.insert).not.toHaveBeenCalled();
  });

  it.each(["", "   "])("stores an empty label %j as null so the default can be restored", async label => {
    const { courses } = database();

    await expect(updateCourse(courseId, form({ link_label: label })))
      .rejects.toThrow("REDIRECT:/admin/cursos");

    expect(courses.update).toHaveBeenCalledWith(expect.objectContaining({ link_label: null }));
  });

  it("accepts an internal destination and trims its surrounding whitespace", async () => {
    const { courses } = database();

    await expect(createCourse(form({ url: "  /cursos/movimiento  " })))
      .rejects.toThrow("REDIRECT:/admin/cursos");

    expect(courses.insert).toHaveBeenCalledWith(expect.objectContaining({ url: "/cursos/movimiento" }));
  });

  it("preserves defaults when optional label, URL and status fields are omitted", async () => {
    const { courses } = database();
    const data = form();
    data.delete("link_label");
    data.delete("url");
    data.delete("status");

    await expect(createCourse(data)).rejects.toThrow("REDIRECT:/admin/cursos");

    expect(courses.insert).toHaveBeenCalledWith(expect.objectContaining({
      url: "#", link_label: null, status: "published",
    }));
  });

  it("keeps the existing course image when no replacement is uploaded", async () => {
    const { courses } = database();

    await expect(updateCourse(courseId, form())).rejects.toThrow("REDIRECT:/admin/cursos");

    expect(courses.update.mock.calls[0][0]).not.toHaveProperty("image_url");
  });

  const invalidFields: Record<string, string>[] = [
    { title: " " },
    { description: " " },
    { url: "javascript:alert(1)" },
    { url: "data:text/html,unsafe" },
    { status: "invalid-status" },
    { link_label: "x".repeat(1001) },
  ];
  it.each(invalidFields)("rejects invalid fields before uploading or writing: %j", async invalid => {
    const { courses } = database();
    const data = form(invalid);
    data.set("flyer", new File(["replacement image"], "flyer.png", { type: "image/png" }));

    await expect(createCourse(data)).rejects.toThrow();

    expect(mocks.uploadFlyer).not.toHaveBeenCalled();
    expect(courses.insert).not.toHaveBeenCalled();
    expect(courses.update).not.toHaveBeenCalled();
  });

  it("rejects an unsafe link on edit before uploading or writing", async () => {
    const { courses } = database();

    await expect(updateCourse(courseId, form({ url: "javascript:alert(1)" }))).rejects.toThrow();

    expect(mocks.uploadFlyer).not.toHaveBeenCalled();
    expect(courses.update).not.toHaveBeenCalled();
  });

  it.each(["user", null])("denies create and update to profile role %s", async role => {
    const { courses } = database(role);

    await expect(createCourse(form())).rejects.toThrow("No autorizado");
    await expect(updateCourse(courseId, form())).rejects.toThrow("No autorizado");

    expect(mocks.uploadFlyer).not.toHaveBeenCalled();
    expect(courses.insert).not.toHaveBeenCalled();
    expect(courses.update).not.toHaveBeenCalled();
  });

  it("denies an anonymous visitor before any upload or mutation", async () => {
    const { client, courses } = database();
    client.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(createCourse(form())).rejects.toThrow("No autorizado");

    expect(mocks.uploadFlyer).not.toHaveBeenCalled();
    expect(courses.insert).not.toHaveBeenCalled();
  });

  it("rolls back a newly uploaded image when saving the course fails", async () => {
    const { client, result } = database();
    result.error = { message: "Save failed" };
    const flyer = { url: "https://example.com/new.png", path: "cursos/new.png", bucket: "galerias" };
    mocks.uploadFlyer.mockResolvedValue(flyer);

    await expect(updateCourse(courseId, form())).rejects.toThrow("REDIRECT:/admin/cursos?error=");

    expect(mocks.rollbackFlyer).toHaveBeenCalledWith(client, flyer);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
