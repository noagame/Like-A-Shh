import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, Montserrat } from "next/font/google";
import "./globals.css";
import MotionProvider from "./components/MotionProvider";

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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Like a SHH | Pole Dance, Danza Exotic y Cursos Online",
    template: "%s | Like a SHH",
  },
  description:
    "Descubre Like a SHH: clases de pole dance, danza exotic, flexibilidad y bienestar corporal con cursos online, workshops y eventos exclusivos en Chile.",
  keywords: [
    "pole dance",
    "danza exotic",
    "bienestar corporal",
    "cursos online",
    "like a shh",
    "workshops pole dance",
    "clases de pole dance",
  ],
  applicationName: "Like a SHH",
  authors: [{ name: "Like a SHH" }],
  category: "artes escénicas",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: siteUrl,
    siteName: "Like a SHH",
    title: "Like a SHH | Pole Dance, Danza Exotic y Cursos Online",
    description:
      "Clases de pole dance, danza exotic y bienestar corporal con cursos online, workshops y eventos exclusivos. Movimiento, fuerza y libertad.",
    images: [
      {
        url: "/assets/logo/logo_likeashh.jpg",
        width: 1200,
        height: 630,
        alt: "Like a SHH",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Like a SHH | Pole Dance, Danza Exotic y Cursos Online",
    description:
      "Clases de pole dance, danza exotic y bienestar corporal con cursos online, workshops y eventos exclusivos.",
    images: ["/assets/logo/logo_likeashh.jpg"],
    creator: "@Likeashh1",
    site: "@Likeashh1",
  },
};

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
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
