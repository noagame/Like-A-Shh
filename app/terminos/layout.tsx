import { pageMetadata } from "@/lib/seo/page-metadata";

export const metadata = pageMetadata(
  "Términos y condiciones",
  "Consulta las condiciones de uso de Like a SHH para sus clases, cursos online, reservas y servicios.",
  "/terminos",
);

export default function TerminosLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
