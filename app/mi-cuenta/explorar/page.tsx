import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import AttendButton from "./AttendButton";

const CATEGORIA_COLOR_FALLBACK = "#D4AF37";

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Evento = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  location: string | null;
  capacity: number | null;
  category_id: string | null;
  categories: { name: string; color: string | null } | null;
};

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: categorias } = await supabase
    .from("categories")
    .select("id, name, color")
    .order("name");

  let query = supabase
    .from("events")
    .select(
      "id, title, description, start_time, end_time, location, capacity, category_id, categories(name, color)"
    )
    .eq("status", "published")
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true });

  if (categoria) query = query.eq("category_id", categoria);

  const { data: eventos } = await query;

  // Vista analítica ya definida en el schema — evita contar cupos manualmente aquí
  const { data: conteos } = await supabase
    .from("event_attendance_counts")
    .select("event_id, total_registered");

  const conteoPorEvento = new Map((conteos ?? []).map((c) => [c.event_id, c.total_registered]));

  const { data: misInscripciones } = await supabase
    .from("attendances")
    .select("event_id")
    .eq("user_id", user.id)
    .eq("status", "registered");

  const eventosInscritos = new Set((misInscripciones ?? []).map((a) => a.event_id));

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-white"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Explorar
          </h1>
          <p className="text-white/50 text-sm mt-1">Clases, eventos y workshops disponibles</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link
            href="/mi-cuenta/explorar"
            className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wide border transition-colors ${!categoria
                ? "bg-gold text-black border-gold"
                : "border-white/20 text-white/60 hover:border-gold/50"
              }`}
          >
            Todas
          </Link>
          {(categorias ?? []).map((cat) => (
            <Link
              key={cat.id}
              href={`/mi-cuenta/explorar?categoria=${cat.id}`}
              className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wide border transition-colors ${categoria === cat.id
                  ? "bg-gold text-black border-gold"
                  : "border-white/20 text-white/60 hover:border-gold/50"
                }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {(!eventos || eventos.length === 0) && (
        <div className="card-gold p-10 text-center text-white/50">
          No hay actividades disponibles en este momento.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(eventos as Evento[] | null)?.map((evento) => {
          const inscritos = conteoPorEvento.get(evento.id) ?? 0;
          const cupoLleno = evento.capacity != null && inscritos >= evento.capacity;
          const yaInscrito = eventosInscritos.has(evento.id);
          const color = evento.categories?.color ?? CATEGORIA_COLOR_FALLBACK;

          return (
            <div key={evento.id} className="card-gold p-6 flex flex-col">
              {evento.categories && (
                <span
                  className="inline-flex items-center gap-2 text-xs tracking-widest uppercase mb-3 w-fit px-2 py-1 rounded-full"
                  style={{ color, backgroundColor: `${color}1A` }}
                >
                  {evento.categories.name}
                </span>
              )}

              <h3 className="text-lg font-bold text-white mb-2">{evento.title}</h3>

              {evento.description && (
                <p className="text-white/60 text-sm mb-4 line-clamp-3">{evento.description}</p>
              )}

              <div className="text-sm text-white/50 space-y-2 mb-4">
                <p>{formatFecha(evento.start_time)}</p>

                {evento.location && (
                  evento.location.includes("http") || evento.location.includes("maps") || evento.location.includes("goo.gl") ? (
                    <a
                      href={evento.location.startsWith("http") ? evento.location : `https://${evento.location.trim()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-2 px-4 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors border border-white/10"
                    >
                      Abrir ubicación
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </a>
                  ) : (
                    <p>{evento.location}</p>
                  )
                )}

                {evento.capacity != null && (
                  <p className={cupoLleno ? "text-red-400" : "text-white/50"}>
                    {inscritos}/{evento.capacity} cupos
                  </p>
                )}
              </div>

              <div className="mt-auto pt-2">
                <AttendButton eventId={evento.id} yaInscrito={yaInscrito} cupoLleno={cupoLleno} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}