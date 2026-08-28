"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ActualizarPasswordPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError(error.message);
        } else {
            setMensaje("¡Contraseña actualizada con éxito! Redirigindo...");
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-black">
            <h1 className="text-2xl font-bold mb-2">Nueva contraseña</h1>
            <p className="text-sm text-gray-600 mb-6">Ingresa tu nueva contraseña a continuación.</p>

            {mensaje && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{mensaje}</div>}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

            <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Nueva contraseña</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full p-2 border rounded text-black"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white font-bold py-2 rounded hover:bg-gray-800 transition-colors text-sm cursor-pointer disabled:opacity-50"
                >
                    {loading ? "Actualizando..." : "Actualizar contraseña"}
                </button>
            </form>
        </div>
    );
}