"use client";

import { useId, useState } from "react";
import { createPortal } from "react-dom";
import { unstable_rethrow } from "next/navigation";
import { createCourse, updateCourse } from "./actions";
import { resolveCourseLink } from "@/lib/course-links";

type EditableCourse = {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  link_label?: string | null;
  status: string;
};

function courseValues(course?: EditableCourse) {
  return {
    title: course?.title ?? "",
    description: course?.description ?? "",
    url: course?.url && course.url !== "#" ? course.url : "",
    link_label: course?.link_label ?? "",
    status: course?.status ?? "published",
  };
}

export default function CourseModal({ course }: { course?: EditableCourse }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [values, setValues] = useState(() => courseValues(course));
  const formId = useId();
  const editing = Boolean(course);

  return (
    <>
      <button
        onClick={() => { setValues(courseValues(course)); setSubmitError(null); setIsOpen(true); }}
        className="bg-gold text-black text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-gold-light transition-all cursor-pointer shadow-lg shadow-gold/10"
      >
        {editing ? "Editar" : "+ Nuevo Curso"}
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto pt-16 pb-16">
          <div role="dialog" aria-modal="true" aria-labelledby={`${formId}-heading`} className="bg-black/90 border border-white/10 rounded-2xl text-white max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-auto">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 id={`${formId}-heading`} className="text-xl font-bold text-gold" style={{ fontFamily: "var(--font-serif)" }}>
                {editing ? "Editar Curso" : "Crear Nuevo Curso"}
              </h2>
              <button aria-label="Cerrar formulario" disabled={isSubmitting} onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white text-lg">
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                setIsSubmitting(true);
                setSubmitError(null);
                try {
                  if (course) await updateCourse(course.id, formData);
                  else await createCourse(formData);
                  setIsOpen(false);
                } catch (error) {
                  unstable_rethrow(error);
                  setSubmitError("No se pudo guardar el curso. Intenta nuevamente.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor={`${formId}-title`} className="block text-xs font-medium text-white/70 mb-1">Título del Curso *</label>
                <input
                  id={`${formId}-title`}
                  type="text"
                  name="title"
                  required
                  maxLength={200}
                  value={values.title}
                  onChange={(event) => setValues({ ...values, title: event.target.value })}
                  placeholder="Ej. Flexibiliza tu Actitud"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold outline-none"
                />
              </div>

              <div>
                <label htmlFor={`${formId}-description`} className="block text-xs font-medium text-white/70 mb-1">Descripción Completa *</label>
                <textarea
                  id={`${formId}-description`}
                  name="description"
                  required
                  value={values.description}
                  onChange={(event) => setValues({ ...values, description: event.target.value })}
                  rows={4}
                  placeholder="Explica los beneficios, módulos y enfoque del curso..."
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold outline-none resize-none"
                />
              </div>

              <div>
                <label htmlFor={`${formId}-flyer`} className="block text-xs font-medium text-white/70 mb-1">
                  {editing ? "Reemplazar portada (opcional)" : "Flyer / Portada (opcional)"}
                </label>
                <input
                  id={`${formId}-flyer`}
                  type="file"
                  name="flyer"
                  accept="image/png,image/jpeg,image/webp"
                  className="w-full text-xs text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gold file:text-black hover:file:bg-gold-light cursor-pointer bg-white/5 border border-white/10 rounded-xl p-2"
                />
              </div>

              <div>
                <label htmlFor={`${formId}-url`} className="block text-xs font-medium text-white/70 mb-1">URL de destino (WhatsApp, Hotmart o web)</label>
                <input
                  id={`${formId}-url`}
                  type="text"
                  inputMode="url"
                  name="url"
                  value={values.url}
                  onChange={(event) => setValues({ ...values, url: event.target.value })}
                  placeholder="https://wa.me/..., https://hotmart.com/... o /ruta"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold outline-none"
                />
                <p className="mt-1 text-xs text-white/50">Si se deja vacía en una clase online o presencial, se usa el WhatsApp de agenda.</p>
              </div>

              <div>
                <label htmlFor={`${formId}-link-label`} className="block text-xs font-medium text-white/70 mb-1">Texto del enlace (opcional)</label>
                <input
                  id={`${formId}-link-label`}
                  type="text"
                  name="link_label"
                  maxLength={120}
                  value={values.link_label}
                  onChange={(event) => setValues({ ...values, link_label: event.target.value })}
                  placeholder={course ? resolveCourseLink(course).label : "Ej. Enlace a WhatsApp"}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold outline-none"
                />
                <p className="mt-1 text-xs text-white/50">Se muestra en el panel y en el botón de la página principal. Vacío usa el texto automático.</p>
              </div>

              <div>
                <label htmlFor={`${formId}-status`} className="block text-xs font-medium text-white/70 mb-1">Estado</label>
                <select id={`${formId}-status`} name="status" value={values.status} onChange={(event) => setValues({ ...values, status: event.target.value })} className="w-full p-3 bg-black border border-white/10 rounded-xl text-white text-sm focus:border-gold outline-none">
                  <option value="published">Publicado</option>
                  <option value="draft">Borrador</option>
                </select>
              </div>

              {submitError && <p role="alert" className="text-sm text-red-300">{submitError}</p>}

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 text-xs text-white/60 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gold text-black text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl hover:bg-gold-light disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? "Guardando..." : editing ? "Guardar cambios" : "Publicar Curso"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
