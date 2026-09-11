"use client";

import { useState, useTransition } from "react";
import { m } from "framer-motion";
import { createCommunityComment, createCommunityPost } from "./actions";

export function CommunityComposer() {
  const [pending, startTransition] = useTransition(); const [message, setMessage] = useState<string | null>(null);
  return <form action={(data) => startTransition(async () => { const result = await createCommunityPost(data); setMessage("error" in result ? result.error : "Tu publicación quedó enviada para moderación."); if (!("error" in result)) (document.getElementById("community-post-form") as HTMLFormElement | null)?.reset(); })} id="community-post-form" className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-6">
    <h2 className="text-lg font-bold text-white">Comparte con la comunidad</h2><p className="mt-1 text-xs text-white/55">Las publicaciones se revisan antes de ser visibles para todas.</p>
    <input name="title" required minLength={5} maxLength={140} placeholder="Título de tu pregunta o experiencia" className="mt-4 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#48CAE4] focus:outline-none" />
    <textarea name="body" required minLength={10} maxLength={5000} rows={4} placeholder="Escribe con respeto y evita publicar datos personales." className="mt-3 w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#48CAE4] focus:outline-none" />
    {message && <p role="status" className="mt-3 text-xs text-[#48CAE4]">{message}</p>}
    <m.button whileTap={{ scale: 0.98 }} disabled={pending} className="mt-3 rounded-xl bg-[#48CAE4] px-4 py-2.5 text-xs font-bold text-black disabled:opacity-50">{pending ? "Enviando…" : "Enviar a moderación"}</m.button>
  </form>;
}

export function CommunityCommentForm({ postId }: { postId: string }) {
  const [pending, startTransition] = useTransition(); const [message, setMessage] = useState<string | null>(null);
  return <form action={(data) => startTransition(async () => { const result = await createCommunityComment(data); setMessage("error" in result ? result.error : "Comentario enviado a moderación."); if (!("error" in result)) (data.get("body") as string); })} className="mt-4 border-t border-white/10 pt-4">
    <input type="hidden" name="post_id" value={postId} /><label className="sr-only" htmlFor={`comment-${postId}`}>Comentar</label><textarea id={`comment-${postId}`} name="body" required minLength={2} maxLength={2000} rows={2} placeholder="Escribe un comentario respetuoso" className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-[#48CAE4] focus:outline-none" />
    <div className="mt-2 flex items-center gap-3"><m.button whileTap={{ scale: 0.98 }} disabled={pending} className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 disabled:opacity-50">{pending ? "Enviando…" : "Comentar"}</m.button>{message && <span role="status" className="text-[11px] text-[#48CAE4]">{message}</span>}</div>
  </form>;
}
