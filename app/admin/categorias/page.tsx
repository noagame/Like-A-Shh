import { createClient } from "@/lib/supabase/server";
import { createCategory, deleteCategory } from "./actions";
import PanelInfo from "../components/PanelInfo";

export default async function CategoriasPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("name");

  return (
    <div className="max-w-4xl p-6">
      <h1 className="text-2xl font-bold mb-4 text-white">Categorías</h1>

      <PanelInfo
        title="¿Para qué sirve este panel?"
        description="Las categorías te permiten agrupar tus eventos por tipo (por ejemplo: Workshop, Sesión, Retiro). Se usan como filtro tanto en este panel de administración como en la landing pública, y son obligatorias al crear un nuevo evento — créalas antes de agregar eventos nuevos."
      />

      <div className="mt-6 bg-black border border-gray-800 p-4 rounded-lg max-w-2xl">
        <form action={createCategory as any} className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-white mb-1">Nombre</label>
            <input
              type="text"
              name="name"
              required
              className="w-full p-2 bg-transparent border border-gray-700 rounded text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Color</label>
            <input
              type="color"
              name="color"
              defaultValue="#D4AF37"
              className="h-10 w-16 p-1 bg-transparent border border-gray-700 rounded cursor-pointer"
            />
          </div>
          <button
            type="submit"
            className="bg-yellow-500 text-black px-4 py-2 rounded font-bold hover:bg-yellow-400 transition-colors"
          >
            Agregar
          </button>
        </form>
      </div>

      <div className="mt-8">
        {categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((c) => (
              <div key={c.id} className="flex justify-between items-center p-3 border border-gray-800 rounded bg-gray-900">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }}></span>
                  <span className="text-white">{c.name}</span>
                </div>
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className="text-red-500 text-sm hover:underline">
                    Borrar
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Todavía no hay categorías creadas.</p>
        )}
      </div>
    </div>
  );
}