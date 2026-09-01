import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// En dev, Next.js/React necesitan eval() para Fast Refresh y stack traces.
// En producción NUNCA se agrega 'unsafe-eval' — React no lo usa ahí.
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data: https: https://*.supabase.co",
      "font-src 'self' data:",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://*.supabase.co https://*.googleapis.com" + (isDev ? " ws://localhost:*" : ""),
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  transpilePackages: [
    "@fullcalendar/common",
    "@fullcalendar/core",
    "@fullcalendar/react",
    "@fullcalendar/daygrid",
  ],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;