"use client";

import { useState, useTransition } from "react";
import { m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { signIn, signUp, resetPassword } from "./actions";

type AuthMode = "login" | "register" | "forgot";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const changeMode = (nextMode: AuthMode) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setMode(nextMode);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      if (mode === "login") {
        const res = await signIn(formData);
        if (res?.error) setErrorMessage(res.error);
      } else if (mode === "register") {
        const res = await signUp(formData);
        if (res?.error) setErrorMessage(res.error);
      } else if (mode === "forgot") {
        const res = await resetPassword(formData);
        if (res?.error) setErrorMessage(res.error);
        if (res?.success) setSuccessMessage("Enlace enviado con éxito. Revisa tu correo.");
      }
    });
  };

  // Configuración de temas visuales por modo
  const currentTheme = {
    login: {
      accentColor: "#D4AF37", // Dorado clásico Like a SHH
      glowColor: "rgba(212, 175, 55, 0.15)",
      borderColor: "rgba(212, 175, 55, 0.35)",
      title: "Iniciar sesión",
      subtitle: "Ingresa tus credenciales para acceder a tus clases",
      btnText: "Entrar",
    },
    register: {
      accentColor: "#E09F67", // Terracota / Ámbar místico suave
      glowColor: "rgba(224, 159, 103, 0.15)",
      borderColor: "rgba(224, 159, 103, 0.35)",
      title: "Crear cuenta",
      subtitle: "Regístrate para reservar cursos y workshops",
      btnText: "Registrarse",
    },
    forgot: {
      accentColor: "#85A392", // Salvia / Verde místico relajado
      glowColor: "rgba(133, 163, 146, 0.15)",
      borderColor: "rgba(133, 163, 146, 0.35)",
      title: "Recuperar contraseña",
      subtitle: "Te enviaremos las instrucciones a tu correo",
      btnText: "Enviar enlace de recuperación",
    },
  }[mode];

  // Variantes de animación 3D Flip
  const flipVariants = {
    initial: (direction: number) => ({
      rotateY: direction > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.96,
    }),
    animate: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    },
    exit: (direction: number) => ({
      rotateY: direction > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.96,
      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
    }),
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Luces ambientales en segundo plano que responden al cambio de color */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <m.div
          animate={{ backgroundColor: currentTheme.glowColor }}
          transition={{ duration: 0.8 }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full blur-[140px]"
        />
      </div>

      {/* Tarjeta con perspectiva 3D */}
      <div className="w-full max-w-md relative z-10 [perspective:1200px]">
        <m.div
          animate={{
            borderColor: currentTheme.borderColor,
            boxShadow: `0 20px 50px -10px ${currentTheme.glowColor}`,
          }}
          transition={{ duration: 0.5 }}
          className="bg-black/75 backdrop-blur-2xl border rounded-2xl p-7 sm:p-9 shadow-2xl transition-all"
        >
          {/* Encabezado reactivo */}
          <div className="mb-6">
            <m.h1
              key={mode + "-title"}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-3xl font-bold tracking-wide"
              style={{ color: currentTheme.accentColor, fontFamily: "var(--font-serif)" }}
            >
              {currentTheme.title}
            </m.h1>
            <m.p
              key={mode + "-subtitle"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xs sm:text-sm text-white/50 mt-1"
            >
              {currentTheme.subtitle}
            </m.p>
          </div>

          {/* Mensajes de Alerta */}
          {errorMessage && (
            <m.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs leading-relaxed"
            >
              {errorMessage}
            </m.div>
          )}

          {successMessage && (
            <m.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs leading-relaxed"
            >
              {successMessage}
            </m.div>
          )}

          {/* Vistas Flip */}
          <AnimatePresence mode="wait" custom={mode === "login" ? -1 : 1}>
            <m.div
              key={mode}
              custom={mode === "login" ? -1 : 1}
              variants={flipVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="[transform-style:preserve-3d]"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campo extra: Registro */}
                {mode === "register" && (
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Nombre completo</label>
                    <input
                      name="full_name"
                      type="text"
                      required
                      placeholder="Tu nombre y apellido"
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none transition-all placeholder:text-white/20"
                      style={{ borderColor: currentTheme.borderColor }}
                    />
                  </div>
                )}

                {/* Correo Electrónico (Común a los 3 estados) */}
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Correo electrónico</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none transition-all placeholder:text-white/20"
                    style={{ borderColor: currentTheme.borderColor }}
                  />
                </div>

                {/* Contraseña (Login y Registro) */}
                {mode !== "forgot" && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-medium text-white/70">Contraseña</label>
                      {mode === "login" && (
                        <button
                          type="button"
                          onClick={() => changeMode("forgot")}
                          className="text-xs hover:underline transition-colors"
                          style={{ color: currentTheme.accentColor }}
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      )}
                    </div>
                    <input
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none transition-all placeholder:text-white/20"
                      style={{ borderColor: currentTheme.borderColor }}
                    />
                  </div>
                )}

                {/* Confirmación y Consentimiento Legal (Registro) */}
                {mode === "register" && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Confirmar contraseña</label>
                      <input
                        name="confirm_password"
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none transition-all placeholder:text-white/20"
                        style={{ borderColor: currentTheme.borderColor }}
                      />
                    </div>

                    <div className="flex items-start gap-2 pt-1">
                      <input
                        type="checkbox"
                        name="accepted_privacy"
                        id="auth-privacy"
                        required
                        className="mt-1 rounded bg-white/5 accent-[#E09F67] cursor-pointer"
                      />
                      <label htmlFor="auth-privacy" className="text-[11px] text-white/60 leading-tight">
                        Acepto los términos y la{" "}
                        <Link href="/privacidad" target="_blank" className="underline text-white/80 hover:text-white">
                          política de privacidad (Ley 21.719)
                        </Link>
                      </label>
                    </div>
                  </>
                )}

                {/* Botón Principal */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-black transition-all transform active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-lg mt-2 flex items-center justify-center gap-2"
                  style={{ backgroundColor: currentTheme.accentColor }}
                >
                  {isPending ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    currentTheme.btnText
                  )}
                </button>
              </form>
            </m.div>
          </AnimatePresence>

          {/* Links de alternancia en el pie de la tarjeta */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-white/50">
            {mode === "login" && (
              <p>
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => changeMode("register")}
                  className="font-semibold hover:underline ml-1 cursor-pointer"
                  style={{ color: "#E09F67" }}
                >
                  Regístrate aquí
                </button>
              </p>
            )}

            {mode === "register" && (
              <p>
                ¿Ya tienes una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => changeMode("login")}
                  className="font-semibold hover:underline ml-1 cursor-pointer"
                  style={{ color: "#D4AF37" }}
                >
                  Inicia sesión aquí
                </button>
              </p>
            )}

            {mode === "forgot" && (
              <p>
                ¿Recordaste tus datos?{" "}
                <button
                  type="button"
                  onClick={() => changeMode("login")}
                  className="font-semibold hover:underline ml-1 cursor-pointer"
                  style={{ color: "#D4AF37" }}
                >
                  ← Volver al inicio de sesión
                </button>
              </p>
            )}
          </div>
        </m.div>
      </div>
    </main>
  );
}