import BackButton from "@/app/admin/components/BackButton";
import PanelInfo from "@/app/admin/components/PanelInfo";
import FormClasePresencial from "../FormClasePresencial";

export default async function NuevaClasePresencialPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  return (
    <div className="max-w-4xl">
      <BackButton href="/admin/eventos" />

      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-white/45">Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-gold" style={{ fontFamily: "var(--font-serif)" }}>
          Nueva Clase Presencial
        </h1>
      </div>

      <PanelInfo
        title="Clase particular presencial"
        description="Crea una sesión física del estudio con ubicación, cupos, horario y flyer. Esta actividad no debe mezclarse con los eventos masivos de la landing."
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </div>
      )}

      <FormClasePresencial />
    </div>
  );
}
