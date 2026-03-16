/**
 * Términos y Condiciones — LIKE A SHH
 * ═══════════════════════════════════════════
 * Componente React estático con el texto legal.
 * Cumplimiento de privacidad de datos.
 */

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-brand-black text-brand-muted font-body">
      <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-white mb-3">
            Términos y Condiciones
          </h1>
          <p className="text-sm text-brand-muted">
            Última actualización: Marzo 2025
          </p>
        </div>

        <div className="prose-sm space-y-8 text-brand-muted leading-relaxed text-sm">
          {/* 1 */}
          <section>
            <h2 className="font-heading font-bold text-lg text-white mb-3">
              1. Información General
            </h2>
            <p>
              Los presentes Términos y Condiciones de Uso regulan el acceso y la utilización de la
              plataforma web <strong className="text-white">LIKE A SHH</strong> (en adelante, "la
              Plataforma"), operada por Maximiliano Velásquez (en adelante, "el Instructor" o "la
              Academia"), dedicada a la enseñanza de Pole Dance, Pole Exotic, Pole Sport, Floorwork,
              Flexibilidad y Fortalecimiento Muscular, tanto en modalidad online como presencial.
            </p>
            <p className="mt-2">
              Al registrarte y utilizar la Plataforma, declaras que has leído, comprendido y aceptado
              estos Términos en su totalidad. Si no estás de acuerdo con alguno de ellos, te pedimos
              que no utilices nuestros servicios.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="font-heading font-bold text-lg text-white mb-3">
              2. Registro y Cuenta de Usuario
            </h2>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>
                Para acceder a los cursos y contenidos exclusivos, deberás crear una cuenta
                proporcionando un correo electrónico válido y una contraseña segura (mínimo 8
                caracteres).
              </li>
              <li>
                Eres responsable de mantener la confidencialidad de tus credenciales de acceso.
              </li>
              <li>
                La cuenta es personal e intransferible. Compartir tus credenciales con terceros podrá
                resultar en la suspensión de tu cuenta sin derecho a reembolso.
              </li>
              <li>
                Debes aceptar estos Términos y la Política de Privacidad durante el proceso de
                registro.
              </li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="font-heading font-bold text-lg text-white mb-3">
              3. Servicios Ofrecidos
            </h2>
            <p>
              La Plataforma ofrece los siguientes servicios:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2 mt-2">
              <li>
                <strong className="text-white">Cursos Online:</strong> Programas de formación en
                video alojados en plataformas de terceros (Hotmart). El acceso, duración y
                disponibilidad de cada curso se especifican en su ficha técnica.
              </li>
              <li>
                <strong className="text-white">Clases Presenciales y Workshops:</strong> Eventos
                que se publicarán en el calendario del instructor dentro de la Plataforma, sujetos a
                disponibilidad de cupo.
              </li>
              <li>
                <strong className="text-white">Contenido Gratuito:</strong> Galerías, testimonios y
                material de divulgación accesible públicamente.
              </li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="font-heading font-bold text-lg text-white mb-3">
              4. Pagos y Política de Reembolso
            </h2>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>
                Los pagos de los cursos online se procesan a través de{' '}
                <strong className="text-white">Hotmart</strong>, una plataforma de terceros. LIKE A
                SHH no almacena información financiera ni datos de tarjetas de crédito.
              </li>
              <li>
                La política de reembolso se rige por los términos de la plataforma de pago
                correspondiente (consultar la política de Hotmart).
              </li>
              <li>
                Las clases presenciales pagadas podrán reprogramarse con un aviso mínimo de 24 horas
                de anticipación. Sin aviso previo, no se realizará reembolso.
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="font-heading font-bold text-lg text-white mb-3">
              5. Propiedad Intelectual
            </h2>
            <p>
              Todo el contenido de la Plataforma, incluyendo pero no limitado a: videos, fotografías,
              textos, logotipos, coreografías, rutinas de entrenamiento, diseño gráfico y estructura
              del sitio web, es propiedad de LIKE A SHH y/o del Instructor.
            </p>
            <p className="mt-2">
              Queda estrictamente prohibido reproducir, distribuir, transmitir, modificar o utilizar
              cualquier material de la Plataforma con fines comerciales sin autorización previa y
              escrita del titular.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="font-heading font-bold text-lg text-white mb-3">
              6. Política de Privacidad y Protección de Datos
            </h2>
            <p>
              En cumplimiento con las normativas de protección de datos personales aplicables:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2 mt-2">
              <li>
                <strong className="text-white">Datos recopilados:</strong> Correo electrónico,
                nombre (opcional), datos de interacción con la plataforma (comentarios, progreso de
                cursos).
              </li>
              <li>
                <strong className="text-white">Finalidad:</strong> Gestión de tu cuenta,
                personalización del servicio, comunicaciones relacionadas con los cursos.
              </li>
              <li>
                <strong className="text-white">Almacenamiento:</strong> Tus datos se almacenan en
                servidores seguros con cifrado. Las contraseñas se almacenan hasheadas con algoritmos
                de cifrado unidireccional (bcrypt).
              </li>
              <li>
                <strong className="text-white">No compartimos</strong> tus datos personales con
                terceros, excepto los procesadores de pago necesarios para completar transacciones.
              </li>
              <li>
                <strong className="text-white">Derechos del usuario:</strong> Puedes solicitar en
                cualquier momento el acceso, rectificación o eliminación de tus datos personales
                enviando un correo a{' '}
                <a
                  href="mailto:academialikeashh@gmail.com"
                  className="text-brand-gold hover:underline"
                >
                  academialikeashh@gmail.com
                </a>
                .
              </li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="font-heading font-bold text-lg text-white mb-3">
              7. Responsabilidad y Exención
            </h2>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>
                La práctica de Pole Dance, Floorwork y actividades de acondicionamiento físico
                implican un riesgo inherente de lesiones. Al inscribirte, declaras que participas
                bajo tu propia responsabilidad.
              </li>
              <li>
                Se recomienda consultar con un profesional médico antes de iniciar cualquier programa
                de ejercicio físico.
              </li>
              <li>
                LIKE A SHH no se hace responsable por lesiones, daños físicos o materiales derivados
                de la práctica de las técnicas enseñadas fuera del entorno supervisado.
              </li>
              <li>
                La Plataforma se proporciona "tal cual". No garantizamos la disponibilidad
                ininterrumpida del servicio, aunque nos esforzaremos al máximo para mantenerlo
                operativo.
              </li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2 className="font-heading font-bold text-lg text-white mb-3">
              8. Código de Conducta
            </h2>
            <p>
              Los usuarios se comprometen a:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2 mt-2">
              <li>Tratar con respeto al instructor, al equipo y a otros alumnos.</li>
              <li>
                No publicar contenido ofensivo, discriminatorio o inapropiado en los comentarios o
                feedback de la Plataforma.
              </li>
              <li>
                No utilizar la Plataforma para actividades ilegales o no autorizadas.
              </li>
            </ul>
            <p className="mt-2">
              El incumplimiento del código de conducta podrá resultar en la suspensión permanente
              de la cuenta sin derecho a reembolso.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="font-heading font-bold text-lg text-white mb-3">
              9. Uso de Cookies
            </h2>
            <p>
              La Plataforma utiliza cookies técnicas y funcionales estrictamente necesarias para el
              correcto funcionamiento del sitio web (autenticación, sesión de usuario). No
              utilizamos cookies de seguimiento publicitario de terceros.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="font-heading font-bold text-lg text-white mb-3">
              10. Modificaciones de los Términos
            </h2>
            <p>
              LIKE A SHH se reserva el derecho de modificar estos Términos y Condiciones en
              cualquier momento. Las modificaciones entrarán en vigor a partir de su publicación en
              la Plataforma. Se notificará a los usuarios registrados por correo electrónico ante
              cambios sustanciales.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="font-heading font-bold text-lg text-white mb-3">
              11. Contacto
            </h2>
            <p>
              Para consultas, reclamaciones o ejercicio de derechos sobre tus datos, puedes
              contactarnos a través de:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2 mt-2">
              <li>
                <strong className="text-white">Email:</strong>{' '}
                <a
                  href="mailto:academialikeashh@gmail.com"
                  className="text-brand-gold hover:underline"
                >
                  academialikeashh@gmail.com
                </a>
              </li>
              <li>
                <strong className="text-white">Instagram:</strong>{' '}
                <a
                  href="https://www.instagram.com/_likeashh_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-gold hover:underline"
                >
                  @_likeashh_
                </a>
              </li>
            </ul>
          </section>

          {/* Separador final */}
          <div className="pt-6 border-t border-brand-gray/20 text-center">
            <p className="text-xs text-brand-muted/50">
              © {new Date().getFullYear()} LIKE A SHH — Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsAndConditions
