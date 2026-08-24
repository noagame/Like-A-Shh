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
                    className="w-full p-2 border rounded text-black"
                >
                    <option value="">Sin categoría</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
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
                <div className="p-4 border rounded-md bg-gray-50 flex flex-col gap-3 shadow-inner">
                    <p className="text-sm font-bold text-black m-0">Nueva Categoría</p>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Nombre de la categoría</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full p-2 border rounded text-black text-sm"
                            placeholder="Ej. Workshop Especial"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Color de etiqueta</label>
                        <input
                            type="color"
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            className="w-12 h-8 p-0 border-0 rounded cursor-pointer"
                        />
                    </div>

                    <div className="flex gap-2 mt-1">
                        <button
                            type="button"
                            onClick={handleCreateCategory}
                            disabled={isLoading || !newName.trim()}
                            className="bg-black text-white text-xs px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        >
                            {isLoading ? "Guardando..." : "Guardar y seleccionar"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsCreating(false)}
                            className="text-gray-600 text-xs px-3 py-2 hover:underline"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}