import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

export default async function CoursesSection() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, description, image_url, url")
    .eq("status", "published")
    .order("order_index", { ascending: true });

  return (
    <section id="cursos" className="py-16 md:py-24 section-spacing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gold gold-underline"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Nuestros Cursos Online
          </h2>
          <p
            className="text-white/60 mt-6 text-base sm:text-lg max-w-2xl mx-auto"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Accede a nuestro catálogo de cursos y transforma tu cuerpo y mente desde cualquier lugar del mundo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(courses ?? []).map((course) => (
            <div
              key={course.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl hover:border-gold/30 transition-all duration-300"
            >
              <div>
                <div className="relative aspect-video w-full bg-black/40 overflow-hidden">
                  <Image
                    src={course.image_url || "/assets/logo/logo_likeashh.jpg"}
                    alt={course.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-6">
                  <h3
                    className="text-xl font-bold text-gold mb-3"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {course.title}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {course.description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <a
                  href={course.url}
                  target={course.url.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-gold text-black text-xs font-bold uppercase tracking-wider py-3 rounded-xl hover:bg-gold-light transition-all shadow-lg shadow-gold/10"
                >
                  {course.url === "#" ? "Próximamente" : "Acceder al Curso ↗"}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}