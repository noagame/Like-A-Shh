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
    <div>
      <p className="text-sm text-white/50">Panel Administrador</p>
      <h1 className="text-2xl font-semibold text-gold mb-8">
        Bienvenido, {profile?.full_name ?? "Admin"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-lg border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-gold/40 hover:bg-white/10 hover:-translate-y-0.5"
          >
            <span className="text-2xl" aria-hidden="true">
              {card.emoji}
            </span>
            <h2 className="mt-3 text-base font-semibold text-white group-hover:text-gold transition-colors">
              {card.title}
            </h2>
            <p className="mt-1 text-sm text-white/50">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
