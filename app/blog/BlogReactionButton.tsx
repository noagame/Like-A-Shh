"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { setBlogReaction } from "./actions";

type Props = {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  loggedIn: boolean;
  canReact: boolean;
  available: boolean;
};

export default function BlogReactionButton({ postId, initialLiked, initialCount, loggedIn, canReact, available }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function react() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await setBlogReaction(postId, !liked);
        if ("error" in result) {
          setError(result.error);
          return;
        }
        setCount(result.likesCount ?? Math.max(0, count + (result.liked === liked ? 0 : result.liked ? 1 : -1)));
        setLiked(result.liked);
      } catch {
        setError("No se pudo guardar tu reacción. Intenta nuevamente.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={react}
        disabled={!canReact || !available || pending}
        aria-pressed={liked}
        aria-label={liked ? "Quitar Me gusta" : "Dar Me gusta"}
        className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-black/20 px-4 py-2 text-sm text-white/80 transition hover:border-gold/60 disabled:cursor-default disabled:opacity-60"
      >
        <span aria-hidden="true" className={liked ? "text-rose-400" : "text-white/50"}>♥</span>
        <span>{pending ? "Guardando…" : "Me gusta"}</span>
        {available && <span className="font-semibold">{count}</span>}
      </button>
      {!loggedIn ? (
        <p className="text-xs text-white/60"><Link href="/login" className="text-[#48CAE4] hover:underline">Inicia sesión como alumno</Link> para reaccionar.</p>
      ) : !canReact ? (
        <p className="text-xs text-white/60">Solo los alumnos pueden reaccionar al blog.</p>
      ) : !available ? (
        <p className="text-xs text-white/60">Las reacciones estarán disponibles pronto.</p>
      ) : null}
      {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
