"use client";

import { useCallback, useState } from "react";
import { useFormStatus } from "react-dom";
import { m } from "framer-motion";
import { deleteBlogPost, saveBlogPost } from "./actions";

type Post = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  status: string;
};

function initialFields(post?: Post) {
  return {
    title: post?.title ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    cover_image_url: post?.cover_image_url ?? "",
    status: post?.status ?? "draft",
  };
}

export default function BlogEditor({ post }: { post?: Post }) {
  // A different article needs fresh fields, file selection and action feedback.
  return <BlogEditorForm key={post?.id ?? "new"} post={post} />;
}

function BlogEditorForm({ post }: { post?: Post }) {
  const [fields, setFields] = useState(() => initialFields(post));
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  async function handleSave(data: FormData) {
    setMessage(null);
    try {
      const result = await saveBlogPost(data);
      if ("error" in result) {
        setMessage({ text: result.error, error: true });
      } else {
        setMessage({ text: "Artículo guardado y caché actualizada.", error: false });
        if (!post) setFields(initialFields());
      }
    } catch {
      setMessage({ text: "No se pudo guardar el artículo. Inténtalo de nuevo.", error: true });
    }
  }

  const handleDelete = useCallback(async (data: FormData) => {
    if (!window.confirm("¿Eliminar este artículo?")) return;
    setMessage(null);
    try {
      const result = await deleteBlogPost(data);
      setMessage("error" in result
        ? { text: result.error, error: true }
        : { text: "Artículo eliminado.", error: false });
    } catch {
      setMessage({ text: "No se pudo eliminar el artículo. Inténtalo de nuevo.", error: true });
    }
  }, []);

  return (
    <form action={handleSave} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-6">
      <h2 className="text-lg font-bold text-white">{post ? "Editar artículo" : "Nuevo artículo"}</h2>
      <input type="hidden" name="id" value={post?.id ?? ""} />
      <div className="mt-4 grid gap-3">
        <input
          name="title"
          aria-label="Título"
          value={fields.title}
          onChange={(event) => setFields({ ...fields, title: event.target.value })}
          required minLength={5} maxLength={160} placeholder="Título"
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
        />
        <textarea
          name="excerpt"
          aria-label="Resumen para tarjetas"
          value={fields.excerpt}
          onChange={(event) => setFields({ ...fields, excerpt: event.target.value })}
          required minLength={20} maxLength={320} rows={2} placeholder="Resumen para tarjetas"
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
        />
        <label className="text-xs text-white/60">
          Portada (PNG, JPEG o WebP; máximo 5 MB)
          <input name="cover_image" type="file" accept="image/png,image/jpeg,image/webp" className="mt-1 block w-full rounded-xl border border-dashed border-white/15 bg-black/30 px-3 py-2 text-xs text-white/60" />
        </label>
        <input
          name="cover_image_url"
          aria-label="URL pública de portada"
          value={fields.cover_image_url}
          onChange={(event) => setFields({ ...fields, cover_image_url: event.target.value })}
          type="url" placeholder="O usa una URL pública de portada"
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
        />
        <textarea
          name="content"
          aria-label="Contenido del artículo"
          value={fields.content}
          onChange={(event) => setFields({ ...fields, content: event.target.value })}
          required minLength={40} maxLength={50000} rows={12} placeholder="Contenido del artículo"
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
        />
        <select
          name="status"
          aria-label="Estado"
          value={fields.status}
          onChange={(event) => setFields({ ...fields, status: event.target.value })}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
        >
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
          <option value="archived">Archivado</option>
        </select>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <EditorButtons canDelete={Boolean(post)} deleteAction={handleDelete} />
        {message && <p role={message.error ? "alert" : "status"} className={`text-xs ${message.error ? "text-red-300" : "text-[#48CAE4]"}`}>{message.text}</p>}
      </div>
    </form>
  );
}

function EditorButtons({ canDelete, deleteAction }: { canDelete: boolean; deleteAction: (data: FormData) => Promise<void> }) {
  const { pending, action } = useFormStatus();
  const deleting = pending && action === deleteAction;

  return (
    <>
      <m.button type="submit" whileTap={{ scale: 0.98 }} disabled={pending} className="rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-bold text-black disabled:opacity-50">
        {pending && !deleting ? "Guardando…" : "Guardar artículo"}
      </m.button>
      {canDelete && (
        <m.button type="submit" formAction={deleteAction} formNoValidate disabled={pending} whileTap={{ scale: 0.98 }} className="rounded-xl border border-red-400/30 px-4 py-2.5 text-xs font-bold text-red-300 disabled:opacity-50">
          {deleting ? "Eliminando…" : "Eliminar"}
        </m.button>
      )}
    </>
  );
}
