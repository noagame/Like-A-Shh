import Link from "next/link";

export default function ConfirmadoPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
        {/* Checkmark animado con acento Gold */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gold mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          ¡Cuenta Confirmada!
        </h1>

        <p className="text-sm text-white/80 leading-relaxed mb-6">
          Gracias por verificar tu correo electrónico. Tu cuenta en <strong>Like a SHH</strong> está activa y asegurada.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 text-xs text-white/60">
          Tu plazo de verificación ha concluido con éxito y tus preferencias ya forman parte de nuestro entorno privado.
        </div>

        <Link
          href="/registro/completar-perfil"
          className="block w-full bg-gold text-black font-bold py-3 rounded-lg hover:bg-gold-light transition-all text-sm shadow-lg shadow-gold/10"
        >
          Completar Perfil y Continuar →
        </Link>
      </div>
    </main>
  );
}