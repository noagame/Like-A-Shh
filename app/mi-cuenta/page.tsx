import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ClasesTomadasCarousel from "./UserEventsCarousel";
import ClassesCarousel from "./components/ClassesCarousel";
import { EventAssembler } from "@/lib/infrastructure/assemblers/EventAssembler";

export default async function MiCuentaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const nowIso = new Date().toISOString();

  const { data: clasesActivas } = await supabase
    .from("attendances")
    .select("id, event_id, events!inner(title, start_time, end_time, location, capacity, categories(name, color))")
    .eq("user_id", user.id)
    .eq("status", "registered")
    .gte("events.end_time", nowIso)
    .order("events(start_time)", { ascending: true });

  const { data: clasesDisponiblesRaw } = await supabase
    .from("events")
    .select("id, title, description, start_time, end_time, location, capacity, categories(name, color)")
    .eq("status", "published")
    .gte("start_time", nowIso)
    .order("start_time", { ascending: true });

  const { data: conteos } = await supabase
    .from("event_attendance_counts")
    .select("event_id, total_registered");

  const { data: misInscripcionesRaw } = await supabase
    .from("attendances")
    .select("event_id")
    .eq("user_id", user.id)
    .eq("status", "registered");

  const { data: userReviewsRaw } = await supabase
    .from("event_reviews")
    .select("event_id, rating, comment, recommendation")
    .eq("user_id", user.id);

  const misInscripciones = new Set((misInscripcionesRaw ?? []).map((row: any) => row.event_id));
  const conteoPorEvento = new Map((conteos ?? []).map((row: any) => [row.event_id, row.total_registered]));
  const reviewsByEvent = new Map(
    (userReviewsRaw ?? []).map((row: { event_id: string; rating: number; comment: string | null; recommendation: string | null }) => [
      row.event_id,
      {
        rating: row.rating,
        comment: row.comment,
        recommendation: row.recommendation,
      },
    ])
  );

  const proximaClase = clasesActivas?.[0]?.events as unknown as { title: string; start_time: string } | undefined;
  const countActivas = clasesActivas?.length || 0;

  const clasesDisponibles = EventAssembler.toCards(
    ((clasesDisponiblesRaw ?? []) as unknown as Array<{
      id: string;
      title: string;
      description: string | null;
      start_time: string;
      end_time: string;
      location: string | null;
      capacity: number | null;
      status?: "draft" | "published" | "cancelled";
      categories?: { name: string; color: string | null } | null;
    }>).map((evento) => ({
      ...evento,
      status: (evento.status ?? "published") as "draft" | "published" | "cancelled",
    }))
  ).map((evento) => ({
    id: evento.id,
    title: evento.title,
    description: evento.description,
    start_time: evento.start_time,
    end_time: evento.end_time,
    location: evento.location,
    capacity: evento.capacity,
    registeredCount: conteoPorEvento.get(evento.id) ?? 0,
    isRegistered: misInscripciones.has(evento.id),
    categoryName: evento.categoryName,
    categoryColor: evento.categoryColor,
  }));

  const clasesTomadas = (clasesActivas ?? [])
    .filter((row: any) => row.events && new Date(row.events.end_time).getTime() < Date.now())
    .map((row: any) => {
      const review = reviewsByEvent.get(row.event_id);
      return {
        attendanceId: row.id,
        eventId: row.event_id,
        title: row.events.title,
        start_time: row.events.start_time,
        location: row.events.location,
        categoryName: row.events.categories?.name ?? null,
        categoryColor: row.events.categories?.color ?? null,
        status: "completed",
        reviewRating: review?.rating ?? null,
        reviewComment: review?.comment ?? null,
        reviewRecommendation: review?.recommendation ?? null,
      };
    });

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-serif)" }}>
          Resumen
        </h1>
        <p className="text-white/50 text-sm mt-1">Tu actividad en Like a Shh</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
          <span className="text-xs uppercase tracking-wider text-white/50 block mb-2 font-semibold">
            Próxima Clase
          </span>
          {proximaClase ? (
            <div>
              <p className="text-lg font-bold text-white">{proximaClase.title}</p>
              <p className="text-xs text-gold mt-1">
                {new Date(proximaClase.start_time).toLocaleDateString("es-CL", {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-white/60">No tienes clases próximas.</p>
              <Link href="/mi-cuenta/explorar" className="text-xs text-gold hover:underline mt-1 inline-block">
                Explorar actividades
              </Link>
            </div>
          )}
        </div>

        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gold font-mono">{countActivas}</span>
          <span className="text-xs uppercase tracking-wider text-white/60 mt-1 font-semibold">
            {countActivas === 1 ? "Clase Activa" : "Clases Activas"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/mi-cuenta/explorar"
          className="bg-gold text-black text-xs font-bold px-6 py-3 rounded-full hover:bg-gold-light transition-all"
        >
          EXPLORAR ACTIVIDADES
        </Link>
        <Link
          href="/mi-cuenta/clases"
          className="bg-gold text-black text-xs font-bold px-6 py-3 rounded-full hover:bg-gold-light transition-all"
        >
          VER MIS CLASES
        </Link>
      </div>

      <ClassesCarousel
        title="Clases y Workshops Disponibles"
        subtitle="Selecciona tus próximas sesiones con el profesor"
        items={clasesDisponibles}
      />

      <ClasesTomadasCarousel clases={clasesTomadas} />
    </div>
  );
}