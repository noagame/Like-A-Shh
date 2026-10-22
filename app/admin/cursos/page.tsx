import { requireAdmin } from "@/lib/auth/authorize";
import BackButton from "@/app/admin/components/BackButton";
import PanelInfo from "@/app/admin/components/PanelInfo";
import Image from "next/image";
import { deleteCourse } from "./actions";
import CourseModal from "./Course.Modal";
import { resolveCourseLink } from "@/lib/course-links";

export default async function AdminCursosPage({ searchParams }: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { error: searchError } = searchParams ? await searchParams : {};

  const { data: courses, error: fetchError } = await supabase
    .from("courses")
    .select("*")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <BackButton />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide" style={{ fontFamily: "var(--font-serif)" }}>
            Gestión de Cursos y Clases Particulares
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Administra los programas formativos visibles en la página principal.
          </p>
        </div>
        <CourseModal />
      </div>

      <PanelInfo
        title="Cursos y Clases Particulares"
        description="Edita cada curso para personalizar la URL y el texto del enlace. Las clases online y presenciales muestran Enlace a WhatsApp de forma automática. Si no adjuntas una portada al crear, se utiliza la imagen predeterminada."
      />

      {(searchError || fetchError) && (
        <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          {searchError || "No se pudieron cargar los cursos. Intenta nuevamente."}
        </p>
      )}

      {/* Grid de Cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(courses ?? []).map((curso) => {
          const link = resolveCourseLink(curso);
          return (
          <div
            key={curso.id}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl group hover:border-gold/30 transition-all"
          >
            <div>
              <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-4 bg-black/40 border border-white/5">
                <Image
                  src={curso.image_url || "/assets/logo/logo_likeashh.jpg"}
                  alt={curso.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className={`absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  curso.status === "published" ? "bg-green-500/80 text-white" : "bg-white/20 text-white/70"
                }`}>
                  {curso.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gold line-clamp-1 mb-2">
                {curso.title}
              </h3>
              <p className="text-xs text-white/60 line-clamp-3 leading-relaxed mb-4">
                {curso.description}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              {link.url !== "#" ? <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-gold hover:underline truncate"
              >
                {link.label} ↗
              </a> : <span className="text-xs text-white/50">Sin enlace externo</span>}

              <div className="flex items-center justify-between gap-2">
              <CourseModal course={curso} />
              <form action={deleteCourse}>
                <input type="hidden" name="id" value={curso.id} />
                <button
                  type="submit"
                  className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  Eliminar
                </button>
              </form>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
