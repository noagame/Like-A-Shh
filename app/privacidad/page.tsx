import Link from "next/link";

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-black text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl">
        <div className="mb-8 border-b border-white/10 pb-6">
          <Link href="/" className="text-gold text-xs uppercase tracking-widest hover:underline mb-3 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gold" style={{ fontFamily: "var(--font-serif)" }}>
            Términos de Servicio y Política de Privacidad
          </h1>
          <p className="text-white/50 text-xs mt-2 font-mono">
            Versión: politica-privacidad-v2-ley21719-2026 | Cumplimiento Ley Nº 21.719 (Chile)
          </p>
        </div>

        <div className="space-y-8 text-sm text-white/80 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gold mb-2">1. Responsable del Tratamiento de Datos</h2>
            <p>
              La plataforma <strong>Like a SHH</strong>, con operaciones en la República de Chile, actúa como Responsable del Tratamiento de sus datos personales, adoptando los estándares de seguridad técnicos, organizativos y legales establecidos en la <strong>Ley Nº 21.719</strong> sobre Protección de Datos Personales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gold mb-2">2. Finalidad del Tratamiento de Datos Personales</h2>
            <p>Los datos recabados se tratan estrictamente para:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-white/70">
              <li>Autenticación, seguridad y administración de perfiles de usuario.</li>
              <li>Gestión de membresías, reserva de cupos e inscripción a workshops y clases.</li>
              <li>Comunicaciones directas sobre confirmaciones horarias, estados de cuenta y cancelaciones.</li>
              <li>Acreditación de consentimiento y trazabilidad de accesos conforme a la ley.</li>
            </ul>
          </section>

          <section className="bg-white/5 border border-gold/30 rounded-xl p-5">
            <h2 className="text-lg font-bold text-gold mb-2">3. Panel de Análisis y Anonimización de Datos</h2>
            <p>
              Like a SHH dispone de un <strong>Panel Analítico y de Inteligencia de Negocio</strong> para optimizar la planificación de talleres, aforos y rendimiento de la plataforma. Respecto a este procesamiento se establece expresamente que:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-white/70">
              <li>
                <strong>Disociación y Anonimización Completa:</strong> Toda métrica visualizada en paneles de administración (como registros semanales, tasa de ocupación de clases y volumen de acciones) se procesa de forma agregada y anónima.
              </li>
              <li>
                <strong>Imposibilidad de Reidentificación:</strong> Los algoritmos y vistas de base de datos no asocian nombres, correos ni datos identificables con las tendencias estadísticas globales.
              </li>
              <li>
                <strong>Estándar Legal:</strong> Conforme al principio de limitación de la finalidad de la Ley 21.719, los datos con fines estadísticos o de medición técnica operan bajo mecanismos de desvinculación irreversible.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gold mb-2">4. Datos Sensibles y Carácter Opcional</h2>
            <p>
              Conforme a la normativa chilena, los datos relativos al género u otros catalogados como sensibles son estrictamente <strong>facultativos</strong> y no condicionan el acceso a los servicios de la plataforma. El dato de fecha de nacimiento es solicitado exclusivamente para verificar el cumplimiento de mayoría de edad (18 años) requerido para la práctica física y contratación de servicios.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gold mb-2">5. Ejercicio de Derechos del Titular (ARCO)</h2>
            <p>Usted puede ejercer en cualquier momento y sin costo sus derechos de:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-white/70">
              <li><strong>Acceso:</strong> Conocer qué información personal se encuentra almacenada.</li>
              <li><strong>Rectificación:</strong> Modificar datos desactualizados, erróneos o incompletos.</li>
              <li><strong>Cancelación / Supresión:</strong> Solicitar la eliminación total de su cuenta y registros personales.</li>
              <li><strong>Oposición y Bloqueo:</strong> Oponerse a tratamientos específicos o solicitar suspensión temporal.</li>
            </ul>
            <p className="mt-2 text-white/60">
              Para canalizar solicitudes ARCO, puede comunicarse directamente mediante los canales de contacto oficiales o desde los ajustes de su cuenta de usuario.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gold mb-2">6. Conservación y Registro de Trazabilidad</h2>
            <p>
              En cumplimiento del deber de acreditación de la Ley 21.719, la plataforma almacena registros inmutables de consentimiento (dirección IP de origen, versión de política aceptada, identificador de usuario y marca temporal) para garantizar certeza jurídica en cada interacción.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex justify-between items-center text-xs text-white/40">
          <span>Like a SHH © 2026</span>
          <span>Regulado por la legislación de la República de Chile</span>
        </div>
      </div>
    </main>
  );
}