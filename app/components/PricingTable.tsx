import React from "react";

const WHATSAPP_BASE =
  "https://wa.me/56971577711?text=Hola%20Maximiliano,%20quisiera%20consultar%20por%20el%20plan%20de:%20";

export default function PricingTable() {
  return (
    <div className="mt-16 md:mt-24">
      {/* Encabezado de la Sección de Tarifas */}
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-widest font-bold px-3.5 py-1 rounded-full bg-[#E0218A]/15 text-[#E0218A] border border-[#E0218A]/30">
          Tarifas & Planes
        </span>
        <h3
          className="text-3xl sm:text-4xl font-bold text-gold mt-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Valores y Membresías
        </h3>
        <p className="text-xs sm:text-sm text-white/60 mt-2 max-w-xl mx-auto">
          Planes flexibles adaptados a tu ritmo de entrenamiento. Consulta por disponibilidad horaria.
        </p>
      </div>

      {/* Grid de 3 Columnas: Clases Online | Clases Presenciales | Cursos Online */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        
        {/* COLUMNA 1: Clases Planificadas Online (Acento Celeste / Cyan) */}
        <div className="bg-white/5 backdrop-blur-xl border border-[#48CAE4]/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl hover:border-[#48CAE4]/60 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#48CAE4]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#48CAE4] bg-[#48CAE4]/10 border border-[#48CAE4]/20 px-3 py-1 rounded-full">
                Sincrónico Vía Zoom
              </span>
              <span className="text-xs text-white/50 font-mono">1 Hora/clase</span>
            </div>

            <h4
              className="text-xl sm:text-2xl font-bold text-white mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Clases Planificadas Online
            </h4>
            <p className="text-xs text-white/70 mb-6 leading-relaxed">
              Incluye dos sesiones mensuales a libre elección para correcciones y evaluación de progresión individual.
            </p>

            <ul className="space-y-3 pt-4 border-t border-white/10 text-sm">
              <li className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/80">Clase suelta</span>
                <span className="font-bold text-[#48CAE4] font-mono">$15.000</span>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/80">4 Clases mensuales</span>
                <span className="font-bold text-[#48CAE4] font-mono">$50.000</span>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/80">6 Clases mensuales</span>
                <span className="font-bold text-[#48CAE4] font-mono">$75.000</span>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/80">8 Clases mensuales</span>
                <span className="font-bold text-[#48CAE4] font-mono">$100.000</span>
              </li>
              <li className="flex justify-between items-center py-1">
                <span className="text-white/80">12 Clases mensuales</span>
                <span className="font-bold text-[#48CAE4] font-mono">$130.000</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10">
            <a
              href={`${WHATSAPP_BASE}Clases%20Planificadas%20Online`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center text-xs font-bold uppercase tracking-wider py-3 rounded-xl bg-[#48CAE4] text-black hover:bg-[#48CAE4]/90 shadow-lg shadow-[#48CAE4]/20 transition-all cursor-pointer"
            >
              Agenda aquí ↗
            </a>
          </div>
        </div>

        {/* COLUMNA 2: Clases Planificadas Presenciales (Acento Rosa / Borgoña) */}
        <div className="bg-gradient-to-b from-[#6B112D]/40 via-white/5 to-black/80 backdrop-blur-xl border-2 border-[#E0218A]/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl hover:border-[#E0218A] transition-all duration-300 relative group overflow-hidden scale-[1.02] md:scale-[1.03] z-10">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#E0218A]/15 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E0218A] bg-[#E0218A]/15 border border-[#E0218A]/30 px-3 py-1 rounded-full font-semibold">
                ★ En Estudio Particular
              </span>
              <span className="text-xs text-white/50 font-mono">1 Hora/clase</span>
            </div>

            <h4
              className="text-xl sm:text-2xl font-bold text-white mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Clases Planificadas Presencial
            </h4>
            <p className="text-xs text-white/70 mb-6 leading-relaxed">
              Puedes combinar el estilo de tus clases (Pole Sport, Exotic Pole, Flexibilidad Activa y Floorwork)[cite: 2].
            </p>

            <ul className="space-y-3 pt-4 border-t border-white/10 text-sm">
              <li className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/80">Clase suelta</span>
                <span className="font-bold text-[#E0218A] font-mono">$20.000</span>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/80">4 Clases mensuales</span>
                <span className="font-bold text-[#E0218A] font-mono">$68.000</span>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/80">6 Clases mensuales</span>
                <span className="font-bold text-[#E0218A] font-mono">$75.000</span>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/80">8 Clases mensuales</span>
                <span className="font-bold text-[#E0218A] font-mono">$96.000</span>
              </li>
              <li className="flex justify-between items-center py-1">
                <span className="text-white/80">12 Clases mensuales</span>
                <span className="font-bold text-[#E0218A] font-mono">$140.000</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10">
            <a
              href={`${WHATSAPP_BASE}Clases%20Planificadas%20Presenciales`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center text-xs font-bold uppercase tracking-wider py-3 rounded-xl bg-[#E0218A] text-white hover:bg-[#E0218A]/90 shadow-lg shadow-[#E0218A]/25 transition-all cursor-pointer font-semibold"
            >
              Agenda aquí ↗
            </a>
          </div>
        </div>

        {/* COLUMNA 3: Cursos Online (Acento Dorado Oficial Hotmart) */}
        <div className="bg-white/5 backdrop-blur-xl border border-gold/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl hover:border-gold/60 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gold bg-gold/10 border border-gold/20 px-3 py-1 rounded-full">
                Hotmart Oficial
              </span>
              <span className="text-xs text-white/50 font-mono">Grabado 24/7</span>
            </div>

            <h4
              className="text-xl sm:text-2xl font-bold text-white mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Cursos Online
            </h4>
            <p className="text-xs text-white/70 mb-6 leading-relaxed">
              Formaciones integrales en video paso a paso, ejercicios globales de movilidad y rutinas progresivas[cite: 5].
            </p>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="p-3.5 bg-black/40 rounded-xl border border-white/5">
                <p className="text-xs font-semibold text-gold">Flexibiliza tu Actitud</p>
                <p className="text-[11px] text-white/60 mt-1">Acceso ilimitado por 1 mes con garantía y soporte[cite: 2].</p>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5 text-xs">
                  <span className="text-white/70">Membresía Hotmart</span>
                  <span className="text-gold font-bold font-mono">Ver en Hotmart</span>
                </div>
              </div>

              <div className="p-3.5 bg-black/40 rounded-xl border border-white/5">
                <p className="text-xs font-semibold text-white/80">Nuevos Programas</p>
                <p className="text-[11px] text-white/50 mt-1">Exotic Pole Tricks, Transiciones y Floorwork Flow.</p>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5 text-xs">
                  <span className="text-white/40">Próximos lanzamientos</span>
                  <span className="text-white/40 font-mono">2026</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10">
            <a
              href="https://hotmart.com/es/marketplace/productos/flexibiliza-tu-actitud-by-maximiliano-velasquez/A102579634L"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center text-xs font-bold uppercase tracking-wider py-3 rounded-xl bg-gold text-black hover:bg-gold-light shadow-lg shadow-gold/20 transition-all cursor-pointer font-semibold"
            >
              Ver Cursos en Hotmart ↗
            </a>
          </div>
        </div>

      </div>

      {/* Nota de Contacto y Dudas */}
      <div className="mt-8 text-center text-xs text-white/50 flex flex-wrap justify-center gap-x-6 gap-y-2">
        <span>📞 Consultas: <strong className="text-white/80">+56 9 7157 7711</strong></span>
        <span>✉️ Email: <strong className="text-white/80">academialikeashh@gmail.com</strong></span>
      </div>
    </div>
  );
}