import { createClient } from "@/lib/supabase/server";
import { createGallery, deleteGallery } from "@/app/admin/medios/actions";
import Link from "next/link";

export default async function GaleriasPage() {
  const supabase = await createClient();

  const { data: galleries } = await supabase
    .from("galleries")
    .select("id, name, description, created_at")
    .order("created_at", { ascending: false });

  // Portada + conteo de cada galería, en una sola consulta
  const { data: allMedia } = await supabase
    .from("media")
    .select("gallery_id, url")
    .not("gallery_id", "is", null);

  const coverByGallery: Record<string, string> = {};
  const countByGallery: Record<string, number> = {};
  (allMedia ?? []).forEach((m) => {
    if (!m.gallery_id) return;
    countByGallery[m.gallery_id] = (countByGallery[m.gallery_id] ?? 0) + 1;
    if (!coverByGallery[m.gallery_id]) coverByGallery[m.gallery_id] = m.url;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Galerías</h1>

      {/* Crear */}
      <form
        action={createGallery}
        className="flex flex-wrap items-end gap-3 mb-8 bg-white/5 border border-white/10 rounded-lg p-4"
      >
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Nombre de la galería</label>
          <input
            name="name"
            type="text"
            required
            placeholder="Ej. Sesión Frosted Desire"
            className="w-full p-2 border rounded bg-black/20 border-white/20"
          />
        </div>
        <button
          type="submit"
          className="bg-gold text-black font-bold px-4 py-2 rounded hover:bg-gold-light transition-colors text-sm"
        >
          + Crear galería
        </button>
      </form>

      {/* Listado */}
      {!galleries || galleries.length === 0 ? (
        <p className="text-white/50">Todavía no hay galerías creadas.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {galleries.map((g) => (
            <div key={g.id} className="group relative bg-white/5 border border-white/10 rounded-lg overflow-hidden">
              <Link href={`/admin/galerias/${g.id}`}>
                <div className="aspect-square bg-black/40 flex items-center justify-center">
                  {coverByGallery[g.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element -- viene de nuestro endpoint propio de streaming
                    <img
                      src={coverByGallery[g.id]}
                      alt={g.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white/30 text-sm">Sin imágenes</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-medium truncate">{g.name}</p>
                  <p className="text-xs text-white/40">{countByGallery[g.id] ?? 0} imágenes</p>
                </div>
              </Link>

              <form
                action={deleteGallery}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <input type="hidden" name="gallery_id" value={g.id} />
                <button
                  type="submit"
                  className="bg-red-600 text-white text-xs px-2 py-1 rounded"
                  title="Eliminar galería (las imágenes quedan sin galería, no se borran)"
                >
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