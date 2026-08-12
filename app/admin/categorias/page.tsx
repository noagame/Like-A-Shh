import { createClient } from "@/lib/supabase/server";
import { createCategory, deleteCategory } from "./actions";

export default async function CategoriasPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, color")
    .order("name");

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Categorías</h1>

      <form
        action={async (formData) => {
          "use server";
          await createCategory(formData);
        }}
        className="flex flex-wrap items-end gap-3 mb-8 bg-white/5 border border-white/10 rounded-lg p-4"
      >
        <div className="flex-1 min-w-[160px]">
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            name="name"
            type="text"
            required
            className="w-full p-2 border rounded bg-black/20 border-white/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Color</label>
          <input
            name="color"
            type="color"
            defaultValue="#D4AF37"
            className="h-10 w-16 p-1 border rounded bg-black/20 border-white/20"
          />
        </div>
        <button
          type="submit"
          className="bg-gold text-black font-bold px-4 py-2 rounded hover:bg-gold-light transition-colors"
        >
          Agregar
        </button>
      </form>

      {!categories || categories.length === 0 ? (
        <p className="text-white/50">Todavía no hay categorías creadas.</p>
      ) : (
        <ul className="space-y-2">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full inline-block"
                  style={{ backgroundColor: c.color ?? "#D4AF37" }}
                />
                <span>{c.name}</span>
              </div>
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={c.id} />
                <button type="submit" className="text-red-400 hover:underline text-sm">
                  Eliminar
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}