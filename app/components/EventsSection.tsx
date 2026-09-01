import EventCard from "./EventCard";
import { EventController } from "@/lib/application/controllers/EventController";

export default async function EventsSection() {
  const events = await EventController.listPublicEvents();

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
          events.map((event, index: number) => (
            <EventCard key={event.id} event={{
              id: event.id,
              title: event.title,
              description: event.description,
              start_time: event.start_time,
              end_time: event.end_time,
              location: event.location,
              categories: event.categoryName ? { name: event.categoryName, color: event.categoryColor } : null,
            }} index={index} />
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