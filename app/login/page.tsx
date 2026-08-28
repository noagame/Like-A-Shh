"use client";

import { useState, useTransition } from "react";
import { signIn } from "./actions";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await signIn(formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-white">
      <h1 className="text-2xl font-bold mb-6 text-gold" style={{ fontFamily: "var(--font-serif)" }}>
        Iniciar sesión
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Correo electrónico</label>
          <input
            name="email"
            type="email"
            required
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-lg text-white focus:border-gold outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Contraseña</label>
          <input
            name="password"
            type="password"
            required
            className="w-full p-2.5 bg-black/60 border border-white/10 rounded-lg text-white focus:border-gold outline-none text-sm"
          />
        </div>

        <div className="text-right">
          <Link
            href="/auth/recuperar"
            className="text-xs text-gold hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gold text-black font-bold py-2.5 rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50 mt-4 cursor-pointer text-sm"
        >
          {isPending ? "Ingresando..." : "Entrar"}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-white/50">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-gold hover:underline">
          Regístrate aquí
        </Link>
      </div>
    </div>
  );
}