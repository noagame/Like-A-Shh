"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadMedia } from "@/app/admin/medios/actions";

type UploadStatus = { fileName: string; status: "subiendo" | "ok" | "error"; error?: string };

export default function GalleryDropzone({ galleryId }: { galleryId: string }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadStatus[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFiles(files: FileList | File[]) {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) return;

    setUploads(fileArray.map((f) => ({ fileName: f.name, status: "subiendo" })));

    // Subida en paralelo — cada llamada a uploadMedia es independiente
    await Promise.all(
      fileArray.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("gallery_id", galleryId);
        formData.append("alt_text", file.name.replace(/\.[^.]+$/, ""));

        const result = await uploadMedia(formData);

        const error = result.ok ? undefined : result.error;

        setUploads((prev) =>
          prev.map((u) =>
            u.fileName === file.name
              ? { fileName: file.name, status: error ? "error" : "ok", error }
              : u
          )
        );
      })
    );

    // uploadMedia ya revalida el path en el servidor, pero el grid de
    // imágenes lo pinta un Server Component padre — hay que decirle al
    // router que vuelva a pedir esos datos para verlos sin recargar la página.
    router.refresh();

    // Limpia el estado de la lista de subidas después de un momento,
    // para no dejar el aviso pegado para siempre.
    setTimeout(() => setUploads([]), 3000);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [galleryId]);

  return (
    <div className="mb-8">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
          isDragging ? "border-gold bg-gold/10" : "border-white/20 hover:border-white/40"
        }`}
      >
        <p className="text-white/70">
          {isDragging ? "Suelta las imágenes acá" : "Arrastra imágenes acá, o haz clic para elegirlas"}
        </p>
        <p className="text-xs text-white/40 mt-1">Puedes soltar varias a la vez</p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {uploads.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm">
          {uploads.map((u) => (
            <li key={u.fileName} className="flex items-center gap-2">
              <span
                className={
                  u.status === "ok"
                    ? "text-green-400"
                    : u.status === "error"
                    ? "text-red-400"
                    : "text-white/50"
                }
              >
                {u.status === "subiendo" ? "⏳" : u.status === "ok" ? "✅" : "❌"}
              </span>
              <span className="text-white/70">{u.fileName}</span>
              {u.error && <span className="text-red-400 text-xs">— {u.error}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}