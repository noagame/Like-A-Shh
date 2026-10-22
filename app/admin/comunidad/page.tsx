import { requireAdmin } from "@/lib/auth/authorize";
import Link from "next/link";
import CommunityPostForm from "./CommunityPostForm";
import ModerationButtons from "./ModerationButtons";
import BackButton from "@/app/admin/components/BackButton";


const states = {
  pending: "Pendientes",
  approved: "Aprobadas",
  rejected: "Rechazadas",
  flagged: "Marcadas para revisión",
  hidden: "Ocultas",
};
type PostStatus = keyof typeof states;
type Post = {
  id: string;
  title: string;
  body: string;
  status: PostStatus;
  created_at: string;
  profiles: { full_name: string | null; email: string | null } | null;
};

export default async function AdminCommunityPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const activeStatus = status && Object.hasOwn(states, status) ? status as PostStatus : undefined;
  const { supabase } = await requireAdmin();
  let query = supabase
    .from("community_posts")
    .select("id,title,body,status,created_at,profiles!community_posts_user_id_fkey(full_name,email)")
    .order("created_at", { ascending: false });
  if (activeStatus) query = query.eq("status", activeStatus);
  const { data, error } = await query;
  const posts = (data ?? []) as unknown as Post[];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <BackButton />
      <header>
        <p className="text-xs uppercase tracking-[0.22em] text-[#E0218A]">Conversaciones y moderación</p>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-serif)" }}>Comunidad</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/65">
          Este es el espacio de preguntas, experiencias y conversaciones de los alumnos en su cuenta.
          Desde aquí puedes iniciar un tema y revisar las publicaciones que envían.
        </p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <Link href="/mi-cuenta/comunidad" className="text-[#48CAE4] hover:underline">Ver comunidad de alumnos →</Link>
        </div>
      </header>

      <CommunityPostForm />

      <section aria-labelledby="community-moderation-help" className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/65">
        <h2 id="community-moderation-help" className="font-semibold text-white">Cómo funciona la moderación</h2>
        <p className="mt-2 leading-relaxed">
          Las conversaciones y los comentarios enviados por alumnos quedan pendientes de revisión.
          Aprueba una conversación para que el resto pueda verla y participar.
          Las conversaciones creadas aquí por un administrador se publican aprobadas.
        </p>
        <ul className="mt-3 space-y-1.5 text-xs leading-relaxed">
          <li><strong className="text-white/85">Pendientes:</strong> esperan una decisión; todavía no se comparten con los demás alumnos.</li>
          <li><strong className="text-white/85">Aprobadas:</strong> aparecen en la Comunidad y permiten enviar comentarios a moderación.</li>
          <li><strong className="text-white/85">Marcadas para revisión:</strong> requieren que revises su contenido antes de aprobarlas.</li>
          <li><strong className="text-white/85">Rechazadas u ocultas:</strong> quedan fuera de la vista compartida. Su autor y los administradores pueden seguir viéndolas.</li>
          <li><strong className="text-white/85">Eliminar:</strong> borra la conversación junto con sus comentarios de forma definitiva.</li>
        </ul>
      </section>

      <section aria-labelledby="community-post-list" className="space-y-4">
        <h2 id="community-post-list" className="text-lg font-bold text-white">Conversaciones</h2>
        <nav aria-label="Filtrar conversaciones por estado" className="flex flex-wrap gap-2">
          {(["all", ...Object.keys(states)] as Array<"all" | PostStatus>).map(item => {
            const active = item === "all" ? !activeStatus : activeStatus === item;
            return (
              <Link key={item} href={item === "all" ? "/admin/comunidad" : `/admin/comunidad?status=${item}`} aria-current={active ? "page" : undefined} className={`rounded-full border px-3 py-1.5 text-xs ${active ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#f4d57a]" : "border-white/15 text-white/60 hover:bg-white/5"}`}>
                {item === "all" ? "Todas" : states[item]}
              </Link>
            );
          })}
        </nav>
        {error ? (
          <p role="alert" className="rounded-2xl border border-red-400/20 p-4 text-sm text-red-300">No se pudieron cargar las conversaciones. Actualiza la página para volver a intentarlo.</p>
        ) : posts.length ? posts.map(post => (
          <article key={post.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="rounded-full border border-white/15 px-2 py-1 text-[10px] uppercase tracking-wider text-white/60">{states[post.status] ?? post.status}</span>
                <h3 className="mt-2 font-bold text-white">{post.title}</h3>
                <p className="mt-1 text-xs text-white/45">{post.profiles?.full_name ?? "Sin nombre"} · {post.profiles?.email ?? ""} · {new Date(post.created_at).toLocaleString("es-CL")}</p>
              </div>
              <ModerationButtons id={post.id} />
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-white/70">{post.body}</p>
          </article>
        )) : (
          <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/50">No hay conversaciones para este filtro. Puedes iniciar una con el formulario de arriba.</p>
        )}
      </section>
    </div>
  );
}
