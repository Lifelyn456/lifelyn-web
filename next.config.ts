import type { NextConfig } from "next";
const apiOrigin = (() => {
  try {
    const configured = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (process.env.NODE_ENV === "production" && !configured) throw new Error();
    const parsed = new URL(configured ?? "http://localhost:4000/v1");
    if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") throw new Error();
    return parsed.origin;
  } catch {
    throw new Error("Production NEXT_PUBLIC_API_BASE_URL must be an absolute HTTPS URL.");
  }
})();
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  `connect-src 'self' ${apiOrigin}`,
].join("; ");
const config: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), publickey-credentials-get=(self), publickey-credentials-create=(self)",
          },
        ],
      },
    ];
  },
};
export default config;
