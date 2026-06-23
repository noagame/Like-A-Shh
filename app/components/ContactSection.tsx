"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, FormEvent } from "react";

export default function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // 1. Agregamos "mensaje" al estado inicial
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    mensaje: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para evitar doble envío
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sanitize = (value: string): string => {
    return value
      .replace(/[<>]/g, "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .trim();
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!formData.apellido.trim()) newErrors.apellido = "El apellido es requerido";
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Ingresa un email válido";
    }
    // Validación para el nuevo campo de mensaje
    if (!formData.mensaje.trim()) {
      newErrors.mensaje = "Por favor, escribe un mensaje";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);

      const sanitizedData = {
        nombre: sanitize(formData.nombre),
        apellido: sanitize(formData.apellido),
        email: sanitize(formData.email),
        mensaje: sanitize(formData.mensaje),
      };

      try {
        // --- API DE FORMSPREE ---
        // REEMPLAZA ESTA URL CON TU ENDPOINT REAL DE FORMSPREE
        const formspreeUrl = process.env.NEXT_PUBLIC_FORMSPREE_URL;
        if (!formspreeUrl) {
          console.error("Falta la URL de Formspree en las variables de entorno (.env.local)");
          alert("Error de configuración del formulario. Contacte al administrador.");
          setIsSubmitting(false);
          return;
        }

        const response = await fetch(formspreeUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sanitizedData),
        });

        if (response.ok) {
          setSubmitted(true);
          setFormData({ nombre: "", apellido: "", email: "", mensaje: "" });
          setTimeout(() => setSubmitted(false), 5000);
        } else {
          alert("Hubo un error al enviar el mensaje. Intenta nuevamente.");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("Error de conexión. Intenta nuevamente.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <section id="contacto" className="py-16 md:py-24 section-spacing" ref={ref}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="card-gold p-8 md:p-12">
            <h2
              className="text-3xl text-center sm:text-4xl md:text-5xl font-bold text-gold mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Ponerse en contacto
            </h2>
            <div className="w-24 h-1 bg-gold mx-auto my-4"></div>
            <p
              className="text-white/70 text-center mb-10 mt-8 text-lg"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              ¿Tienes alguna consulta o quieres agendar una clase? Déjanos tus datos y te contactaremos.
            </p>

            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 rounded-lg bg-gold/10 border border-gold/30 text-center"
              >
                <p className="text-gold font-medium text-lg" style={{ fontFamily: "var(--font-sans)" }}>
                  ✓ ¡Mensaje enviado con éxito! Te contactaremos pronto.
                </p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" id="contact-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <input
                    type="text"
                    id="contact-nombre"
                    placeholder="Nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="form-input w-full"
                    maxLength={50}
                    disabled={isSubmitting}
                  />
                  {errors.nombre && <p className="text-red-400 text-sm mt-2">{errors.nombre}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    id="contact-apellido"
                    placeholder="Apellido"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="form-input w-full"
                    maxLength={50}
                    disabled={isSubmitting}
                  />
                  {errors.apellido && <p className="text-red-400 text-sm mt-2">{errors.apellido}</p>}
                </div>
              </div>

              <div>
                <input
                  type="email"
                  id="contact-email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input w-full"
                  maxLength={100}
                  disabled={isSubmitting}
                />
                {errors.email && <p className="text-red-400 text-sm mt-2">{errors.email}</p>}
              </div>

              {/* 2. EL NUEVO CAMPO DE MENSAJE */}
              <div>
                <textarea
                  id="contact-mensaje"
                  placeholder="Escribe tu mensaje..."
                  value={formData.mensaje}
                  onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                  className="form-input w-full min-h-[120px] resize-y"
                  maxLength={500}
                  disabled={isSubmitting}
                ></textarea>
                {errors.mensaje && <p className="text-red-400 text-sm mt-2">{errors.mensaje}</p>}
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                className={`w-full py-4 border-2 border-gold font-bold text-sm tracking-widest uppercase rounded-lg transition-all duration-300 mt-4 
                  ${isSubmitting
                    ? "bg-gold/50 text-black/50 cursor-not-allowed border-gold/50"
                    : "text-gold hover:bg-gold hover:text-black"}`}
                id="contact-submit-btn"
              >
                {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}