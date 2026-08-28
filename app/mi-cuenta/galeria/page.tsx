import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import HeartButton from "./HeartButton";
import Link from "next/link";

export default async function AlumnaGaleriaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Obtener todas las galerías
  const { data: galleries } = await supabase
    .from("galleries")
    .select("id, name, description")
    .order("created_at", { ascending: false });

  // 2. Obtener todas las fotos con sus conteos de likes
  const { data: allMedia } = await supabase
    .from("media")
    .select("id, url, alt_text, gallery_id, media_likes(user_id)")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
      {/* Encabezado */}
      <div className="border-b border-white/10 pb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gold" style={{ fontFamily: "var(--font-serif)" }}>
            Galerías Exclusivas
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Revive los mejores momentos de nuestras clases, galas y workshops.
          </p>
        </div>
      </div>

      {/* Listado por Galerías */}
      {(galleries ?? []).map((gallery) => {
        const fotosDeGaleria = (allMedia ?? []).filter((m) => m.gallery_id === gallery.id);
        if (fotosDeGaleria.length === 0) return null;

        return (
          <div key={gallery.id} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide" style={{ fontFamily: "var(--font-serif)" }}>
                {gallery.name}
              </h2>
              {gallery.description && (
                <p className="text-xs text-white/60 mt-1">{gallery.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {fotosDeGaleria.map((foto) => {
                const totalLikes = foto.media_likes?.length || 0;
                const hasLiked = Boolean(
                  user && foto.media_likes?.some((l: any) => l.user_id === user.id)
                );

                return (
                  <div
                    key={foto.id}
                    className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-xl"
                  >
                    <Image
                      src={foto.url}
                      alt={foto.alt_text || gallery.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Overlay inferior con botón de like */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 p-4 flex items-end justify-between">
                      <span className="text-[11px] text-white/70 truncate max-w-[65%]">
                        {foto.alt_text || gallery.name}
                      </span>
                      <HeartButton
                        mediaId={foto.id}
                        initialLiked={hasLiked}
                        initialCount={totalLikes}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}