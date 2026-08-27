"use client";

import { useState } from "react";
import { createCategory } from "../../categorias/actions";

type Category = { id: string; name: string };

export default function CategorySelect({ initialCategories }: { initialCategories: Category[] }) {
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedId, setSelectedId] = useState("");

    // Estado para el mini-formulario
    const [newName, setNewName] = useState("");
    const [newColor, setNewColor] = useState("#D4AF37");
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateCategory = async () => {
        if (!newName.trim()) return;
        setIsLoading(true);

        // Armamos el FormData manualmente porque no podemos usar la etiqueta <form> aquí
        const formData = new FormData();
        formData.append("name", newName);
        formData.append("color", newColor);

        const result = await createCategory(formData);

        if (result?.error) {
            alert("Error al crear categoría: " + result.error);
        } else if (result?.category) {
            // 1. Agregamos la nueva categoría a la lista
            setCategories([...categories, result.category]);
            // 2. La dejamos seleccionada por defecto
            setSelectedId(result.category.id);
            // 3. Cerramos el panel y limpiamos
            setIsCreating(false);
            setNewName("");
            setNewColor("#D4AF37");
        }
        setIsLoading(false);
    };

    return (
        <div className="w-full">
            {/* El select normal. Lo ocultamos visualmente si estamos creando, 
          pero sigue existiendo en el DOM para que el formulario principal lea su valor */}
            <div className={isCreating ? "hidden" : "block"}>
                <select
                    name="category_id"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full p-2 border rounded text-white/70 bg-white/5"
                >
                    <option value="" className="bg-neutral-900">Sin categoría</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-neutral-900 text-white py-2">
                            {c.name}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={() => setIsCreating(true)}
                    className="text-xs font-semibold text-blue-600 mt-2 hover:underline flex items-center gap-1"
                >
                    ➕ Crear nueva categoría aquí mismo
                </button>
            </div>

            {/* Mini-formulario interactivo */}
            {isCreating && (
                <div className="mt-2 p-5 border border-white/10 rounded-xl bg-white/5 backdrop-blur-md flex flex-col gap-4 shadow-xl transition-all">
                    <p className="text-sm font-bold text-gold m-0 flex items-center gap-2">
                        ✨ Nueva Categoría
                    </p>

                    <div>
                        <label className="block text-xs font-medium text-white/70 mb-1.5">Nombre de la categoría</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full p-2.5 bg-black/50 border border-white/10 rounded-lg text-white text-sm focus:border-gold outline-none transition-colors"
                            placeholder="Ej. Workshop Especial"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-white/70 mb-1.5">Color de etiqueta</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={newColor}
                                onChange={(e) => setNewColor(e.target.value)}
                                className="w-12 h-10 p-1 bg-black/50 border border-white/10 rounded-lg cursor-pointer"
                            />
                            <span className="text-xs text-white/40 font-mono uppercase">{newColor}</span>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-2">
                        <button
                            type="button"
                            onClick={handleCreateCategory}
                            disabled={isLoading || !newName.trim()}
                            className="flex-1 bg-gold text-black text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-gold-light disabled:opacity-50 transition-colors"
                        >
                            {isLoading ? "Guardando..." : "Guardar categoría"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsCreating(false)}
                            className="flex-1 bg-transparent border border-white/10 text-white/70 text-xs font-medium px-4 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}