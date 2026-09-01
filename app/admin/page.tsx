import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type AdminCard = {
  href: string;
  title: string;
  description: string;
  emoji: string;
};

const cards: AdminCard[] = [
  {
    href: "/admin/eventos",
    title: "Gestión de Eventos",
    description: "Crea, edita y publica sesiones, clases y workshops.",
    emoji: "📅",
  },
  {
    href: "/admin/clases-presenciales",
    title: "Clases Presenciales",
    description: "Publica clases físicas con cupos, dirección y flyer propio.",
    emoji: "📍",
  },
  {
    href: "/admin/clases-online",
    title: "Clases Online",
    description: "Publica sesiones virtuales con enlace Zoom/Meet y cupos.",
    emoji: "💻",
  },
  {
    href: "/admin/categorias",
    title: "Categorías",
    description: "Organiza los eventos por tipo para filtrarlos más fácil.",
    emoji: "🏷️",
  },
  {
    href: "/admin/galeria",
    title: "Galería de Fotos",
    description: "Sube y ordena las imágenes que se muestran en la landing.",
    emoji: "🖼️",
  },
  {
    href: "/admin/dashboard",
    title: "Panel Analítico",
    description: "KPIs de usuarios, clases activas y comentarios pendientes.",
    emoji: "📊",
  },
  {
    href: "/admin/usuarios",
    title: "Gestión de Usuarios",
    description: "Próximamente: administra roles y datos de usuarios.",
    emoji: "👥",
  },
  {
    href: "/admin/cursos",
    title: "Gestión de Cursos Online",
    description: "Administra los cursos formativos en video y enlaces a Hotmart.",
    emoji: "🎓",
  },
  {
    href: "/admin/ajustes",
    title: "Ajustes",
    description: "Próximamente: configuración global y SEO del sitio.",
    emoji: "⚙️",
  },
];

export default async function AdminHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user?.id)
    .single();

  return (
    <div className="relative">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300/80">Panel Administrador</p>
        <h1 className="mt-3 text-3xl font-bold text-white" style={{ fontFamily: "var(--font-serif)" }}>
          Bienvenido, {profile?.full_name ?? "Admin"}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-amber-400/40 hover:bg-white/[0.05]"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl" aria-hidden="true">
                {card.emoji}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-amber-300/70">Abrir</span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-white transition-colors group-hover:text-amber-300">
              {card.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/55">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
