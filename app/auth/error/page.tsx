import { reenviarConfirmacion } from "./action";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; reenviado?: string }>;
}) {
  const { message, reenviado } = await searchParams;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-black">
      <h1 className="text-2xl font-bold mb-2">No pudimos confirmar tu cuenta</h1>
      <p className="text-sm text-gray-600 mb-6">
        {message
          ? `Motivo: ${message}`
          : "El link de confirmación es inválido o ya venció (los links duran 24 horas)."}
      </p>

      {reenviado === "1" ? (
        <p className="text-green-600 text-sm">
          Te reenviamos el correo de confirmación. Revisa tu bandeja de entrada (y spam).
        </p>
      ) : (
        <form action={reenviarConfirmacion} className="space-y-3">
          <label className="block text-sm font-medium">
            Ingresa tu email para reenviarte el link
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-black text-white p-2 rounded hover:bg-gray-800"
          >
            Reenviar confirmación
          </button>
        </form>
      )}

      <p className="text-sm mt-6 text-center">
        <a href="/login" className="underline text-blue-600">
          Volver a intentar iniciar sesión
        </a>
      </p>
    </div>
  );
}