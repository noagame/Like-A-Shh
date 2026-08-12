import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { changeEventStatus, deleteEvent } from "./actions";
import AutoSubmitSelect from "./AutoSubmitSelect"; // Ajusta la ruta según dónde lo guardes

const ESTADO_LABEL: Record<string, string> = {
  draft: "Borrador",
  published: "Publicado",
  cancelled: "Cancelado",
};

const ESTADO_COLOR: Record<string, string> = {
  draft: "bg-white/10 text-white/60",
  published: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
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

  let query = supabase
    .from("events")
    .select("id, title, start_time, end_time, location, capacity, status, categories(id, name)")
    .order("start_time", { ascending: false });

  if (estado) query = query.eq("status", estado);
  if (categoria) query = query.eq("category_id", categoria);

  const { data: events } = await query;

  // Cupos ocupados por evento, en una sola consulta
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Eventos</h1>
        <Link
          href="/admin/eventos/nuevo"
          className="bg-gold text-black font-bold px-4 py-2 rounded hover:bg-gold-light transition-colors text-sm"
        >
          + Nuevo evento
        </Link>
      </div>

      {/* Filtros */}
      <form className="flex flex-wrap gap-3 mb-6 text-sm">
        <AutoSubmitSelect
          name="estado"
          defaultValue={estado ?? ""}
          className="bg-black/40 border border-white/20 rounded px-3 py-1.5"
        >
          <option value="">Todos los estados</option>
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
          <option value="cancelled">Cancelado</option>
        </AutoSubmitSelect>
        <AutoSubmitSelect
          name="categoria"
          defaultValue={categoria ?? ""}
          className="bg-black/40 border border-white/20 rounded px-3 py-1.5"
        >
          <option value="">Todas las categorías</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </AutoSubmitSelect>
      </form>

      {!events || events.length === 0 ? (
        <p className="text-white/50">No hay eventos que coincidan con el filtro.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-white/10 text-white/50">
                <th className="py-2 pr-4">Título</th>
                <th className="py-2 pr-4">Categoría</th>
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2 pr-4">Lugar</th>
                <th className="py-2 pr-4">Cupo</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2 pr-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event: any) => {
                const ocupados = countByEvent[event.id] ?? 0;
                return (
                  <tr key={event.id} className="border-b border-white/5">
                    <td className="py-3 pr-4 font-medium">{event.title}</td>
                    <td className="py-3 pr-4 text-white/60">
                      {event.categories?.name ?? "—"}
                    </td>
                    <td className="py-3 pr-4 text-white/60">{formatFecha(event.start_time)}</td>
                    <td className="py-3 pr-4 text-white/60">{event.location ?? "—"}</td>
                    <td className="py-3 pr-4 text-white/60">
                      {event.capacity ? `${ocupados} / ${event.capacity}` : `${ocupados} / ∞`}
                    </td>
                    <td className="py-3 pr-4">
                      <form action={changeEventStatus} className="inline">
                        <input type="hidden" name="event_id" value={event.id} />
                        <AutoSubmitSelect
                          name="status"
                          defaultValue={event.status}
                          className={`text-xs rounded px-2 py-1 border-0 ${ESTADO_COLOR[event.status]}`}
                        >
                          <option value="draft">Borrador</option>
                          <option value="published">Publicado</option>
                          <option value="cancelled">Cancelado</option>
                        </AutoSubmitSelect>
                      </form>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-3">
                        <Link
                          href={`/admin/eventos/${event.id}/editar`}
                          className="text-gold hover:underline"
                        >
                          Editar
                        </Link>
                        <form action={deleteEvent}>
                          <input type="hidden" name="event_id" value={event.id} />
                          <button
                            type="submit"
                            className="text-red-400 hover:underline"
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
      )}
    </div>
  );
}