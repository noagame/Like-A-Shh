"use client";

import { LazyMotion, domMax } from "framer-motion";

/**
 * Wraps children in Framer Motion's LazyMotion provider with domMax features.
 * domMax is used instead of domAnimation because the site uses AnimatePresence
 * (exit animations) which requires the full feature set.
 *
 * This provider is placed once at the root so every component can use the
 * lightweight `m` import instead of the heavyweight `motion` import,
 * saving ~30 kb of JavaScript.
 */
export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LazyMotion features={domMax} strict>{children}</LazyMotion>;
}
