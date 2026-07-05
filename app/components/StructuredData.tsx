const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.likeashh.cl";

export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Like a SHH",
    url: siteUrl,
    logo: `${siteUrl}/assets/logo/logo_likeashh.jpg`,
    description:
      "Like a SHH ofrece clases de pole dance, danza exotic, flexibilidad y bienestar corporal con cursos online, workshops y eventos exclusivos.",
    sameAs: [
      "https://www.instagram.com/_likeashh_",
      "https://x.com/Likeashh1",
      "https://www.tiktok.com/@likeashh",
    ],
    founder: {
      "@type": "Person",
      name: "Maximiliano Velásquez",
      jobTitle: "Fundador e Instructor Principal",
    },
    areaServed: "CL",
    knowsAbout: [
      "Pole dance",
      "Danza exotic",
      "Flexibilidad",
      "Bienestar corporal",
      "Cursos online",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Like a SHH",
    url: siteUrl,
    description:
      "Sitio oficial de Like a SHH para descubrir clases de pole dance, danza exotic, cursos online y eventos exclusivos.",
    inLanguage: "es",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/?s={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
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
