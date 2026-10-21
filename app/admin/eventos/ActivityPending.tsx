"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

export default function ActivityPending({
  message = "Espera, estamos agregando el evento",
}: { message?: string }) {
  const { pending } = useFormStatus();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (pending && !dialog.open) dialog.showModal();
    if (!pending && dialog.open) dialog.close();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [pending]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={message}
      aria-busy={pending}
      onCancel={(event) => event.preventDefault()}
      className="m-auto max-w-sm rounded-2xl border border-white/15 bg-neutral-900 p-8 text-white backdrop:bg-black/80"
    >
      <p role="status" aria-live="polite">{message}</p>
      <p className="mt-2 text-sm text-white/60">Esto puede tardar unos segundos.</p>
    </dialog>
  );
}
