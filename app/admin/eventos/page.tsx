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

  // Server action para crear el evento dentro de la misma vista
  async function handleCreateEvent(formData: FormData) {
    "use server";
    const supabaseClient = await createClient();

    await supabaseClient.from("events").insert({
      title: formData.get("title"),
      description: formData.get("description"),
      category_id: formData.get("category_id") || null,
      start_time: formData.get("start_time"),
      end_time: formData.get("end_time"),
      location: formData.get("location"),
      capacity: formData.get("capacity") ? Number(formData.get("capacity")) : null,
      status: formData.get("status") ?? "draft",
    });

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
    <div className="space-y-6">
      <BackButton />

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300/80">Gestión</p>
            <h1 className="mt-2 text-3xl font-bold text-white" style={{ fontFamily: "var(--font-serif)" }}>
              Eventos y clases
            </h1>
          </div>

          <div className="flex  gap-3">
            <EventModal createAction={handleCreateEvent} categories={categories || []} />
            <ClaseOnlineModal categories={categories || []} />
            <ClasePresencialModal categories={categories || []} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-amber-200">
            Landing page
          </div>
          <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-cyan-200">
            Online
          </div>
          <div className="rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-pink-200">
            Presencial
          </div>
        </div>
      </div>

      <PanelInfo
        title="¿Para qué sirve este panel?"
        description="Acá administras todas las sesiones, clases y workshops del sitio: crea nuevos eventos, cambia su estado (borrador/publicado/cancelado), edítalos o elimínalos. Solo los eventos en estado 'Publicado' se muestran en la landing pública."
      />

      {/* Filtros */}
      <form className="mb-6 flex flex-wrap gap-3 text-sm">
        <AutoSubmitSelect
          name="estado"
          defaultValue={estado ?? ""}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white/80 backdrop-blur-xl"
        >
          <option value="">Todos los estados</option>
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
          <option value="cancelled">Cancelado</option>
        </AutoSubmitSelect>
        <AutoSubmitSelect
          name="categoria"
          defaultValue={categoria ?? ""}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white/80 backdrop-blur-xl"
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
        <p className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-white/55">
          No hay eventos que coincidan con el filtro.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
          <table className="w-full border-collapse text-sm text-left">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.2em] text-white/45">
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Lugar</th>
                <th className="px-4 py-3">Cupo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event: any) => {
                const ocupados = countByEvent[event.id] ?? 0;
                return (
                  <tr key={event.id} className="border-b border-white/5 text-white/80 last:border-none">
                    <td className="px-4 py-3 font-medium text-white">{event.title}</td>
                    <td className="px-4 py-3 text-white/60">{event.categories?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-white/60">{formatFecha(event.start_time)}</td>
                    <td className="px-4 py-3 text-white/60">
                      {event.location && event.location.startsWith("http") ? (
                        <a
                          href={event.location}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
                        >
                          Ver ubicación ↗
                        </a>
                      ) : (
                        event.location ?? "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      {event.capacity ? `${ocupados} / ${event.capacity}` : `${ocupados} / ∞`}
                    </td>
                    <td className="px-4 py-3">
                      <form action={changeEventStatus} className="inline">
                        <input type="hidden" name="event_id" value={event.id} />
                        <AutoSubmitSelect
                          name="status"
                          defaultValue={event.status}
                          className={`rounded-full px-2.5 py-1.5 text-[10px] uppercase tracking-[0.14em] ${ESTADO_COLOR[event.status]}`}
                        >
                          <option value="draft">Borrador</option>
                          <option value="published">Publicado</option>
                          <option value="cancelled">Cancelado</option>
                        </AutoSubmitSelect>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/admin/eventos/${event.id}/editar`}
                          className="font-medium text-amber-300 transition hover:text-amber-200"
                        >
                          Editar
                        </Link>
                        <form action={deleteEvent}>
                          <input type="hidden" name="event_id" value={event.id} />
                          <button
                            type="submit"
                            className="font-medium text-red-400 transition hover:text-red-300"
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