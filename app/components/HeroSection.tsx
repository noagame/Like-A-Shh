"use client";

import { m } from "framer-motion";

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex flex-col items-center justify-center px-4 section-spacing overflow-hidden"
    >
      {/* Ambient background effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gold/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">
        {/* SHH Logo Animation */}
        <m.div
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-4"
        >
          <m.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.08, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute inset-0 mt-20 md:mt-24 flex items-center justify-center text-[10rem] sm:text-[14rem] md:text-[18rem] font-black text-white select-none pointer-events-none"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            SHH
          </m.span>

          <m.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-5xl mt-20 md:mt-24 sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight relative z-10"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            <span className="text-white">LIKE A </span>
            <span className="text-gold-gradient">SHH</span>
          </m.h1>
        </m.div>

        {/* Subtitle */}
        <m.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-gold text-lg sm:text-xl md:text-2xl tracking-[0.3em] uppercase mb-16"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Movimiento, Fuerza y Libertad
        </m.p>

        {/* CTA Button */}
        <m.a
          href="#cursos"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 mt-8 px-10 py-4 bg-gold text-black font-bold text-sm tracking-widest uppercase rounded-full hover:bg-gold-light transition-colors duration-300"
          style={{ fontFamily: "var(--font-sans)" }}
          id="hero-cta-acceso"
        >
          Acceso
        </m.a>

        {/* Divider */}
        <m.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="w-32 h-px bg-gradient-to-r from-transparent via-gold to-transparent mt-12 mb-10"
        />

        {/* Stats */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-8 sm:gap-16"
        >
          {[
            { number: "200+", label: "Alumnos" },
            { number: "5+", label: "Años" },
            { number: "10+", label: "Cursos" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <span
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-gold-gradient"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {stat.number}
              </span>
              <p
                className="text-white/70 text-sm sm:text-base mt-1 tracking-wider uppercase"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </m.div>
      </div>

      {/* Scroll flotante UI/UX*/}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float"
      >
        <div className="w-6 h-10 border-2 border-gold/40 rounded-full flex justify-center pt-2">
          <m.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 bg-gold rounded-full"
          />
        </div>
      </m.div>
    </section>
  );
}
