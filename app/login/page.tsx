import { signIn } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-black">Iniciar sesión</h1>

      <form action={signIn} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full p-2 border rounded text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black">Contraseña</label>
          <input
            name="password"
            type="password"
            required
            className="w-full p-2 border rounded text-black"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded hover:bg-gray-800"
        >
          Entrar
        </button>
      </form>

      <p className="text-sm mt-4 text-center text-black">
        ¿No tienes cuenta?{" "}
        <a href="/registro" className="underline text-blue-600">
          Regístrate
        </a>
      </p>
    </div>
  );
}