// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ client: vi.fn(), revalidate: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.client }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));

import { setBlogReaction } from "@/app/blog/actions";
import { loadBlogReactions } from "@/lib/blog-reactions";

const postId = "10000000-0000-4000-8000-000000000001";
const userId = "20000000-0000-4000-8000-000000000002";
type ErrorResult = { message: string } | null;

function database(role: string | null = "user") {
  const result = {
    profile: { data: role ? { role } : null, error: null as ErrorResult },
    post: { data: { id: postId, slug: "mi-articulo" } as { id: string; slug: string } | null, error: null as ErrorResult },
    mutation: { error: null as ErrorResult },
    summary: { data: [{ post_id: postId, likes_count: "7" }], error: null as ErrorResult },
    own: { data: [{ post_id: postId }], error: null as ErrorResult },
  };
  const profiles = {
    select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(async () => result.profile),
  };
  const posts = {
    select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(async () => result.post),
  };
  const reactions = {
    select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
    in: vi.fn(async () => result.own),
    upsert: vi.fn(async () => result.mutation), delete: vi.fn().mockReturnThis(),
    then: (resolve: (value: typeof result.mutation) => unknown) => Promise.resolve(result.mutation).then(resolve),
  };
  const client = {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } }, error: null }) },
    from: vi.fn((table: string) => table === "profiles" ? profiles : table === "blog_posts" ? posts : reactions),
    rpc: vi.fn(async () => result.summary),
  };
  mocks.client.mockResolvedValue(client);
  return { client, profiles, posts, reactions, result };
}

beforeEach(() => vi.clearAllMocks());

describe("published blog reactions", () => {
  it.each(["invalid", "", "10000000-0000-4000-8000-00000000000Z"])("rejects invalid post id %j without contacting the backend", async id => {
    expect(await setBlogReaction(id, true)).toHaveProperty("error");
    expect(mocks.client).not.toHaveBeenCalled();
  });

  it("rejects an invalid desired state", async () => {
    expect(await setBlogReaction(postId, "true" as unknown as boolean)).toHaveProperty("error");
    expect(mocks.client).not.toHaveBeenCalled();
  });

  it("denies anonymous visitors before any table access", async () => {
    const { client, reactions } = database();
    client.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect(await setBlogReaction(postId, true)).toHaveProperty("error");
    expect(client.from).not.toHaveBeenCalled();
    expect(reactions.upsert).not.toHaveBeenCalled();
  });

  it.each(["admin", "instructor", null])("denies role %s before accessing an article or mutation", async role => {
    const { client, reactions } = database(role);
    expect(await setBlogReaction(postId, true)).toHaveProperty("error");
    expect(client.from).not.toHaveBeenCalledWith("blog_posts");
    expect(reactions.upsert).not.toHaveBeenCalled();
    expect(reactions.delete).not.toHaveBeenCalled();
  });

  it("fails closed when looking up the student role fails", async () => {
    const { result, reactions } = database();
    result.profile.error = { message: "offline" };
    expect(await setBlogReaction(postId, true)).toHaveProperty("error");
    expect(reactions.upsert).not.toHaveBeenCalled();
  });

  it.each([true, false])("rejects reactions with desired state %s on unavailable or unpublished articles", async liked => {
    const { result, reactions, posts } = database();
    result.post.data = null;
    expect(await setBlogReaction(postId, liked)).toHaveProperty("error");
    expect(posts.eq).toHaveBeenCalledWith("status", "published");
    expect(reactions.upsert).not.toHaveBeenCalled();
    expect(reactions.delete).not.toHaveBeenCalled();
  });

  it("stores the student's identity from the session and treats repeated likes idempotently", async () => {
    const { reactions, posts } = database();
    expect(await setBlogReaction(postId, true)).toEqual({ success: true, liked: true, likesCount: 7 });
    expect(reactions.upsert).toHaveBeenCalledWith(
      { post_id: postId, user_id: userId },
      { onConflict: "post_id,user_id", ignoreDuplicates: true },
    );
    expect(posts.eq).toHaveBeenCalledWith("id", postId);
    expect(mocks.revalidate).toHaveBeenCalledWith("/blog");
    expect(mocks.revalidate).toHaveBeenCalledWith("/blog/mi-articulo");
  });

  it("removes only the current student's reaction on the chosen article", async () => {
    const { reactions } = database();
    expect(await setBlogReaction(postId, false)).toEqual({ success: true, liked: false, likesCount: 7 });
    expect(reactions.delete).toHaveBeenCalledOnce();
    expect(reactions.eq).toHaveBeenCalledWith("post_id", postId);
    expect(reactions.eq).toHaveBeenCalledWith("user_id", userId);
    expect(reactions.upsert).not.toHaveBeenCalled();
  });

  it("reports database failures without indicating a successful reaction", async () => {
    const { result } = database();
    result.mutation.error = { message: "policy denied" };
    expect(await setBlogReaction(postId, true)).toHaveProperty("error");
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });

  it("still confirms a persisted reaction if refreshing the total fails", async () => {
    const { result } = database();
    result.summary.error = { message: "count unavailable" };
    expect(await setBlogReaction(postId, true)).toEqual({ success: true, liked: true });
  });
});

describe("public totals and private reaction state", () => {
  it("loads public counts for anonymous readers without reading reaction identities", async () => {
    const { client } = database();
    client.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const state = await loadBlogReactions([postId]);
    expect(state).toMatchObject({ loggedIn: false, canReact: false, available: true });
    expect(state.reactions[postId]).toEqual({ count: 7, liked: false });
    expect(client.from).not.toHaveBeenCalled();
  });

  it("loads only the student's own reaction with the aggregate count", async () => {
    const { reactions } = database();
    const state = await loadBlogReactions([postId]);
    expect(state).toMatchObject({ loggedIn: true, canReact: true, available: true });
    expect(state.reactions[postId]).toEqual({ count: 7, liked: true });
    expect(reactions.select).toHaveBeenCalledWith("post_id");
    expect(reactions.eq).toHaveBeenCalledWith("user_id", userId);
    expect(reactions.in).toHaveBeenCalledWith("post_id", [postId]);
  });

  it("lets administrators read the totals while keeping reactions disabled", async () => {
    const { client } = database("admin");
    expect(await loadBlogReactions([postId])).toMatchObject({ loggedIn: true, canReact: false, available: true });
    expect(client.from).not.toHaveBeenCalledWith("blog_post_reactions");
  });

  it("disables reactions safely while the approved migration is not applied", async () => {
    const { result, client } = database();
    result.summary.error = { message: "RPC not found" };
    expect(await loadBlogReactions([postId])).toMatchObject({ canReact: true, available: false });
    expect(client.from).not.toHaveBeenCalledWith("blog_post_reactions");
  });

  it("does not risk overwriting an existing like if its state cannot be read", async () => {
    const { result } = database();
    result.own.error = { message: "cannot read own reaction" };
    expect(await loadBlogReactions([postId])).toMatchObject({ available: false });
  });

  it("avoids backend calls for an empty blog", async () => {
    expect(await loadBlogReactions([])).toMatchObject({ available: false, reactions: {} });
    expect(mocks.client).not.toHaveBeenCalled();
  });
});
