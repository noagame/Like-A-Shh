"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

export default function EventImageField({ imageUrl }: { imageUrl: string | null }) {
  const inputId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const reader = useRef<FileReader | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedImage, setFailedImage] = useState(false);

  useEffect(() => () => reader.current?.abort(), []);

  function clearFile(clearInput = true) {
    reader.current?.abort();
    if (clearInput && fileInput.current) fileInput.current.value = "";
    setPreview(null);
    setFilename(null);
    setError(null);
    setFailedImage(false);
  }

  function selectFile(file: File | undefined) {
    clearFile(false);
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024 || file.size === 0) {
      if (fileInput.current) fileInput.current.value = "";
      setError("Selecciona una imagen PNG, JPEG o WebP de hasta 5 MB.");
      return;
    }
    setRemove(false);
    setFilename(file.name);
    const nextReader = new FileReader();
    reader.current = nextReader;
    nextReader.onload = () => {
      if (reader.current === nextReader) setPreview(String(nextReader.result));
    };
    nextReader.onerror = () => {
      clearFile();
      setError("No se pudo leer la imagen. Selecciona el archivo nuevamente.");
    };
    // data: previews work with the site's current Content Security Policy.
    nextReader.readAsDataURL(file);
  }

  const visibleImage = remove ? null : preview ?? imageUrl;

  return (
    <fieldset className="rounded-xl border border-neutral-700 bg-neutral-950/50 p-4">
      <legend className="px-2 text-sm font-medium text-neutral-300">Imagen del evento</legend>
      {visibleImage && !failedImage ? (
        <Image
          src={visibleImage}
          alt={preview ? "Vista previa de la nueva imagen" : "Imagen actual del evento"}
          width={640}
          height={800}
          unoptimized
          className="mx-auto max-h-80 w-full rounded-lg object-contain"
          onError={() => setFailedImage(true)}
        />
      ) : (
        <p className="rounded-lg bg-white/5 p-6 text-center text-sm text-neutral-400">
          {remove ? "La imagen se quitará al guardar los cambios." : failedImage ? "No se pudo cargar la vista previa de la imagen." : "Este evento todavía no tiene imagen."}
        </p>
      )}
      {imageUrl && !remove && !filename ? (
        <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-amber-300 underline">Abrir imagen actual ↗</a>
      ) : null}
      <label htmlFor={inputId} className="mt-4 block text-sm text-neutral-300">
        {imageUrl ? "Reemplazar imagen" : "Subir imagen"}
      </label>
      <input
        ref={fileInput}
        id={inputId}
        name="flyer"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        aria-describedby={`${inputId}-help${error ? ` ${inputId}-error` : ""}`}
        className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white"
        onChange={(event) => selectFile(event.target.files?.[0])}
      />
      <p id={`${inputId}-help`} className="mt-2 text-xs text-neutral-400">PNG, JPEG o WebP; máximo 5 MB. Los cambios se aplican al guardar el evento.</p>
      {filename ? (
        <button type="button" onClick={() => clearFile()} className="mt-2 text-sm text-amber-300 underline">Cancelar archivo seleccionado</button>
      ) : null}
      {imageUrl ? (
        <label className="mt-4 flex items-center gap-2 text-sm text-neutral-300">
          <input type="checkbox" name="remove_flyer" checked={remove} onChange={(event) => { clearFile(); setRemove(event.target.checked); }} />
          Quitar imagen actual al guardar
        </label>
      ) : null}
      {error ? <p id={`${inputId}-error`} role="alert" className="mt-2 text-sm text-red-300">{error}</p> : null}
    </fieldset>
  );
}
