import { createClient } from "@/lib/supabase/server";
import { createEvent } from "../actions";

export default async function NuevoEventoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-black ">Nuevo evento / Clase / Workshop</h1>

      <form action={createEvent} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black">Título</label>
          <input
            name="title"
            type="text"
            required
            className="w-full p-2 border rounded text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black">Descripción</label>
          <textarea
            name="description"
            rows={4}
            className="w-full p-2 border rounded text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black">Categoría</label>
          <select name="category_id" className="w-full p-2 border rounded text-black">
            <option value="">Sin categoría</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            ¿No aparece la categoría que necesitas? Créala primero en{" "}
            <a href="/admin/categorias" className="underline">
              /admin/categorias
            </a>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-500">Inicio</label>
            <input
              name="start_time"
              type="datetime-local"
              required
              className="w-full p-2 border rounded text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-500 ">Término</label>
            <input
              name="end_time"
              type="datetime-local"
              required
              className="w-full p-2 border rounded text-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black">Ubicación</label>
          <input
            name="location"
            type="text"
            className="w-full p-2 border rounded text-black"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black">Cupo (opcional)</label>
            <input
              name="capacity"
              type="number"
              min={1}
              className="w-full p-2 border rounded text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Estado</label>
            <select name="status" defaultValue="draft" className="w-full p-2 border rounded text-black">
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded hover:bg-gray-800"
        >
          Crear evento
        </button>
      </form>
    </div>
  );
}