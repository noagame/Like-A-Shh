"use client";

import { useActionState, useState } from "react";
import { createAdminCommunityPost, type CreateCommunityPostResult } from "./actions";

export default function CommunityPostForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [result, action, pending] = useActionState<CreateCommunityPostResult | null, FormData>(
    async (_previous, data) => {
      try {
        const response = await createAdminCommunityPost(data);
        if ("success" in response) {
          setTitle("");
          setBody("");
        }
        return response;
      } catch {
        return { error: "No se pudo confirmar la publicación. Revisa la lista antes de reintentar." };
      }
    },
    null,
  );

  return (
    <form action={action} aria-labelledby="new-community-post" className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-6">
      <h2 id="new-community-post" className="text-lg font-bold text-white">Nueva conversación</h2>
      <p className="mt-1 text-sm text-white/60">
        Inicia una pregunta, comparte una experiencia o propone un tema para los alumnos.
        Al publicar como administrador, la conversación queda aprobada y aparece en su Comunidad.
      </p>
      <div className="mt-4 space-y-3">
        <label className="block text-sm text-white/75" htmlFor="admin-community-title">
          Título
          <input id="admin-community-title" name="title" value={title} onChange={event => setTitle(event.target.value)} required minLength={5} maxLength={140} disabled={pending} aria-describedby="admin-community-title-help" className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white focus:border-[#48CAE4] focus:outline-none disabled:opacity-60" />
        </label>
        <p id="admin-community-title-help" className="text-xs text-white/45">Entre 5 y 140 caracteres.</p>
        <label className="block text-sm text-white/75" htmlFor="admin-community-body">
          Mensaje
          <textarea id="admin-community-body" name="body" value={body} onChange={event => setBody(event.target.value)} required minLength={10} maxLength={5000} rows={5} disabled={pending} aria-describedby="admin-community-body-help" className="mt-1 w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white focus:border-[#48CAE4] focus:outline-none disabled:opacity-60" />
        </label>
        <p id="admin-community-body-help" className="text-xs text-white/45">Entre 10 y 5.000 caracteres. Los comentarios de los alumnos pasan por moderación.</p>
      </div>
      <button type="submit" disabled={pending} className="mt-4 rounded-xl bg-[#48CAE4] px-4 py-2.5 text-xs font-bold text-black disabled:opacity-50">
        {pending ? "Publicando…" : "Publicar conversación"}
      </button>
      {result && ("error" in result ? (
        <p role="alert" className="mt-3 text-sm text-red-300">{result.error}</p>
      ) : (
        <p role="status" className={`mt-3 text-sm ${result.warning ? "text-[#f4d57a]" : "text-[#48CAE4]"}`}>
          {result.warning ?? "Conversación publicada. Los alumnos ya pueden verla y enviar comentarios."}
        </p>
      ))}
    </form>
  );
}
