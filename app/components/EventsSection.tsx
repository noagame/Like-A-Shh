"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function EventsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="eventos"
      className="py-16 md:py-24 section-spacing"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="card-gold overflow-hidden max-w-5xl mx-auto"
          id="event-frosted-desire"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Event Image */}
            <div className="aspect-square lg:aspect-auto bg-gradient-to-br from-dark-card via-black to-dark-card relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="w-28 h-28 mx-auto mb-4 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center"
                  >
                    <svg
                      className="w-14 h-14 text-gold/50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </motion.div>
                  <p
                    className="text-gold/60 text-lg font-bold tracking-wider"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    VOL. 5
                  </p>
                  <p className="text-gold/40 text-sm tracking-wider uppercase mt-1">
                    Póster del evento
                  </p>
                </div>
              </div>
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50 lg:block hidden" />
            </div>

            {/* Event Details */}
            <div className="p-6 md:p-10 flex flex-col justify-center">
              <span className="inline-flex items-center gap-2 text-gold text-xs tracking-widest uppercase mb-4">
                <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                Próximamente
              </span>

              <h3
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Noche de Exotic
              </h3>
              <h4
                className="text-xl sm:text-2xl text-gold-gradient font-bold mb-6"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Vol. 5 — Frosted Desire
              </h4>

              <p
                className="text-white/70 leading-relaxed mb-6"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                La quinta edición de nuestro evento insignia llega con más fuerza que
                nunca. Una noche mágica de danza exotic, performances en vivo y una
                experiencia inmersiva que celebra el arte del movimiento. Prepárate
                para una velada inolvidable llena de elegancia, talento y pasión.
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
                    Fecha por confirmar
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
                    Ubicación por confirmar
                  </span>
                </div>
              </div>

              <motion.a
                href="#"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold text-black font-bold text-sm tracking-widest uppercase rounded-full hover:bg-gold-light transition-colors duration-300 shadow-lg shadow-gold/20 w-full sm:w-auto text-center"
                id="event-buy-btn"
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
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
