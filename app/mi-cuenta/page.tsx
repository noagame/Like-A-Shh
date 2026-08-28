import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ClasesTomadasCarousel from "./UserEventsCarousel";

export default async function MiCuentaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const nowIso = new Date().toISOString();

  // Consulta 1: Próxima clase activa y conteo
  const { data: clasesActivas } = await supabase
    .from("attendances")
    .select("id, events!inner(title, start_time, end_time, location)")
    .eq("user_id", user.id)
    .eq("status", "registered")
    .gte("events.end_time", nowIso)
    .order("events(start_time)", { ascending: true });

  // Consulta 2: Historial de clases tomadas (pasadas)
  const { data: clasesTomadasRaw } = await supabase
    .from("attendances")
    .select("id, status, events!inner(title, start_time, end_time, location, categories(name, color))")
    .eq("user_id", user.id)
    .lt("events.end_time", nowIso)
    .order("events(start_time)", { ascending: false });

  const proximaClase = clasesActivas?.[0]?.events as unknown as { title: string; start_time: string } | undefined;
  const countActivas = clasesActivas?.length || 0;

  const clasesTomadas = (clasesTomadasRaw ?? []).map((row: any) => ({
    attendanceId: row.id,
    title: row.events.title,
    start_time: row.events.start_time,
    location: row.events.location,
    categoryName: row.events.categories?.name ?? null,
    categoryColor: row.events.categories?.color ?? null,
    status: row.status,
  }));

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* Encabezado Resumen */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-serif)" }}>
          Resumen
        </h1>
        <p className="text-white/50 text-sm mt-1">Tu actividad en Like a Shh</p>
      </div>

      {/* Tarjetas Superiores */}
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

      {/* Botones de Navegación Rápida */}
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

      {/* Carrusel de Historial de Clases */}
      <ClasesTomadasCarousel clases={clasesTomadas} />
    </div>
  );
}