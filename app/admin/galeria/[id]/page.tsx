import { createClient } from "@/lib/supabase/server";
import { updateGallery, deleteMedia } from "@/app/admin/medios/action";
import { notFound } from "next/navigation";
import GalleryDropZone from "./GalleryDropZone";
import Link from "next/link";

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: gallery } = await supabase
    .from("galleries")
    .select("id, name, description")
    .eq("id", id)
    .single();

  if (!gallery) notFound();

  const { data: media } = await supabase
    .from("media")
    .select("id, url, alt_text, storage_path")
    .eq("gallery_id", id)
    .order("created_at", { ascending: false });

  const updateGalleryWithId = updateGallery.bind(null, id);

  return (
    <div>
      <Link href="/admin/galeria" className="text-sm text-white/50 hover:text-gold">
        ← Todas las galerías
      </Link>

      {/* Editar nombre/descripción */}
      <form action={updateGalleryWithId as any} className="my-6 space-y-3 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            name="name"
            type="text"
            defaultValue={gallery.name}
            required
            className="w-full p-2 border rounded bg-black/20 border-white/20 text-xl font-bold"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            name="description"
            defaultValue={gallery.description ?? ""}
            rows={2}
            className="w-full p-2 border rounded bg-black/20 border-white/20 text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-white/10 px-4 py-1.5 rounded hover:bg-white/20 transition-colors text-sm"
        >
          Guardar cambios
        </button>
      </form>

      {/* Drag & drop */}
      <GalleryDropZone galleryId={id} />

      {/* Grid de imágenes de esta galería */}
      {!media || media.length === 0 ? (
        <p className="text-white/50">Esta galería todavía no tiene imágenes.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {media.map((item) => (
            <div key={item.id} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element -- viene de nuestro endpoint propio de streaming */}
              <img
                src={item.url}
                alt={item.alt_text ?? ""}
                className="w-full aspect-square object-cover rounded-lg border border-white/10"
              />
              <form
                action={deleteMedia as any}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <input type="hidden" name="media_id" value={item.id} />
                <input type="hidden" name="mongo_file_id" value={item.storage_path} />
                <input type="hidden" name="gallery_id" value={id} />
                <button type="submit" className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                  Eliminar
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}