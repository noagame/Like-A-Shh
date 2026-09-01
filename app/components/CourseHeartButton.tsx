"use client";

import { m } from "framer-motion";
import { useState, useTransition } from "react";
import { toggleLikeCourse } from "@/app/mi-cuenta/reviews-actions";

type CourseHeartButtonProps = {
  courseId: string;
  liked: boolean;
  likesCount: number;
};

export default function CourseHeartButton({ courseId, liked, likesCount }: CourseHeartButtonProps) {
  const [isLiked, setIsLiked] = useState(liked);
  const [count, setCount] = useState(likesCount);
  const [isPending, startTransition] = useTransition();

  const handleToggleLike = () => {
    startTransition(async () => {
      const result = await toggleLikeCourse(courseId);

      if (!result.success) {
        return;
      }

      setIsLiked(Boolean(result.liked));
      setCount((previous) => (result.liked ? previous + 1 : Math.max(0, previous - 1)));
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggleLike}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-black/20 px-3 py-1.5 text-xs text-white/80 transition hover:border-gold/50 hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-70"
      aria-label={isLiked ? "Quitar me gusta" : "Dar me gusta"}
    >
      <m.span
        whileTap={{ scale: 0.9 }}
        animate={{ scale: isLiked ? [1, 1.25, 1] : 1 }}
        transition={{ duration: 0.2 }}
        className={isLiked ? "text-rose-400" : "text-white/60"}
      >
        ♥
      </m.span>
      <span className="font-medium">{count}</span>
    </button>
  );
}
