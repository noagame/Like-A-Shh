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
      "img-src 'self' data: https:",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://*.supabase.co" + (isDev ? " ws://localhost:*" : ""),
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;