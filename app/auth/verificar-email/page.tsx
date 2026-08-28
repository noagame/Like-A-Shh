import Link from "next/link";
import { reenviarConfirmacion } from "../error/action";

export default async function VerificarEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; reenviado?: string; error?: string }>;
}) {
  const { email, reenviado, error } = await searchParams;

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
        {/* Ícono de Estado */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
          <svg className="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gold mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          Confirma tu correo
        </h1>

        <p className="text-sm text-white/80 leading-relaxed mb-4">
          Hemos enviado un enlace de confirmación a:
          <br />
          <span className="font-semibold text-white text-base break-all">{email || "tu bandeja de entrada"}</span>
        </p>

        {/* Notificación de 7 días / Rendimiento */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left">
          <div className="flex items-start gap-3">
            <span className="text-gold text-lg">⏳</span>
            <p className="text-xs text-white/70 leading-relaxed">
              <strong className="text-white">Período de prueba y validación (7 días):</strong> Por motivos de seguridad y optimización del sistema, dispones de 7 días para activar tu cuenta. Los registros no confirmados se purgan automáticamente tras este plazo.
            </p>
          </div>
        </div>

        {reenviado === "1" && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/40 rounded-lg text-green-400 text-xs">
            ✓ Hemos reenviado un nuevo enlace de activación.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Acción de reenvío */}
        <form action={reenviarConfirmacion} className="space-y-4">
          <input type="hidden" name="email" value={email || ""} />
          
          <button
            type="submit"
            disabled={!email}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/15 text-white font-medium py-2.5 rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            ¿No recibiste el correo? Reenviar confirmación
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-2 text-xs text-white/40">
          <p>Revisa también tu carpeta de spam o promociones.</p>
          <Link href="/login" className="text-gold hover:underline mt-2">
            Volver a Iniciar Sesión
          </Link>
        </div>
      </div>
    </main>
  );
}