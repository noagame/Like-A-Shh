import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";


// Función formateadora de fechas: YY-MM-DDT:HH:mm:SS a formato legible 
function formatFecha(iso: string){
    // En caso de que no llegue el dato fecha
    if (!iso) return "Fecha no disponible";

    return new Date(iso).toLocaleDateString("es-CL",{
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Formato especifico que tendrá una clase registrada por el Admin
type ClaseRegistrada = {
    events: { title: string; start_time: string; end_time: string; location: string | null } | null;
};

export default async function MiCuentaPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Si el usuario no tiene creedenciales es reenviado a /login
    if (!user) redirect('/login');

    // Consulta a la base de datos. Usando Query builder
    const { data, error } = await supabase
        .from("attendances")
        .select("events(title, start_time, end_time, location)")
        .eq("user_id", user.id)
        .eq("status", "registered");
    if (error) console.error(error);
    
    // Manipulación de filtrado y Ordenamiento de arrays
    const ahora = Date.now(); // Momento actual

    const activas = ((data as unknown as ClaseRegistrada[]) ?? [])
        .filter((c) => c.events && new Date(c.events.end_time).getTime() >= ahora)
        .sort((a, b) => new Date(a.events!.start_time).getTime() - new Date(b.events!.start_time).getTime());

    const proximaClase = activas[0]?.events ?? null;

    return(
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "var(--font-serif)" }}>
                    Resumen</h1>
                <p className="text-white/50 text-sm mt-2">Tu actividad en Like a Shh</p>
            </div>
            
            <div className="grid grid-cols-1 sm: grid-cols-2 gap-6">
                <div className="card-gold p-6">
                    <p className="text-white/50 text-xs uppercase tracking-widest mb-2">próxima clase</p>
                    {proximaClase? (
                        <>
                            <p className="text-white font-bold text-lg">{proximaClase.title}</p>
                            <p className="text-white/60 text-sm mt-1">{proximaClase.start_time}</p>
                            {proximaClase.location && (
                                <p className="text-white/60 text-sm mt-1"> {proximaClase.location}</p>
                            )}
                        </>
                    ): (
                        <p className="text-white/40 text-sm">No tienes clases próximas.
                        <br/> 
                        <Link href="/mi-cuenta/explorar" className="text-gold hover:underline">Explorar actividades</Link>
                        </p>
                    )}
                </div>

                <div className="card-gold p-6 flex flex-col justify-center items-center">
                    <p className="text-4xl font-bold text-gold">{activas.length}</p>
                    <p className="text-white/50 text-xs uppercase tracking-widest">Clases activas</p>
                </div>
            </div>

            <div className="flex gap-4 flex-wrap">
                <Link href="mi-cuenta/explorar" className="px-6 py-3 bg-gold text-black font-bold text-sm tracking-windest uppercase rounded-full hover:bg-gold-light transition-colors ">
                Explorar actividades</Link>
                <Link href="mi-cuenta/clases" className="px-6 py-3 bg-gold text-black font-bold text-sm tracking-windest uppercase rounded-full hover:bg-gold-light transition-colors">Ver mis clases</Link>
            </div>
        </div>
    );
}
