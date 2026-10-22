import { createClient } from "@/lib/supabase/server";
import { pageMetadata } from "@/lib/seo/page-metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cache } from "react";
import { loadBlogReactions } from "@/lib/blog-reactions";
import BlogReactionButton from "../BlogReactionButton";

type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  published_at: string;
};

type BlogPostProps = { params: Promise<{ slug: string }> };

const getPublishedPost = cache(async (slug: string): Promise<BlogPost | null> => {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("id,title,excerpt,content,cover_image_url,published_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return post as BlogPost | null;
});

export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { robots: { index: false, follow: false } };
  return pageMetadata(post.title, post.excerpt, `/blog/${slug}`, "article");
}

export default async function BlogPostPage({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();
  const reactionState = await loadBlogReactions([post.id]);
  const reaction = reactionState.reactions[post.id];

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-10 text-white sm:px-6 sm:py-12">
      <article className="mx-auto max-w-3xl">
        <Link href="/blog" className="text-sm text-[#48CAE4] hover:underline">← Volver al blog</Link>
        <time className="mt-8 block text-xs uppercase tracking-[0.18em] text-[#D4AF37]">
          {new Date(post.published_at).toLocaleDateString("es-CL", { dateStyle: "long" })}
        </time>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl" style={{ fontFamily: "var(--font-serif)" }}>{post.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-white/65">{post.excerpt}</p>
        {post.cover_image_url && (
          <Image
            src={post.cover_image_url}
            alt=""
            width={1200}
            height={800}
            className="mt-8 max-h-[480px] w-full rounded-2xl object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        )}
        <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-white/80">{post.content}</div>
        <div className="mt-10 border-t border-white/10 pt-6">
          <BlogReactionButton
            key={`${post.id}:${reaction.liked}:${reaction.count}`}
            postId={post.id}
            initialLiked={reaction.liked}
            initialCount={reaction.count}
            loggedIn={reactionState.loggedIn}
            canReact={reactionState.canReact}
            available={reactionState.available}
          />
        </div>
      </article>
    </main>
  );
}
