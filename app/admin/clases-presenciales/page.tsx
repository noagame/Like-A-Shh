import BackButton from "@/app/admin/components/BackButton";
import PanelInfo from "@/app/admin/components/PanelInfo";
import FormClasePresencial from "./FormClasePresencial";

export default async function ClasePresencialPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="max-w-4xl">
      <BackButton />
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-white/45">Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-gold" style={{ fontFamily: "var(--font-serif)" }}>
          Clases Presenciales
        </h1>
      </div>

      <PanelInfo
        title="Clases presenciales"
        description="Crea encuentros físicos del estudio con cupos, dirección y flyer. Estas sesiones son las que aparecen en el área pública y pueden inscribirse desde la parte de usuario."
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <FormClasePresencial />
    </div>
  );
}
