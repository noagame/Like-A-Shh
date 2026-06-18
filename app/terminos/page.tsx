"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-black text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gold/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Navigation Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gold/80 hover:text-gold transition-colors mb-10 group"
          id="back-to-home-terminos"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span
            className="font-bold text-sm tracking-widest uppercase"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Volver al Inicio
          </span>
        </Link>

        {/* Content Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="card-gold p-8 md:p-12"
        >
          {/* Header */}
          <div className="border-b border-gold/20 pb-8 mb-8 text-center">
            <h1
              className="text-4xl sm:text-5xl font-bold text-gold mb-4"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Términos y Condiciones
            </h1>
            <p
              className="text-white/40 text-sm tracking-wider uppercase"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Última actualización: 18 de Junio de 2026
            </p>
          </div>

          {/* Legal Text body */}
          <div className="space-y-8 text-justify text-white/80 leading-relaxed text-base sm:text-lg" style={{ fontFamily: "var(--font-sans)" }}>
            <p>
              Bienvenido al sitio web oficial de <strong className="text-gold">Like a SHH</strong>. Al acceder, navegar o utilizar este sitio web, usted acepta quedar vinculado por los presentes Términos y Condiciones de Uso de conformidad con la legislación chilena vigente, en especial por lo dispuesto en la <strong className="text-gold">Ley N° 19.496 sobre Protección de los Derechos de los Consumidores</strong>.
            </p>

            {/* Sección 1 */}
            <section className="space-y-3">
              <h2
                className="text-2xl sm:text-3xl font-bold text-gold"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                1. Naturaleza del Sitio y Servicios
              </h2>
              <p>
                Este sitio web tiene carácter corporativo e informativo y sirve como portal de difusión de nuestras actividades, workshops artísticos presenciales, eventos temáticos, y catálogo de formación digital.
              </p>
              <p>
                Los servicios educativos ofrecidos comprenden clases grabadas, programas de acondicionamiento físico, asesoramiento en danza exotic y flexibilidad, liderados por el instructor Maximiliano Velásquez.
              </p>
            </section>

            {/* Sección 2 */}
            <section className="space-y-3">
              <h2
                className="text-2xl sm:text-3xl font-bold text-gold"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                2. Adquisición de Cursos y Derivación a Hotmart
              </h2>
              <p>
                El usuario declara conocer y aceptar que la compra de nuestros cursos online (como <em>"Flexibiliza tu Actitud"</em>) se gestiona de forma externa.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li>Al hacer clic en los enlaces de compra de cursos, el usuario será redirigido al portal oficial de Hotmart, que actúa como procesador de pagos exclusivo y distribuidor digital autorizado de los cursos.</li>
                <li>Los pagos, la facturación, los reembolsos y la entrega del material digital están sujetos a los términos de uso y políticas de reembolso propios de <strong className="text-white">Hotmart</strong>.</li>
              </ul>
            </section>

            {/* Sección 3 */}
            <section className="space-y-3">
              <h2
                className="text-2xl sm:text-3xl font-bold text-gold"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                3. Propiedad Intelectual y Uso del Contenido
              </h2>
              <p>
                Todos los derechos de propiedad intelectual del diseño de este sitio web, estructura, logotipos, marcas comerciales, coreografías didácticas, textos, y el material fotográfico y audiovisual exhibido en las galerías de eventos:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li><strong className="text-white">Sesiones de Workshop</strong></li>
                <li><strong className="text-white">X Mystique - Castro, Chiloé</strong></li>
                <li><strong className="text-white">Vol. 4 - Bunny's Season</strong></li>
              </ul>
              <p className="mt-3">
                son de exclusiva propiedad de <strong className="text-gold">Like a SHH</strong> y de su creador, Maximiliano Velásquez, o bien han sido incluidos con la correspondiente autorización de sus titulares. Queda estrictamente prohibida la copia, reproducción, distribución, comunicación pública o transformación de dicho contenido sin una autorización previa y por escrito de los administradores.
              </p>
            </section>

            {/* Sección 4 */}
            <section className="space-y-3">
              <h2
                className="text-2xl sm:text-3xl font-bold text-gold"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                4. Exclusión de Responsabilidad y Salud
              </h2>
              <p>
                La práctica del pole dance, danza exotic y entrenamiento de flexibilidad conlleva exigencias físicas de nivel medio y alto. Al utilizar nuestro material educativo y participar de nuestros programas, el usuario declara estar en condiciones óptimas de salud y asume voluntariamente los riesgos físicos inherentes al ejercicio corporal.
              </p>
              <p>
                Like a SHH e Instructores no se responsabilizan por lesiones personales, daños de salud o accidentes sufridos por la ejecución inadecuada o sin supervisión de los ejercicios mostrados en los vídeos.
              </p>
            </section>

            {/* Sección 5 */}
            <section className="space-y-3">
              <h2
                className="text-2xl sm:text-3xl font-bold text-gold"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                5. Modificaciones y Ley Aplicable
              </h2>
              <p>
                Nos reservamos el derecho a modificar estos Términos y Condiciones en cualquier momento sin previo aviso. Cualquier modificación entrará en vigor inmediatamente después de su publicación en este sitio web.
              </p>
              <p>
                Para todos los efectos legales, estos términos se rigen por las leyes de la República de Chile. Cualquier controversia surgida del uso de este sitio web será sometida a la jurisdicción de los tribunales de justicia de Santiago de Chile.
              </p>
            </section>
          </div>

          {/* Footer inside Card */}
          <div className="border-t border-gold/20 pt-8 mt-12 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-black font-bold text-sm tracking-widest uppercase rounded-full hover:bg-gold-light transition-colors duration-300"
              id="bottom-back-home-terminos"
            >
              Volver al Inicio
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
