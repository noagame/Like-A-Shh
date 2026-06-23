import type { Metadata } from "next";
import { Playfair_Display, Inter, Montserrat } from "next/font/google";
import "./globals.css";
import SecurityGuard from "./components/SecurityGard";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Like a SHH | Noches De Exotic - Pole Dance & Bienestar",
  description:
    "Descubre el arte del pole dance, danza exotic y bienestar corporal con Like a SHH. Cursos online, workshops y eventos exclusivos. Movimiento, Fuerza y Libertad.",
  keywords: [
    "pole dance",
    "exotic dance",
    "bienestar corporal",
    "cursos online",
    "like a shh",
    "noches de exotic",
  ],
  openGraph: {
    title: "Like a SHH | Noches De Exotic",
    description:
      "Movimiento, Fuerza y Libertad. Pole Dance, Danza Exotic y Bienestar Corporal.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`h-full antialiased ${playfair.variable} ${inter.variable} ${montserrat.variable}`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
