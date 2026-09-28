import { createClient } from "@/lib/supabase/server";
import { SITE_ORIGIN } from "@/lib/seo/site-origin";

export default async function StructuredData() {
  const supabase = await createClient();
  
  // Obtenemos la descripción dinámica
  const { data: settings } = await supabase
    .from("site_settings")
    .select("site_description")
    .single();

  const currentDescription = settings?.site_description || "Like a SHH ofrece clases de pole dance, danza exotic, flexibilidad y bienestar corporal con cursos online, workshops y eventos exclusivos.";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Like a SHH",
    url: SITE_ORIGIN,
    logo: `${SITE_ORIGIN}/assets/logo/logo_likeashh.jpg`,
    description: currentDescription,
    sameAs: [
      "https://www.instagram.com/likeashh/",
      "https://x.com/Likeashh1",
      "https://www.tiktok.com/@likeashh",
    ],
    founder: {
      "@type": "Person",
      name: "Maximiliano Velásquez",
      jobTitle: "Fundador e Instructor Principal",
    },
    areaServed: "CL",
    knowsAbout: ["Pole dance", "Danza exotic", "Flexibilidad", "Bienestar corporal", "Cursos online"],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Like a SHH",
    url: SITE_ORIGIN,
    description: currentDescription,
    inLanguage: "es",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}