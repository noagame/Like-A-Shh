"use client";

import { m, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

type EventWithCategory = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  categories: { name: string; color: string | null } | null;
};

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function EventCard({
  event,
  index,
}: {
  event: EventWithCategory;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <m.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.15 }}
      className="card-gold overflow-hidden max-w-5xl mx-auto mb-8"
      id={`event-${event.id}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="aspect-square lg:aspect-auto bg-gradient-to-br from-dark-card via-black to-dark-card relative overflow-hidden flex items-center justify-center p-4 md:p-6 lg:p-8">
          <div className="relative w-full h-full max-w-[22rem] lg:max-w-[24rem]">
            <Image
              src="/assets/events/exotic_night.jpeg"
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain rounded-2xl"
            />
          </div>
        </div>

        <div className="p-6 md:p-10 flex flex-col justify-center">
          {event.categories && (
            <span className="inline-flex items-center gap-2 text-gold text-xs tracking-widest uppercase mb-4">
              <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
              {event.categories.name} · {formatFecha(event.start_time)}
            </span>
          )}

          <h3
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {event.title}
          </h3>

          {event.description && (
            <p
              className="text-white/70 leading-relaxed mb-6 text-justify"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {event.description}
            </p>
          )}

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-white/60">
              <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span style={{ fontFamily: "var(--font-sans)" }}>{formatFecha(event.start_time)}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-3 text-white/60">
                <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span style={{ fontFamily: "var(--font-sans)" }}>{event.location}</span>
              </div>
            )}
          </div>

          <m.a
            href="/login"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold text-black font-bold text-sm tracking-widest uppercase rounded-full hover:bg-gold-light transition-colors duration-300 shadow-lg shadow-gold/20 w-full sm:w-auto text-center"
            id="event-buy-btn"
          >
            Quiero asistir
          </m.a>
        </div>
      </div>
    </m.div>
  );
}