import { createClient } from "@/lib/supabase/server";
import ClasesView from "./ClasesView";
import { redirect } from "next/navigation";

// Definición de tipos estrictos

type EventoJoin = { title: string; start_time: string; end_time: string; location: string | null; categories: { name: string; color: string | null } | null; 
};

type AttendanceRow = { id: string; event_id: string; events: EventoJoin | null;
};

export default async function MisClasesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Manejo de sesion
  if (!user) redirect('/login');

  const ahoraIso = new Date().toISOString();

  // Consulta
  const { data } = await supabase
    .from("attendances")
    .select("id, event_id, events!inner (title, start_time, end_time, location, categories(name, color))")
    .eq("user_id", user.id)
    .eq("status", "registered")
    .gte("events.end_time", ahoraIso);

  // Mapeo de datos para aplanar la estructura y facilitar el trabajo
  const clases = ((data as unknown as AttendanceRow[]) ?? [])
    .filter((row) => row.events !== null)
    .map((row) => ({
      attendanceId: row.id,
      eventId: row.event_id,
      title: row.events!.title,
      start: row.events!.start_time,
      end: row.events!.end_time,
      location: row.events!.location,
      categoryName: row.events!.categories?.name ?? null,
      categoryColor: row.events!.categories?.color ?? null,
    }));

  return <ClasesView clases={clases} />;
}