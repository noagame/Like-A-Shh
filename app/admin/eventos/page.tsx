import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { changeEventStatus, deleteEvent } from "./actions";
import AutoSubmitSelect from "./AutoSubmitSelect";
import PanelInfo from "@/app/admin/components/PanelInfo";
import EventModal from "./EventModal";
import ClaseOnlineModal from "./ClaseOnlineModal";
import ClasePresencialModal from "./ClasePresencialModal";
import { revalidatePath } from "next/cache";
import BackButton from "@/app/admin/components/BackButton";

const ESTADO_COLOR: Record<string, string> = {
  draft: "border border-zinc-500/20 bg-zinc-500/10 text-zinc-300",
  published: "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  cancelled: "border border-red-500/20 bg-red-500/10 text-red-400",
};

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminEventosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; categoria?: string }>;
}) {
  const { estado, categoria } = await searchParams;
  const supabase = await createClient();

  async function handleCreateEvent(formData: FormData) {
    "use server";
    const supabaseClient = await createClient();

    const { data, error } = await supabaseClient.from("events").insert({
      title: formData.get("title"),
      description: formData.get("description"),
      category_id: formData.get("category_id") || null,
      start_time: formData.get("start_time"),
      end_time: formData.get("end_time"),
      location: formData.get("location"),
      capacity: formData.get("capacity") ? Number(formData.get("capacity")) : null,
      status: formData.get("status") ?? "draft",
    }).select("id, title").single();

    if (!error && data) {
      const { data: { user } } = await supabaseClient.auth.getUser();
      await supabaseClient.from("audit_log").insert({
        actor_id: user?.id,
        action: "create_event",
        metadata: { event_id: data.id, title: data.title },
      });
    }

    revalidatePath("/admin/eventos");
  }

  let query = supabase
    .from("events")
    .select("id, title, start_time, end_time, location, capacity, status, categories(id, name)")
    .order("start_time", { ascending: false });

  if (estado) query = query.eq("status", estado);
  if (categoria) query = query.eq("category_id", categoria);

  const { data: events } = await query;

  const eventIds = events?.map((e) => e.id) ?? [];
  const { data: attendanceCounts } = eventIds.length
    ? await supabase
        .from("attendances")
        .select("event_id")
        .in("event_id", eventIds)
        .eq("status", "registered")
    : { data: [] as { event_id: string }[] };

  const countByEvent = (attendanceCounts ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.event_id] = (acc[row.event_id] ?? 0) + 1;
    return acc;
  }, {});

  const { data: categories } = await supabase.from("categories").select("id, name").order("name");

  return (
    <div className="w-full space-y-6">
      <BackButton />

      {/* Cabecera Responsiva */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-amber-300/80">
              Gestión
            </p>
            <h1
              className="mt-1 text-2xl sm:text-3xl font-bold text-white"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Eventos y clases
            </h1>
          </div>

          {/* Botones apilados en móvil y en fila en pantallas grandes */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
            <EventModal createAction={handleCreateEvent} categories={categories || []} />
            <ClaseOnlineModal categories={categories || []} />
            <ClasePresencialModal categories={categories || []} />
          </div>
        </div>

        {/* Badges descriptivos */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-amber-200">
            Landing page
          </span>
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-cyan-200">
            Online
          </span>
          <span className="rounded-full border border-pink-500/30 bg-pink-500/10 px-2.5 py-1 text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-pink-200">
            Presencial
          </span>
        </div>
      </div>

      <PanelInfo
        title="¿Para qué sirve este panel?"
        description="Acá administras todas las sesiones, clases y workshops del sitio: crea nuevos eventos, cambia su estado (borrador/publicado/cancelado), edítalos o elimínalos. Solo los eventos en estado 'Publicado' se muestran en la landing pública."
      />

      {/* Filtros de Búsqueda */}
      <form className="flex flex-col sm:flex-row gap-2.5 text-xs sm:text-sm">
        <AutoSubmitSelect
          name="estado"
          defaultValue={estado ?? ""}
          className="w-full sm:w-auto rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white/80 backdrop-blur-xl"
        >
          <option value="" className="bg-neutral-900">Todos los estados</option>
          <option value="draft" className="bg-neutral-900">Borrador</option>
          <option value="published" className="bg-neutral-900">Publicado</option>
          <option value="cancelled" className="bg-neutral-900">Cancelado</option>
        </AutoSubmitSelect>

        <AutoSubmitSelect
          name="categoria"
          defaultValue={categoria ?? ""}
          className="w-full sm:w-auto rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white/80 backdrop-blur-xl"
        >
          <option value="" className="bg-neutral-900">Todas las categorías</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id} className="bg-neutral-900">
              {c.name}
            </option>
          ))}
        </AutoSubmitSelect>
      </form>

      {/* Estado Vacío */}
      {!events || events.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center text-white/50 text-xs">
          No hay eventos que coincidan con los filtros seleccionados.
        </div>
      ) : (
        <>
          {/* VISTA MÓVIL: Tarjetas individuales (< md) */}
          <div className="block md:hidden space-y-3">
            {events.map((event: any) => {
              const ocupados = countByEvent[event.id] ?? 0;
              return (
                <div
                  key={event.id}
                  className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl space-y-3 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-amber-300/80 uppercase">
                        {event.categories?.name ?? "General"}
                      </span>
                      <h3 className="text-sm font-semibold text-white mt-0.5">{event.title}</h3>
                      <p className="text-[11px] text-white/50 mt-1">{formatFecha(event.start_time)}</p>
                    </div>
                    <form action={changeEventStatus} className="inline">
                      <input type="hidden" name="event_id" value={event.id} />
                      <AutoSubmitSelect
                        name="status"
                        defaultValue={event.status}
                        className={`rounded-full px-2 py-1 text-[9px] uppercase tracking-wider font-mono ${ESTADO_COLOR[event.status]}`}
                      >
                        <option value="draft" className="bg-neutral-900">Borrador</option>
                        <option value="published" className="bg-neutral-900">Publicado</option>
                        <option value="cancelled" className="bg-neutral-900">Cancelado</option>
                      </AutoSubmitSelect>
                    </form>
                  </div>

                  <div className="text-xs text-white/60 flex items-center justify-between pt-2 border-t border-white/5">
                    <span>Cupo: {event.capacity ? `${ocupados} / ${event.capacity}` : `${ocupados} / ∞`}</span>
                    {event.location && (
                      <span className="truncate max-w-[140px] text-[11px] text-white/40">
                        {event.location}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/eventos/${event.id}/editar`}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-amber-300 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Editar
                    </Link>
                    <form action={deleteEvent}>
                      <input type="hidden" name="event_id" value={event.id} />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>

          {/* VISTA ESCRITORIO: Tabla estructurada (>= md) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl">
            <table className="w-full border-collapse text-sm text-left">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.2em] text-white/45 font-mono">
                  <th className="px-4 py-3.5">Título</th>
                  <th className="px-4 py-3.5">Categoría</th>
                  <th className="px-4 py-3.5">Fecha</th>
                  <th className="px-4 py-3.5">Lugar</th>
                  <th className="px-4 py-3.5">Cupo</th>
                  <th className="px-4 py-3.5">Estado</th>
                  <th className="px-4 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.map((event: any) => {
                  const ocupados = countByEvent[event.id] ?? 0;
                  return (
                    <tr key={event.id} className="text-white/80 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3.5 font-medium text-white">{event.title}</td>
                      <td className="px-4 py-3.5 text-white/60">{event.categories?.name ?? "—"}</td>
                      <td className="px-4 py-3.5 text-white/60">{formatFecha(event.start_time)}</td>
                      <td className="px-4 py-3.5 text-white/60">
                        {event.location && event.location.startsWith("http") ? (
                          <a
                            href={event.location}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-amber-300 hover:bg-white/10"
                          >
                            Ver mapa ↗
                          </a>
                        ) : (
                          event.location ?? "—"
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-white/60">
                        {event.capacity ? `${ocupados} / ${event.capacity}` : `${ocupados} / ∞`}
                      </td>
                      <td className="px-4 py-3.5">
                        <form action={changeEventStatus} className="inline">
                          <input type="hidden" name="event_id" value={event.id} />
                          <AutoSubmitSelect
                            name="status"
                            defaultValue={event.status}
                            className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] font-mono ${ESTADO_COLOR[event.status]}`}
                          >
                            <option value="draft" className="bg-neutral-900">Borrador</option>
                            <option value="published" className="bg-neutral-900">Publicado</option>
                            <option value="cancelled" className="bg-neutral-900">Cancelado</option>
                          </AutoSubmitSelect>
                        </form>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/eventos/${event.id}/editar`}
                            className="font-medium text-amber-300 hover:underline text-xs"
                          >
                            Editar
                          </Link>
                          <form action={deleteEvent}>
                            <input type="hidden" name="event_id" value={event.id} />
                            <button
                              type="submit"
                              className="font-medium text-red-400 hover:underline text-xs bg-transparent border-none cursor-pointer"
                            >
                              Eliminar
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}