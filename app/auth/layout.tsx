import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceso a la cuenta",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
