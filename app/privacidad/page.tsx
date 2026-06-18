"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function PrivacidadPage() {
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
          id="back-to-home-privacidad"
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
              Políticas de Privacidad
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
              En <strong className="text-gold">Like a SHH</strong>, de propiedad de Maximiliano Velásquez, nos tomamos muy en serio la privacidad de nuestros usuarios y estudiantes. Esta política detalla cómo recopilamos, utilizamos y protegemos su información de conformidad con la legislación chilena vigente, específicamente la <strong className="text-gold">Ley N° 19.628 sobre Protección de la Vida Privada</strong>.
            </p>

            {/* Sección 1 */}
            <section className="space-y-3">
              <h2
                className="text-2xl sm:text-3xl font-bold text-gold"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                1. Información que recopilamos
              </h2>
              <p>
                Recopilamos información personal únicamente cuando interactúa voluntariamente con nuestro sitio web. Esto incluye:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li>
                  <strong className="text-white">Formulario de Contacto:</strong> Nombre, apellido, dirección de correo electrónico y el contenido del mensaje enviado. Esta información es procesada y resguardada de forma segura.
                </li>
                <li>
                  <strong className="text-white">Datos de Navegación:</strong> Dirección IP, cookies y datos de uso del sitio con fines de análisis estadístico y mejora de la experiencia de usuario.
                </li>
              </ul>
            </section>

            {/* Sección 2 */}
            <section className="space-y-3">
              <h2
                className="text-2xl sm:text-3xl font-bold text-gold"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                2. Uso de la información
              </h2>
              <p>
                La información personal recopilada se utiliza exclusivamente para los siguientes fines:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li>Responder a consultas, solicitudes de soporte técnico o agendamiento de clases.</li>
                <li>Proporcionar y gestionar el acceso a nuestros cursos online y contenidos adquiridos.</li>
                <li>Enviar notificaciones importantes sobre cambios en nuestros servicios o eventos exclusivos, siempre contando con su consentimiento previo de suscripción.</li>
              </ul>
            </section>

            {/* Sección 3 */}
            <section className="space-y-3">
              <h2
                className="text-2xl sm:text-3xl font-bold text-gold"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                3. Integración y Plataformas de Terceros
              </h2>
              <p>
                Para garantizar la operatividad de nuestros servicios y la seguridad de las transacciones comerciales, nos apoyamos en los siguientes proveedores especializados de servicios externos:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-white/70">
                <li>
                  <strong className="text-white">Formspree:</strong> El procesamiento y envío de los datos recolectados en el formulario de contacto se realiza a través de la plataforma Formspree, la cual opera bajo estrictos protocolos de cifrado y seguridad de la información.
                </li>
                <li>
                  <strong className="text-white">Hotmart:</strong> La venta, facturación, almacenamiento y reproducción de nuestros cursos online (tales como <em>"Flexibiliza tu Actitud"</em>) se gestiona íntegramente a través de Hotmart. En consecuencia, toda información transaccional, de pago y credenciales de acceso se rige por los términos y las políticas de seguridad propias de la plataforma Hotmart.
                </li>
              </ul>
            </section>

            {/* Sección 4 */}
            <section className="space-y-3">
              <h2
                className="text-2xl sm:text-3xl font-bold text-gold"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                4. Seguridad y Confidencialidad
              </h2>
              <p>
                Nos comprometemos a no vender, alquilar, transferir ni divulgar sus datos personales a terceros sin su consentimiento expreso, excepto cuando sea requerido por mandatos legales vigentes. Mantenemos medidas técnicas y organizativas razonables para proteger los datos personales contra pérdida, uso indebido, acceso no autorizado o alteración.
              </p>
            </section>

            {/* Sección 5 */}
            <section className="space-y-3">
              <h2
                className="text-2xl sm:text-3xl font-bold text-gold"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                5. Derechos ARCO
              </h2>
              <p>
                De acuerdo con la legislación chilena (Ley N° 19.628), usted es titular del control total sobre sus datos personales. Puede ejercer en cualquier momento sus derechos **ARCO** (Acceso, Rectificación, Cancelación y Oposición):
              </p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li><strong className="text-white">Acceso:</strong> Solicitar información sobre qué datos personales suyos poseemos.</li>
                <li><strong className="text-white">Rectificación:</strong> Corregir o actualizar cualquier dato erróneo o desactualizado.</li>
                <li><strong className="text-white">Cancelación:</strong> Solicitar la eliminación total de sus datos de nuestros registros.</li>
                <li><strong className="text-white">Oposición:</strong> Oponerse al tratamiento de sus datos para ciertos fines específicos.</li>
              </ul>
              <p className="mt-4">
                Para ejercer cualquiera de estos derechos, por favor póngase en contacto con nosotros escribiéndonos por medio de nuestro canal de WhatsApp o al correo electrónico de contacto oficial.
              </p>
            </section>
          </div>

          {/* Footer inside Card */}
          <div className="border-t border-gold/20 pt-8 mt-12 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-black font-bold text-sm tracking-widest uppercase rounded-full hover:bg-gold-light transition-colors duration-300"
              id="bottom-back-home-privacidad"
            >
              Volver al Inicio
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
