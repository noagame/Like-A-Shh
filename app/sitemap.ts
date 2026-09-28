import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { SITE_ORIGIN } from "@/lib/seo/site-origin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_ORIGIN}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_ORIGIN}/privacidad`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_ORIGIN}/terminos`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("slug,published_at,updated_at")
    .eq("status", "published");

  if (error || !posts?.length) return entries;

  const latestUpdate = posts.reduce((latest, post) => {
    const updated = post.updated_at ?? post.published_at;
    return Date.parse(updated) > Date.parse(latest) ? updated : latest;
  }, posts[0].updated_at ?? posts[0].published_at);

  entries.push({
    url: `${SITE_ORIGIN}/blog`,
    lastModified: latestUpdate,
    changeFrequency: "monthly",
    priority: 0.5,
  });

  for (const post of posts) {
    entries.push({
      url: `${SITE_ORIGIN}/blog/${post.slug}`,
      lastModified: post.updated_at ?? post.published_at,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return entries;
}
