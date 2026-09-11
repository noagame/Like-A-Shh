import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const supabase = await createClient();
  const { data: post } = await supabase.from("blog_posts").select("title,excerpt,content,cover_image_url,published_at").eq("slug", slug).eq("status", "published").maybeSingle();
  if (!post) notFound();
  return <main className="min-h-screen bg-[#09090b] px-4 py-24 text-white sm:px-6"><article className="mx-auto max-w-3xl"><Link href="/blog" className="text-sm text-[#48CAE4] hover:underline">← Volver al blog</Link><time className="mt-8 block text-xs uppercase tracking-[0.18em] text-[#D4AF37]">{new Date(post.published_at).toLocaleDateString("es-CL", { dateStyle: "long" })}</time><h1 className="mt-3 text-4xl font-bold sm:text-5xl" style={{ fontFamily: "var(--font-serif)" }}>{post.title}</h1><p className="mt-4 text-lg leading-relaxed text-white/65">{post.excerpt}</p>{post.cover_image_url && <Image src={post.cover_image_url} alt="" width={1200} height={800} className="mt-8 max-h-[480px] w-full rounded-2xl object-cover" sizes="(max-width: 768px) 100vw, 768px" />}<div className="mt-8 whitespace-pre-wrap text-base leading-8 text-white/80">{post.content}</div></article></main>;
}
