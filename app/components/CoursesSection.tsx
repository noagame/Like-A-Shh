import { createClient } from "@/lib/supabase/server";
import AutoplayCarousel from "./AutoplayCarousel";
import PricingTable from "./PricingTable";

import {
  StandardProgramCard,
  CourseItem,
  ClassItem,
} from "./CourseCards";

const FALLBACK_SUPABASE_COURSE_IMAGE =
  "https://ssgcrrblxmmqurjlwope.supabase.co/storage/v1/object/public/galerias/cursos/curso_b4285aab-184e-4534-9398-1869ac6dd017.jpg";

export default async function CoursesSection() {
  const supabase = await createClient();

  // 1. Cursos de la base de datos
  const { data: rawCourses } = await supabase
    .from("courses")
    .select("id, title, description, image_url, url")
    .eq("status", "published")
    .order("order_index", { ascending: true });

  const { data: likesByCourse } = await supabase
    .from("course_likes")
    .select("course_id, user_id");

  const { data: userLikeRows } = await supabase.auth.getUser();
  const userId = userLikeRows.user?.id ?? null;

  const courseLikeMap = new Map<string, number>();
  (likesByCourse ?? []).forEach((row: { course_id: string }) => {
    courseLikeMap.set(row.course_id, (courseLikeMap.get(row.course_id) ?? 0) + 1);
  });

  const likedCourseIds = new Set(
    userId
      ? (likesByCourse ?? [])
          .filter((row: { course_id: string; user_id?: string }) => row.user_id === userId)
          .map((row: { course_id: string }) => row.course_id)
      : []
  );

  const allCourses: CourseItem[] = rawCourses ?? [];

  // 2. Curso Único Destacado de Flexibilidad (Hotmart)
  const flexCourse =
    allCourses.find(
      (c) =>
        c.title.toLowerCase().includes("flexibiliza") ||
        c.url.toLowerCase().includes("hotmart.com")
    ) || {
      id: "flex-default",
      title: "Flexibiliza tu Actitud by Maximiliano Velásquez",
      description:
        "Curso diseñado para mejorar tu flexibilidad y bienestar corporal a través de videos guiados paso a paso. Accede a rutinas específicas por grupos articulares y a ejercicios globales de movilidad, cuidadosamente estructurados para ayudarte a ganar mayor rango de movimiento, agilidad y control corporal.",
      image_url: FALLBACK_SUPABASE_COURSE_IMAGE,
      url: "https://hotmart.com/es/marketplace/productos/flexibiliza-tu-actitud-by-maximiliano-velasquez/A102579634L",
    };

  // 3. CARRUSEL 1: Solo Cursos Online de Hotmart
  const hotmartCoursesList = allCourses.filter(
    (c) =>
      c.url.toLowerCase().includes("hotmart.com") ||
      c.title.toLowerCase().includes("flexibiliza")
  );

  // Fallback si la BD aún no tiene los cursos creados
  const finalHotmartList =
    hotmartCoursesList.length > 0 ? hotmartCoursesList : [flexCourse];

  // 4. Clases y Sesiones desde la base de datos
  const { data: rawEvents } = await supabase
    .from("events")
    .select("id, title, description, start_time, location, image_url")
    .eq("status", "published")
    .order("start_time", { ascending: true });

  const allEvents: ClassItem[] = (rawEvents as unknown as ClassItem[]) ?? [];

  // 5. FILTRADO POR NOMBRE: Clases Presenciales vs Clases Online
  const presencialClassesRaw = allEvents.filter((e) =>
    e.title.toLowerCase().includes("presencial")
  );

  const onlineClassesRaw = allEvents.filter(
    (e) =>
      e.title.toLowerCase().includes("online") &&
      !e.title.toLowerCase().includes("flexibiliza")
  );

  // Clases por defecto (4 para cada carrusel con "Agenda aquí")
  const defaultPresencialClasses: ClassItem[] = [
    {
      id: "cp-1",
      title: "Clase Presencial Pole Sport",
      description: "Agenda tu clase particular Presencial de Pole Sport multinivel. Duración: 1 hora.",
      image_url: FALLBACK_SUPABASE_COURSE_IMAGE,
      url: "#",
    },
    {
      id: "cp-2",
      title: "Clase Presencial Exotic Pole",
      description: "Entrena técnica de tacos, fluidez y secuencias coreográficas de forma presencial.",
      image_url: FALLBACK_SUPABASE_COURSE_IMAGE,
      url: "#",
    },
    {
      id: "cp-3",
      title: "Clase Presencial Flexibilidad Activa",
      description: "Sesión presencial asistida para aperturas y arcos corporales seguros.",
      image_url: FALLBACK_SUPABASE_COURSE_IMAGE,
      url: "#",
    },
    {
      id: "cp-4",
      title: "Clase Presencial Chair & Floorwork",
      description: "Explora la danza y musicalidad en estudio con elementos escénicos.",
      image_url: FALLBACK_SUPABASE_COURSE_IMAGE,
      url: "#",
    },
  ];

  const defaultOnlineClasses: ClassItem[] = [
    {
      id: "co-1",
      title: "Clase Online Flexibilidad Sincrónica",
      description: "Agenda tu clase particular Online en vivo de Flexibilidad. Duración: 1 hora vía Zoom.",
      image_url: FALLBACK_SUPABASE_COURSE_IMAGE,
      url: "#",
    },
    {
      id: "co-2",
      title: "Clase Online Exotic Pole",
      description: "Agenda tu clase particular Online de Exotic Pole Multinivel vía Zoom.",
      image_url: FALLBACK_SUPABASE_COURSE_IMAGE,
      url: "#",
    },
    {
      id: "co-3",
      title: "Clase Online Fortalecimiento Muscular",
      description: "Acondicionamiento físico intensivo adaptado para practicar en casa.",
      image_url: FALLBACK_SUPABASE_COURSE_IMAGE,
      url: "#",
    },
    {
      id: "co-4",
      title: "Clase Online Articular Flow",
      description: "Movilidad y prevención de lesiones en sesiones sincrónicas guiadas.",
      image_url: FALLBACK_SUPABASE_COURSE_IMAGE,
      url: "#",
    },
  ];

  const presencialCarouselList = [
    ...presencialClassesRaw,
    ...defaultPresencialClasses.slice(presencialClassesRaw.length),
  ].slice(0, 4);

  const onlineClassesCarouselList = [
    ...onlineClassesRaw,
    ...defaultOnlineClasses.slice(onlineClassesRaw.length),
  ].slice(0, 4);

  return (
    <section id="cursos" className="py-16 md:py-24 section-spacing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-12 md:mb-16">
          <h2
            className="text-3xl font-bold text-gold gold-underline sm:text-4xl md:text-5xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Formación y Clases
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/60 sm:mt-6 sm:text-base md:text-lg">
            Accede a nuestros cursos formativos pregrabados y agenda tus clases en modalidad presencial u online.
          </p>
        </div>
        {/* 2. CARRUSEL 1: Solo Cursos Online Oficiales de Hotmart */}
        <AutoplayCarousel
          title="Cursos Online"
          subtitle="Programas formativos pregrabados con acceso continuo en Hotmart"
          interval={5000}
        >
          {finalHotmartList.map((curso) => (
            <StandardProgramCard
              key={curso.id}
              title={curso.title}
              description={curso.description}
              imageUrl={curso.image_url}
              badgeText="Curso Hotmart"
              buttonText="Acceder al Curso"
              url={curso.url}
              courseId={curso.id}
              liked={likedCourseIds.has(curso.id)}
              likesCount={courseLikeMap.get(curso.id) ?? 0}
            />
          ))}
        </AutoplayCarousel>

        {/* 3. CARRUSEL 2: Clases Planificadas Online */}
        <AutoplayCarousel
          title="Clases Particulares Online"
          subtitle="Sesiones particulares sincrónicas vía Zoom"
          interval={4000}
        >
          {onlineClassesCarouselList.map((clase) => (
            <StandardProgramCard
              key={clase.id}
              title={clase.title}
              description={clase.description || "Agenda tu clase particular online en vivo."}
              imageUrl={clase.image_url || FALLBACK_SUPABASE_COURSE_IMAGE}
              badgeText="Online en Vivo"
              buttonText="Agenda aquí"
              url={clase.url || "#"}
            />
          ))}
        </AutoplayCarousel>

        {/* 4. CARRUSEL 3: Clases Planificadas Presenciales */}
        <AutoplayCarousel
          title="Clases Particulares Presencial"
          subtitle="Entrenamiento personalizado directo en estudio"
          interval={4000}
        >
          {presencialCarouselList.map((clase) => (
            <StandardProgramCard
              key={clase.id}
              title={clase.title}
              description={clase.description || "Agenda tu clase presencial personalizada."}
              imageUrl={clase.image_url || FALLBACK_SUPABASE_COURSE_IMAGE}
              badgeText="Presencial en Estudio"
              buttonText="Agenda aquí"
              url={clase.url || "#"}
            />
          ))}
        </AutoplayCarousel>
        <PricingTable />
      </div>
    </section>
  );
}