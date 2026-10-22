// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ client: vi.fn(), revalidate: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.client }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));

import { createAdminCommunityPost } from "./actions";

const adminId = "10000000-0000-4000-8000-000000000001";
const postId = "20000000-0000-4000-8000-000000000002";

function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  Object.entries({ title: "Pregunta de la semana", body: "Comparte lo que aprendiste durante las clases.", ...overrides })
    .forEach(([key, value]) => data.set(key, value));
  return data;
}

function database(role: string | null = "admin") {
  const profiles = {
    select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: role ? { role } : null, error: null }),
  };
  const created = {
    insert: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: postId }, error: null }),
  };
  const published = {
    update: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: postId }, error: null }),
  };
  const audit = { insert: vi.fn().mockResolvedValue({ error: null }) };
  let postQuery = 0;
  const client = {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: adminId } }, error: null }) },
    from: vi.fn((table: string) => {
      if (table === "profiles") return profiles;
      if (table === "audit_log") return audit;
      return postQuery++ === 0 ? created : published;
    }),
  };
  mocks.client.mockResolvedValue(client);
  return { client, profiles, created, published, audit };
}

beforeEach(() => vi.clearAllMocks());

describe("admin community authoring", () => {
  it("creates under the existing pending-only insert policy, then approves only that administrator's new post", async () => {
    const { created, published, audit } = database();
    const before = Date.now();

    expect(await createAdminCommunityPost(form({ title: "  Tema de la semana  ", body: "  Comparte tu experiencia en las clases.  " })))
      .toEqual({ success: true });

    expect(created.insert).toHaveBeenCalledWith({ user_id: adminId, title: "Tema de la semana", body: "Comparte tu experiencia en las clases.", status: "pending" });
    expect(published.update).toHaveBeenCalledWith({ status: "approved", moderated_by: adminId, moderated_at: expect.any(String) });
    expect(new Date(published.update.mock.calls[0][0].moderated_at).getTime()).toBeGreaterThanOrEqual(before);
    expect(published.eq.mock.calls).toEqual([["id", postId], ["user_id", adminId], ["status", "pending"]]);
    expect(published.update.mock.invocationCallOrder[0]).toBeGreaterThan(created.single.mock.invocationCallOrder[0]);
    expect(audit.insert).toHaveBeenCalledWith({ actor_id: adminId, action: "create_community_post", metadata: { community_post_id: postId, status: "approved" } });
    expect(mocks.revalidate.mock.calls).toEqual([["/mi-cuenta/comunidad"], ["/admin/comunidad"]]);
  });

  it.each<Record<string, string>>([
    { title: "    " }, { title: "corto".slice(0, 4) }, { title: "x".repeat(141) },
    { body: "         " }, { body: "x".repeat(9) }, { body: "x".repeat(5001) },
  ])("rejects invalid lengths before any conversation write: %j", async invalid => {
    const { created, published, audit } = database();
    expect(await createAdminCommunityPost(form(invalid))).toHaveProperty("error");
    expect(created.insert).not.toHaveBeenCalled();
    expect(published.update).not.toHaveBeenCalled();
    expect(audit.insert).not.toHaveBeenCalled();
  });

  it.each(["title", "body"])("rejects a missing or file-valued %s", async field => {
    const { created } = database();
    const missing = form(); missing.delete(field);
    expect(await createAdminCommunityPost(missing)).toHaveProperty("error");
    const withFile = form(); withFile.set(field, new File(["text file"], "body.txt"));
    expect(await createAdminCommunityPost(withFile)).toHaveProperty("error");
    expect(created.insert).not.toHaveBeenCalled();
  });

  it.each([[5, 10], [140, 5000]])("accepts the title and body length boundaries %i / %i", async (titleLength, bodyLength) => {
    database();
    expect(await createAdminCommunityPost(form({ title: "x".repeat(titleLength), body: "x".repeat(bodyLength) }))).toEqual({ success: true });
  });

  it.each(["user", null])("rejects a non-admin role %s before creating or approving", async role => {
    const { created, published } = database(role);
    await expect(createAdminCommunityPost(form())).rejects.toThrow("No autorizado.");
    expect(created.insert).not.toHaveBeenCalled();
    expect(published.update).not.toHaveBeenCalled();
  });

  it("rejects an anonymous visitor before querying or mutating any table", async () => {
    const { client } = database();
    client.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(createAdminCommunityPost(form())).rejects.toThrow("No autorizado.");
    expect(client.from).not.toHaveBeenCalled();
  });

  it("does not approve, audit or refresh when creation fails", async () => {
    const { created, published, audit } = database();
    created.single.mockResolvedValue({ data: null, error: { message: "Database failure" } } as never);
    expect(await createAdminCommunityPost(form())).toHaveProperty("error");
    expect(published.update).not.toHaveBeenCalled();
    expect(audit.insert).not.toHaveBeenCalled();
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });

  it("reports a saved pending post as recoverable without asking the administrator to create it again", async () => {
    const { created, published, audit } = database();
    published.single.mockResolvedValue({ data: null, error: { message: "Approval failed" } } as never);
    expect(await createAdminCommunityPost(form())).toEqual({ success: true, warning: expect.stringContaining("quedó pendiente") });
    expect(created.insert).toHaveBeenCalledOnce();
    expect(audit.insert).toHaveBeenCalledWith(expect.objectContaining({ metadata: { community_post_id: postId, status: "pending" } }));
    expect(mocks.revalidate).toHaveBeenCalledWith("/admin/comunidad");
  });

  it("does not claim publication succeeded if the approval affected no row", async () => {
    const { published } = database();
    published.single.mockResolvedValue({ data: null, error: null } as never);
    expect(await createAdminCommunityPost(form())).toEqual({ success: true, warning: expect.stringContaining("quedó pendiente") });
  });

  it("keeps a published post and reports an audit failure without encouraging a duplicate", async () => {
    const { created, audit } = database();
    audit.insert.mockResolvedValue({ error: { message: "Audit failed" } } as never);
    expect(await createAdminCommunityPost(form())).toEqual({ success: true, warning: expect.stringContaining("ya está publicada") });
    expect(created.insert).toHaveBeenCalledOnce();
    expect(mocks.revalidate).toHaveBeenCalledWith("/mi-cuenta/comunidad");
  });
});
