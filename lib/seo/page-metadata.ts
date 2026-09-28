import type { Metadata } from "next";
import { SITE_ORIGIN } from "./site-origin";

const logo = "/assets/logo/logo_likeashh.jpg";

export function pageMetadata(
  title: string,
  description: string,
  path: string,
  type: "website" | "article" = "website",
): Metadata {
  const fullTitle = `${title} | Like a SHH`;
  const url = `${SITE_ORIGIN}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      ...(type === "article" ? { type: "article" as const } : { type: "website" as const }),
      locale: "es_CL",
      url,
      siteName: "Like a SHH",
      title: fullTitle,
      description,
      images: [{ url: logo, width: 150, height: 150, alt: "Like a SHH" }],
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description,
      images: [logo],
    },
  };
}
