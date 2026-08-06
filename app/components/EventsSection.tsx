import { createClient } from "@/lib/supabase/server";
import EventCard from "./EventCard";

export default async function EventsSection() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, title, description, start_time, end_time, location, categories(name, color)")
    .eq("status", "published")
    .order("start_time", { ascending: true })
    .limit(3);

  return (
    <section id="eventos" className="py-16 md:py-24 section-spacing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gold gold-underline"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Próximos Eventos
          </h2>
        </div>

        {events && events.length > 0 ? (
          events.map((event: any, index: number) => (
            <EventCard key={event.id} event={event} index={index} />
          ))
        ) : (
          <p className="text-center text-white/50">
            Muy pronto anunciaremos nuestro próximo evento. Síguenos para no perdértelo.
          </p>
        )}
      </div>
    </section>
  );
}