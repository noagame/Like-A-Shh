import BackButton from "@/app/admin/components/BackButton";
import PanelInfo from "@/app/admin/components/PanelInfo";
import FormClaseOnline from "./FormClaseOnline";

export default async function ClaseOnlinePage({
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
          Clases Online
        </h1>
      </div>

      <PanelInfo
        title="Clases online"
        description="Gestiona clases virtuales con enlace Zoom o Meet, cupos y flyer. Son las sesiones que se exhiben como contenido online y se inscriben desde la zona de usuario."
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <FormClaseOnline />
    </div>
  );
}
