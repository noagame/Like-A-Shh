"use client";

import { m, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";


export default function EventsSection() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*, categories(name, color)")
    .eq("status", "published")
    .order("start_time", { ascending: true })
    .limit(3);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="eventos"
      className="py-16 md:py-24 section-spacing"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gold gold-underline"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Próximos Eventos
          </h2>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="card-gold overflow-hidden max-w-5xl mx-auto"
          id="event-frosted-desire"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Event Image */}
            <div className="aspect-square lg:aspect-auto bg-gradient-to-br from-dark-card via-black to-dark-card relative overflow-hidden flex items-center justify-center p-4 md:p-6 lg:p-8">
              <div className="relative w-full h-full max-w-[22rem] lg:max-w-[24rem]">
                <Image
                  src="/assets/events/exotic_night.jpeg"
                  alt="Frosted Desire"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain rounded-2xl"
                />
              </div>
            </div>

            {/* Event Details */}
            <div className="p-6 md:p-10 flex flex-col justify-center">
              <span className="inline-flex items-center gap-2 text-gold text-xs tracking-widest uppercase mb-4">
                <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                31 de Julio
              </span>

              <h3
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Noche de Exotic Vol. 5
              </h3>
              <h4
                className="text-xl sm:text-2xl text-sky-300 mb-6"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Frosted Desire
              </h4>

              <p
                className="text-white/70 leading-relaxed mb-6 text-justify"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                El invierno cae sobre la noche más sensual del año.
              </p>
              <p
                className="text-white/70 leading-relaxed mb-6 text-justify"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Una edición donde el hielo, la oscuridad y el deseo se encuentran bajo las luces.
              </p>
              <p
                className="text-gold/70 leading-relaxed mb-6"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                ✧ Performance • Pole • Sensualidad • Ritual • Escarcha • Elegancia oscura ✧
              </p>
              <p
                className="text-white/70 leading-relaxed mb-6 text-justify"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Prepárate para una experiencia hipnótica inspirada en el frío, el misterio y la belleza de las noches eternas.
              </p>
              <p
                className="text-white/70 leading-relaxed mb-6 text-justify"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Cada escena, cada cuerpo y cada movimiento fueron creados para encender el invierno desde adentro.
              </p>
              <p
                className="text-sky-300 leading-relaxed mb-6 text-justify"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                El frío nunca se vio tan seductor.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-white/60">
                  <svg
                    className="w-5 h-5 text-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span style={{ fontFamily: "var(--font-sans)" }}>
                    Viernes 31 de Julio
                  </span>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <svg
                    className="w-5 h-5 text-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span style={{ fontFamily: "var(--font-sans)" }}>
                    <m.a
                      href="https://www.google.com/maps/place/Cabaret+Pira%C3%B1a/@-33.4297585,-70.6384482,17z/data=!3m1!4b1!4m6!3m5!1s0x9662c50062a9fe4d:0x1219dd351556ec9!8m2!3d-33.4297585!4d-70.6384482!16s%2Fg%2F11wftzr0kq?entry=ttu&g_ep=EgoyMDI2MDYxMy4wIKXMDSoASAFQAw%3D%3D"
                      className="text-gold/70"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Cabaret Piraña - Bombero Núñez 365 - Recoleta - Santiago
                    </m.a>
                  </span>
                </div>
              </div>

              <m.a
                href="https://www.alltickets.cl/details.php?eve_id=824"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold text-black font-bold text-sm tracking-widest uppercase rounded-full hover:bg-gold-light transition-colors duration-300 shadow-lg shadow-gold/20 w-full sm:w-auto text-center"
                id="event-buy-btn"
                onClick={() => trackEvent("click_cta_compra_entrada", { event_id: event.id })}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                  />
                </svg>
                Compra tu Entrada
              </m.a>
            </div>
          </div>
        </m.div>
      </div>
    </section>
  );
}
