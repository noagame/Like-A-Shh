"use client";

export default function DateInput({ name, label }: { name: string; label: string }) {
    return (
        <div>
            <label className="block text-sm font-medium text-blue-500">{label}</label>
            <input
                name={name}
                type="datetime-local"
                required
                min="2026-01-01T00:00"
                max="2035-12-31T23:59"
                className="w-full p-2 border rounded text-black"
                onInvalid={(e) => {
                    const input = e.target as HTMLInputElement;
                    input.setCustomValidity("Ingrese una fecha válida");
                }}
                onInput={(e) => {
                    const input = e.target as HTMLInputElement;
                    input.setCustomValidity(""); // Limpia el error cuando el usuario empieza a escribir bien
                }}
            />
        </div>
    );
}