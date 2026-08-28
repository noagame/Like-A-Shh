"use client";

import { useState, useTransition } from "react";
import { toggleLikeMedia } from "./actions";
import { m } from "framer-motion";

export default function HeartButton({
  mediaId,
  initialLiked,
  initialCount,
}: {
  mediaId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    startTransition(async () => {
      const res = await toggleLikeMedia(mediaId);
      if (res?.error) {
        // Rollback en caso de error
        setLiked(!nextLiked);
        setCount((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
      }
    });
  };

  return (
    <m.button
      onClick={handleToggle}
      disabled={isPending}
      whileTap={{ scale: 0.8 }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
        liked
          ? "bg-red-500/20 border-red-500/40 text-red-400"
          : "bg-black/50 border-white/20 text-white/60 hover:text-white hover:bg-black/70"
      }`}
      aria-label="Dar me gusta"
    >
      <m.span
        animate={{ scale: liked ? [1, 1.3, 1] : 1 }}
        transition={{ duration: 0.25 }}
        className="text-sm select-none"
      >
        {liked ? "❤️" : "🤍"}
      </m.span>
      <span className="text-xs font-mono font-semibold">{count}</span>
    </m.button>
  );
}