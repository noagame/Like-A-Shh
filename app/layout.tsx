import { createClient } from "@/lib/supabase/server";
import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, Montserrat } from "next/font/google";
import "./globals.css";
import MotionProvider from "./components/MotionProvider";
import StructuredData from "./components/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.likeashh.cl";

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

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  
  // Consultamos los ajustes a Supabase de forma segura
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .single();

  const title = settings?.site_title || "Like a SHH | Pole Dance, Danza Exotic y Cursos Online";
  const description = settings?.site_description || "Descubre Like a SHH: clases de pole dance, danza exotic, flexibilidad y bienestar corporal...";
  
  // Convertimos el string de palabras clave (separadas por coma) en un arreglo
  const keywords = settings?.seo_keywords 
    ? settings.seo_keywords.split(',').map((k: string) => k.trim()) 
    : ["pole dance", "danza exotic", "bienestar corporal", "cursos online", "like a shh"];

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: "%s | Like a SHH",
    },
    description: description,
    keywords: keywords,
    applicationName: "Like a SHH",
    authors: [{ name: "Like a SHH" }],
    category: "artes escénicas",
    alternates: { canonical: "/" },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
    },
    openGraph: {
      type: "website",
      locale: "es_CL",
      url: siteUrl,
      siteName: "Like a SHH",
      title: title,
      description: description,
      images: [{ url: "/assets/logo/logo_likeashh.jpg", width: 1200, height: 630, alt: "Like a SHH" }],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: ["/assets/logo/logo_likeashh.jpg"],
      creator: "@Likeashh1",
      site: "@Likeashh1",
    },
  };
}
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
        <StructuredData />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
