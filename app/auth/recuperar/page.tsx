"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function RecuperarPasswordPage() {
    const [email, setEmail] = useState("");
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMensaje(null);

        const supabase = createClient();

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/actualizar-password`,
        });

        if (error) {
            setError(error.message);
        } else {
            setMensaje("¡Listo! Revisa tu bandeja de correo para restablecer tu contraseña.");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-black">
            <h1 className="text-2xl font-bold mb-2">Recuperar contraseña</h1>
            <p className="text-sm text-gray-600 mb-6">
                Ingresa tu correo electrónico y te enviaremos las instrucciones para cambiar tu clave.
            </p>

            {mensaje && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{mensaje}</div>}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

            <form onSubmit={handleReset} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Correo electrónico</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        className="w-full p-2 border rounded text-black"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white font-bold py-2 rounded hover:bg-gray-800 transition-colors text-sm cursor-pointer disabled:opacity-50"
                >
                    {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                </button>
            </form>

            <div className="mt-4 text-center">
                <Link href="/login" className="text-xs text-blue-600 hover:underline">
                    ← Volver al inicio de sesión
                </Link>
            </div>
        </div>
    );
}