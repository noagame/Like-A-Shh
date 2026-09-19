import { createClient } from "@/lib/supabase/server";
import AutoplayCarousel from "./AutoplayCarousel";
import PricingTable from "./PricingTable";

import { StandardProgramCard, CourseItem, ClassItem } from "./CourseCards";

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

  // Los cursos administrados desde /admin/cursos también pueden representar
  // modalidades de clase. El título es el criterio solicitado para ubicarlos
  // en el carrusel correcto, sin excluir las sesiones fechadas de la agenda.
  const onlineCourses = allCourses.filter((course) =>
    course.title.toLocaleLowerCase("es-CL").includes("online")
  );
  const presencialCourses = allCourses.filter((course) =>
    course.title.toLocaleLowerCase("es-CL").includes("presencial")
  );

  // Fallback si la BD aún no tiene los cursos creados
  const finalHotmartList =
    hotmartCoursesList.length > 0 ? hotmartCoursesList : [flexCourse];

  // 4. Sesiones programadas. La landing y /admin/eventos leen la misma tabla.
  const { data: rawEvents } = await supabase
    .from("events")
    .select("id, title, description, start_time, location, image_url, categories(name)")
    .eq("status", "published")
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true });

  type ScheduledClass = ClassItem & { categories: { name: string } | null };
  const allEvents: ScheduledClass[] = (rawEvents as unknown as ScheduledClass[]) ?? [];

  const categoryOrTitle = (event: ScheduledClass) =>
    `${event.categories?.name ?? ""} ${event.title}`.toLocaleLowerCase("es-CL");

  // La categoría es la fuente de verdad; el título solo respalda sesiones antiguas.
  const presencialClasses = allEvents.filter((event) => categoryOrTitle(event).includes("presencial"));

  const onlineClasses = allEvents.filter((event) => categoryOrTitle(event).includes("online"));

  const emptySessionCard = (message: string) => (
    <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center text-sm leading-relaxed text-white/55">
      {message}
    </div>
  );

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
          {onlineCourses.length + onlineClasses.length > 0
            ? [
                ...onlineCourses.map((course) => (
                  <StandardProgramCard
                    key={`course-${course.id}`}
                    title={course.title}
                    description={course.description}
                    imageUrl={course.image_url}
                    badgeText="Clase Online"
                    buttonText="Agenda aquí"
                    url={course.url}
                    courseId={course.id}
                    liked={likedCourseIds.has(course.id)}
                    likesCount={courseLikeMap.get(course.id) ?? 0}
                  />
                )),
                ...onlineClasses.map((clase) => (
                  <StandardProgramCard
                    key={`event-${clase.id}`}
                    title={clase.title}
                    description={clase.description || "Agenda tu clase particular online en vivo."}
                    imageUrl={clase.image_url || FALLBACK_SUPABASE_COURSE_IMAGE}
                    badgeText="Online en Vivo"
                    buttonText="Agenda aquí"
                    url="/mi-cuenta/explorar"
                  />
                )),
              ]
            : [emptySessionCard("No hay clases online programadas por ahora. Vuelve pronto para revisar la agenda.")]}
        </AutoplayCarousel>

        {/* 4. CARRUSEL 3: Clases Planificadas Presenciales */}
        <AutoplayCarousel
          title="Clases Particulares Presencial"
          subtitle="Entrenamiento personalizado directo en estudio"
          interval={4000}
        >
          {presencialCourses.length + presencialClasses.length > 0
            ? [
                ...presencialCourses.map((course) => (
                  <StandardProgramCard
                    key={`course-${course.id}`}
                    title={course.title}
                    description={course.description}
                    imageUrl={course.image_url}
                    badgeText="Clase Presencial"
                    buttonText="Agenda aquí"
                    url={course.url}
                    courseId={course.id}
                    liked={likedCourseIds.has(course.id)}
                    likesCount={courseLikeMap.get(course.id) ?? 0}
                  />
                )),
                ...presencialClasses.map((clase) => (
                  <StandardProgramCard
                    key={`event-${clase.id}`}
                    title={clase.title}
                    description={clase.description || "Agenda tu clase presencial personalizada."}
                    imageUrl={clase.image_url || FALLBACK_SUPABASE_COURSE_IMAGE}
                    badgeText="Presencial en Estudio"
                    buttonText="Agenda aquí"
                    url="/mi-cuenta/explorar"
                  />
                )),
              ]
            : [emptySessionCard("No hay clases presenciales programadas por ahora. Vuelve pronto para revisar la agenda.")]}
        </AutoplayCarousel>
        <PricingTable />
      </div>
    </section>
  );
}
