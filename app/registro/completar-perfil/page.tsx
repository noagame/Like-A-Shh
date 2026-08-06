import { completarPerfil } from "./actions";

export default async function CompletarPerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-2 text-black">Un último paso</h1>
      <p className="text-sm text-gray-600 mb-6">
        Necesitamos estos datos para gestionar tus clases correctamente.
      </p>

      <form action={completarPerfil} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black">
            Fecha de nacimiento
          </label>
          <input
            name="birth_date"
            type="date"
            required
            className="w-full p-2 border rounded text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black">
            Género <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <select name="gender" defaultValue="" className="w-full p-2 border rounded text-black">
            <option value="">Prefiero no decir</option>
            <option value="femenino">Femenino</option>
            <option value="masculino">Masculino</option>
            <option value="no_binario">No binario</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-black">
            Teléfono <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            name="phone"
            type="tel"
            placeholder="+56 9 1234 5678"
            className="w-full p-2 border rounded text-black"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded hover:bg-gray-800"
        >
          Continuar
        </button>
      </form>
    </div>
  );
}