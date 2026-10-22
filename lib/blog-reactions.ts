import { createClient } from "@/lib/supabase/server";

export type BlogReaction = { liked: boolean; count: number };
export type BlogReactionState = {
  loggedIn: boolean;
  canReact: boolean;
  available: boolean;
  reactions: Record<string, BlogReaction>;
};

export async function loadBlogReactions(postIds: string[]): Promise<BlogReactionState> {
  const state: BlogReactionState = {
    loggedIn: false,
    canReact: false,
    available: false,
    reactions: Object.fromEntries(postIds.map((id) => [id, { liked: false, count: 0 }])),
  };
  if (!postIds.length) return state;

  const supabase = await createClient();
  const [summary, session] = await Promise.all([
    supabase.rpc("get_blog_reaction_counts", { post_ids: postIds }),
    supabase.auth.getUser(),
  ]);
  const user = session.error ? null : session.data.user;
  state.loggedIn = Boolean(user);
  if (!summary.error) {
    state.available = true;
    for (const row of (summary.data ?? []) as Array<{ post_id: string; likes_count: number | string }>) {
      if (state.reactions[row.post_id]) state.reactions[row.post_id].count = Number(row.likes_count);
    }
  }
  if (!user) return state;

  const { data: profile, error: profileError } = await supabase
    .from("profiles").select("role").eq("id", user.id).maybeSingle();
  state.canReact = !profileError && profile?.role === "user";
  if (!state.available || !state.canReact) return state;

  const { data: ownReactions, error: reactionsError } = await supabase
    .from("blog_post_reactions").select("post_id").eq("user_id", user.id).in("post_id", postIds);
  if (reactionsError) {
    state.available = false;
    return state;
  }
  for (const row of ownReactions ?? []) {
    if (state.reactions[row.post_id]) state.reactions[row.post_id].liked = true;
  }
  return state;
}
