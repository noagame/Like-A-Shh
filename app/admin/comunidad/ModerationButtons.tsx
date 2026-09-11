"use client";

import { useTransition } from "react";
import { m } from "framer-motion";
import { deleteCommunityPost, moderateCommunityPost } from "./actions";

export default function ModerationButtons({ id }: { id: string }) { const [pending, startTransition] = useTransition(); const submit = (status: string) => { const form = new FormData(); form.set("id", id); form.set("status", status); startTransition(async () => { await moderateCommunityPost(form); }); };
  return <div className="flex flex-wrap gap-2">{["approved", "rejected", "hidden", "flagged"].map((status) => <m.button key={status} whileTap={{ scale: 0.98 }} disabled={pending} onClick={() => submit(status)} className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-white/75 hover:bg-white/10 disabled:opacity-50">{status === "approved" ? "Aprobar" : status === "rejected" ? "Rechazar" : status === "hidden" ? "Ocultar" : "Marcar"}</m.button>)}<m.button whileTap={{ scale: 0.98 }} disabled={pending} onClick={() => { if (!confirm("¿Eliminar publicación y comentarios?")) return; const form = new FormData(); form.set("id", id); startTransition(async () => { await deleteCommunityPost(form); }); }} className="rounded-lg border border-red-500/30 px-2.5 py-1.5 text-[11px] font-semibold text-red-300">Eliminar</m.button></div>; }
