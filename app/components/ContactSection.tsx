"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, FormEvent } from "react";

export default function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
  });
  const [submitted, setSubmitted] = useState(false);
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

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = "El apellido es requerido";
    } else if (formData.apellido.trim().length < 2) {
      newErrors.apellido = "El apellido debe tener al menos 2 caracteres";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Ingresa un email válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const sanitizedData = {
        nombre: sanitize(formData.nombre),
        apellido: sanitize(formData.apellido),
        email: sanitize(formData.email),
      };
      console.log("Form submitted:", sanitizedData);
      setSubmitted(true);
      setFormData({ nombre: "", apellido: "", email: "" });
      setTimeout(() => setSubmitted(false), 4000);
    }
  };

  return (
    <section id="contacto" className="py-16 md:py-24 section-spacing" ref={ref}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="card-gold p-6 md:p-10">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-gold mb-2 text-center gold-underline"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Ponerse en contacto
            </h2>
            <p
              className="text-white/50 text-center mb-10 mt-6"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              ¿Tienes alguna consulta? Déjanos tus datos y te contactaremos.
            </p>

            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg bg-gold/10 border border-gold/30 text-center"
              >
                <p className="text-gold font-medium" style={{ fontFamily: "var(--font-sans)" }}>
                  ✓ ¡Mensaje enviado con éxito! Te contactaremos pronto.
                </p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8" id="contact-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contact-nombre" className="sr-only">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="contact-nombre"
                    placeholder="Nombre"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className="form-input"
                    maxLength={50}
                  />
                  {errors.nombre && (
                    <p className="text-red-400 text-xs mt-2">{errors.nombre}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="contact-apellido" className="sr-only">
                    Apellido
                  </label>
                  <input
                    type="text"
                    id="contact-apellido"
                    placeholder="Apellido"
                    value={formData.apellido}
                    onChange={(e) =>
                      setFormData({ ...formData, apellido: e.target.value })
                    }
                    className="form-input"
                    maxLength={50}
                  />
                  {errors.apellido && (
                    <p className="text-red-400 text-xs mt-2">{errors.apellido}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="contact-email" className="sr-only">
                  Email
                </label>
                <input
                  type="email"
                  id="contact-email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="form-input"
                  maxLength={100}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-2">{errors.email}</p>
                )}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 border-2 border-gold text-gold font-bold text-sm tracking-widest uppercase rounded-lg hover:bg-gold hover:text-black transition-all duration-300"
                id="contact-submit-btn"
              >
                Enviar
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
