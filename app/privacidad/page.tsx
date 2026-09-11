import Link from "next/link";

export default function PrivacidadPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-4 py-16 text-white sm:px-6 md:py-24 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mb-8 border-b border-white/10 pb-6">
          <Link href="/" className="mb-3 inline-block text-xs uppercase tracking-widest text-gold hover:underline">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-gold sm:text-4xl" style={{ fontFamily: "var(--font-serif)" }}>
            Política de Privacidad
          </h1>
          <p className="mt-2 font-mono text-xs text-white/50">
            Versión: privacidad-v3-2026-09 | Última actualización: 11 de septiembre de 2026
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-white/80">
          <section>
            <h2 className="mb-2 text-lg font-bold text-gold">1. Responsable y alcance</h2>
            <p>Like a SHH, con operaciones en Chile, es responsable del tratamiento de los datos personales que recopila a través de esta plataforma. Esta política explica qué datos usamos, con qué finalidad y qué controles tiene cada persona usuaria.</p>
            <p className="mt-2 text-white/60">Actualmente aplica la Ley N.º 19.628. La Ley N.º 21.719 entrará en vigencia el 1 de diciembre de 2026; Like a SHH adopta progresivamente sus principios de finalidad, proporcionalidad, seguridad y responsabilidad proactiva.</p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-gold">2. Datos que tratamos</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-white/70">
              <li>Datos de cuenta: nombre, correo electrónico, contraseña cifrada y fecha de creación.</li>
              <li>Datos de perfil y contacto: teléfono, fecha de nacimiento y campos opcionales que decidas completar.</li>
              <li>Datos de servicio: reservas, asistencia, clases, solicitudes y comunicaciones relacionadas con tu cuenta.</li>
              <li>Datos técnicos y de seguridad: registros de consentimiento, dirección IP, fecha, hora y versión de la política aceptada.</li>
            </ul>
            <p className="mt-2 text-white/60">No solicitamos datos que no sean necesarios para los fines indicados. Los campos opcionales no condicionan el acceso, salvo los datos mínimos necesarios para gestionar una reserva o verificar la mayoría de edad.</p>
          </section>

          <section className="rounded-xl border border-[#48CAE4]/30 bg-[#48CAE4]/5 p-5">
            <h2 className="mb-2 text-lg font-bold text-[#48CAE4]">3. Uso de correo y número telefónico para notificaciones</h2>
            <p>El correo electrónico y, cuando lo proporciones, tu número telefónico podrán utilizarse para enviarte notificaciones vinculadas al servicio. Esto incluye confirmaciones de reserva, cambios de horario o ubicación, recordatorios, cancelaciones, información necesaria para una clase, seguridad de la cuenta y respuestas a solicitudes que realices.</p>
            <p className="mt-2">En futuras implementaciones, estas notificaciones podrán enviarse por correo electrónico, SMS, WhatsApp u otro canal de mensajería habilitado por Like a SHH. Usaremos el canal que hayas informado o elegido y solo para comunicaciones relacionadas con el servicio contratado, reservado o solicitado.</p>
            <p className="mt-2 text-white/65">Las promociones, novedades comerciales y campañas de marketing requerirán una autorización separada y opcional. No dejaremos de prestar el servicio ni cancelaremos una reserva por no aceptar comunicaciones promocionales.</p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-gold">4. Finalidades y base de uso</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-white/70">
              <li>Crear y proteger cuentas, prevenir fraude y resolver incidencias de seguridad.</li>
              <li>Gestionar reservas, cupos, asistencia, clases, talleres y comunicaciones operativas asociadas.</li>
              <li>Responder consultas y solicitudes de privacidad, soporte o ejercicio de derechos.</li>
              <li>Mejorar el funcionamiento de la plataforma mediante métricas agregadas y no identificables cuando sea posible.</li>
              <li>Acreditar el consentimiento y cumplir obligaciones legales o requerimientos de autoridades competentes.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-gold">5. Compartición y proveedores</h2>
            <p>No vendemos ni arrendamos tus datos personales. Podemos usar proveedores tecnológicos para autenticación, base de datos, almacenamiento, envío de correos, mensajería o pagos. Estos proveedores solo podrán tratar los datos necesarios para prestar su servicio y bajo instrucciones de Like a SHH o sus propias políticas cuando actúen como responsables independientes.</p>
            <p className="mt-2 text-white/60">Las compras de cursos redirigidas a Hotmart se rigen también por las políticas de Hotmart. Like a SHH no recibe ni almacena datos completos de tarjetas de pago procesadas en esa plataforma.</p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-gold">6. Conservación y seguridad</h2>
            <p>Conservamos los datos mientras exista una cuenta activa, una reserva o relación de servicio, y por el tiempo adicional necesario para cumplir obligaciones legales, resolver controversias o proteger la seguridad de la plataforma. Aplicamos controles de acceso, cifrado cuando corresponde, registro de consentimientos y restricciones de permisos para reducir accesos no autorizados.</p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-gold">7. Tus derechos y controles</h2>
            <p>Puedes solicitar acceso, rectificación, supresión, oposición, bloqueo o portabilidad cuando corresponda. Desde tu perfil puedes actualizar datos, ocultar campos opcionales o solicitar eliminar tu cuenta.</p>
            <p className="mt-2 text-white/60">También puedes actualizar o retirar tu número telefónico para dejar de recibir futuras notificaciones por ese canal. Las comunicaciones estrictamente necesarias para una reserva vigente o la seguridad de tu cuenta podrán seguir enviándose por el canal de contacto disponible.</p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-gold">8. Cambios a esta política</h2>
            <p>Cuando realicemos cambios relevantes, publicaremos la nueva versión en esta página y, cuando corresponda, solicitaremos una nueva aceptación o informaremos mediante los canales de contacto registrados.</p>
          </section>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-white/40">
          <span>Like a SHH © 2026</span>
          <span>Legislación de la República de Chile</span>
        </div>
      </div>
    </main>
  );
}
