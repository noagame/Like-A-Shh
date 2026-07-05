"use client";

import { m, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";

const instructorImages = [
  { id: 1, src: "/assets/Perfil/IMG_8175.JPG", alt: "Maximiliano Velásquez" },
  { id: 2, src: "/assets/Perfil/IMG_8176.JPG", alt: "Maximiliano Velásquez Exotic" },
  { id: 3, src: "/assets/Perfil/IMG_8178.JPG", alt: "Maximiliano Velásquez Flex" },
  { id: 4, src: "/assets/Perfil/IMG_8180.JPG", alt: "Maximiliano Velásquez Barra" },
];

export default function AboutSection() {
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const isInView1 = useInView(ref1, { once: true, margin: "-100px" });
  const isInView2 = useInView(ref2, { once: true, margin: "-100px" });
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const autoplayTimer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % instructorImages.length);
    }, 2000);
    return () => clearInterval(autoplayTimer);
  }, []);

  return (
    <section className="py-16 md:py-24 section-spacing">
      {/* Sobre Nosotros */}
      <div
        ref={ref1}
        className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-16 xl:px-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Imagen Equipo Like a Shh en la ruta /assets/Like Team/like_team.jpeg */}
          <m.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView1 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <div className="relative aspect-[3/3] pt-10">
              <div className="w-full h-full">
                <div className="text-center">
                  <div className="w-full max-w-md mx-auto lg:max-w-none">
                    <Image
                      src="/assets/Like Team/like_team.jpeg"
                      alt="Equipo de Like a Shh"
                      className="object-cover rounded-[2rem] shadow-2xl shadow-gold/5"
                      width={350}
                      height={350}
                    />
                  </div>
                </div>
              </div>
            </div>
          </m.div>
          {/* Texto Sobre nosotros */}
          <m.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView1 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-2 flex flex-col"
          >
            {/* Subtitulo "Sobre Nosotros" */}
            <h2
              className="text-5xl sm:text-6xl md:text-[5.2 rem] font-bold text-gold leading-[1.1]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Sobre<br />Nosotros
            </h2>
            {/* Párrafo */}
            <div className="pt-10">
              <p
                className="text-white/80 leading-relaxed text-base sm:text-lg text-justify"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Like A SHH es una propuesta artística y escénica que
                fusiona pole dance, performance, danza y estética
                visual en experiencias inmersivas y contemporáneas. Su
                enfoque combina técnica, expresión corporal y
                presencia escénica, potenciando el movimiento como
                una herramienta de arte, narrativa y autenticidad.
              </p>
            </div>
            <div className="pt-10">
              <p
                className="text-white/80 leading-relaxed text-base sm:text-lg text-justify"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                La marca busca crear un espacio creativo, inclusivo y
                profesional, donde cada puesta en escena tenga
                identidad propia y donde el pole pueda explorarse
                desde una mirada más elegante, experimental y
                performática. Más que solo entrenamiento, Like A SHH
                impulsa la conexión entre cuerpo, emoción y
                espectáculo.
              </p>
            </div>
          </m.div>

        </div>
      </div>

      {/* Sección Instructor */}
      <div
        ref={ref2}
        className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-16 xl:px-20 md:mt-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Bio */}
          <m.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView2 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="order-1 flex flex-col"
          >
            {/* Titulo H3 "Fundador & Instructor"*/}
            <h3
              className="text-gold/80 text-sm pt-10 lg:pt-20 md:text-base tracking-widest mb-3"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Fundador & Instructor Principal
            </h3>
            <br />

            {/* Titulo H2 "Maximiliano Velásquez"*/}
            <h2
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-gold leading-[1.1]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Maximiliano Velásquez
            </h2>

            {/* Texto de la bio*/}
            <div className="pt-10">
              <p
                className="text-white/80 leading-relaxed text-base sm:text-lg text-justify"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Hola mi nombre es Maximiliano Velásquez.
                Profesor de Eduación Física, Deportes y
                Recreación; Magíster en Motricidad Infantil;
                Instructor de Pole Dance, Flexibilidad y
                Presscripción Física para la Tercera Edad.
              </p>
            </div>
            <div className="pt-10">
              <p
                className="text-white/80 leading-relaxed text-base sm:text-lg text-justify"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Mi trabajo se caracteriza por fusionar técnica,
                estética visual y narrativa performática,
                impulsando una visión más artística,
                profesional y contemporánea del pole dance.
                Como entrenador de competencia, he guiado a
                diversos atletas y artistas hacia podios
                nacionales e internacionales, destacando por
                su enfoque integral en técnica, presencia
                escénica e identidad artística.
              </p>
            </div>

            <div className="mt-10 flex items-center gap-5 bg-dark-card/40 p-5 rounded-2xl border border-gold/10 shadow-lg shadow-gold/5">
              <svg width="6" height="40" viewBox="0 0 6 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <rect width="6" height="40" rx="3" fill="#D4AF37" />
              </svg>
              <h5
                className="text-[#D4AF37] italic text-lg sm:text-xl font-medium tracking-wide"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                &quot;El movimiento es la llave que desbloquea tu verdadero potencial.&quot;
              </h5>
            </div>
          </m.div>

          {/* Carrusel con fotos de Instructor */}
          <m.div
            initial={{ opacity: 0, x: 50 }} // Entra desde la derecha
            animate={isInView2 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 pl-30"
          >
            <Image
              src={instructorImages[currentSlide].src}
              alt={instructorImages[currentSlide].alt}
              className="object-cover rounded-[2rem] shadow-2xl shadow-gold/5"
              width={400}
              height={350}
            />

            {/* Controladores de Carrusel de Imagenes*/}
            <div className="flex items-center justify-center gap-3 mt-6">
              {instructorImages.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setCurrentSlide(img.id - 1)}
                  className={`carousel-dot ${img.id - 1 === currentSlide ? "active bg-gold w-6 roundend-md" : "bg-gold/30"}`}
                  aria-label={`Slide ${img.id}`}
                  id={`instructor-carousel-dot-${img.id}`}
                />
              ))}
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
