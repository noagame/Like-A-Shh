"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function PublicNavigation() {
  const pathname = usePathname();
  const hasOwnNavigation = pathname === "/"
    || pathname === "/admin" || pathname?.startsWith("/admin/")
    || pathname === "/mi-cuenta" || pathname?.startsWith("/mi-cuenta/");

  if (hasOwnNavigation) return null;

  return (
    <>
      <Navbar key={pathname} />
      <div aria-hidden="true" className="h-20 shrink-0 md:h-28" />
    </>
  );
}
