import { createClient } from "@/lib/supabase/server";
import DashboardCharts from "./DashboardCharts";
import PanelInfo from "@/app/admin/components/PanelInfo";

function KpiCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-5">
      <p className="text-sm text-white/50">{label}</p>
      <p className="text-3xl font-bold text-gold mt-1">{value}</p>
      {hint && <p className="text-xs text-white/40 mt-1">{hint}</p>}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  const sieteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Todas las consultas de KPIs en paralelo, no una tras otra
  const [
    { count: clasesActivas },
    { count: totalUsuarios },
    { count: usuariosNuevos },
    { count: totalTestimonios },
    { count: testimoniosPendientes },
    { count: cursosPublicados },
    { count: patrocinadoresActivos },
    { data: weeklySignups },
    { data: topEventos },
    { data: topAcciones },
  ] = await Promise.all([
    supabase.from("events").select("*", { count: "exact", head: true })
      .eq("status", "published").gte("end_time", nowIso),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true })
      .gte("created_at", sieteDiasAtras),
    supabase.from("testimonials").select("*", { count: "exact", head: true }),
    supabase.from("testimonials").select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("courses").select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase.from("sponsors").select("*", { count: "exact", head: true })
      .eq("active", true),
    supabase.from("weekly_signups").select("week, total").order("week", { ascending: true }).limit(8),
    supabase.from("event_attendance_counts").select("title, total_registered")
      .order("total_registered", { ascending: false }).limit(5),
    supabase.from("top_actions_last_30_days").select("action, total").limit(8),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <PanelInfo
        title="¿Para qué sirve este panel?"
        description="Muestra métricas clave del sitio: clases activas, usuarios totales y nuevos, comentarios pendientes de moderar, y gráficas de tendencia (usuarios nuevos por semana, clases con más inscritos, interacciones más frecuentes). Se actualiza en tiempo real con cada visita."
      />

      {/* KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <KpiCard label="Clases activas" value={clasesActivas ?? 0} />
        <KpiCard label="Usuarios totales" value={totalUsuarios ?? 0} hint={`+${usuariosNuevos ?? 0} en 7 días`} />
        <KpiCard label="Comentarios" value={totalTestimonios ?? 0} hint={`${testimoniosPendientes ?? 0} por revisar`} />
        <KpiCard label="Cursos publicados" value={cursosPublicados ?? 0} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <KpiCard label="Patrocinadores activos" value={patrocinadoresActivos ?? 0} />
      </div>

      {testimoniosPendientes && testimoniosPendientes > 0 && (
        <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 mb-10 text-sm">
          Tienes <strong>{testimoniosPendientes}</strong> testimonio(s) esperando moderación en{" "}
          <a href="/admin/interaccion" className="underline text-gold">Interacción</a>.
        </div>
      )}

      {/* Gráficas (requieren cliente) */}
      <DashboardCharts
        weeklySignups={weeklySignups ?? []}
        topEventos={topEventos ?? []}
        topAcciones={topAcciones ?? []}
      />
    </div>
  );
}