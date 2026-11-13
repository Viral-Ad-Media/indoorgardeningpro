import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Match the old WordPress URLs, which all ended in a slash.
  // (API routes such as Better Auth are exempted in src/middleware.ts.)
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,
  async redirects() {
    return [
      // Old dated permalinks such as /2022/04/16/indoor-plant-fertilizer/
      {
        source: "/:y(\\d{4})/:m(\\d{2})/:d(\\d{2})/:slug/",
        destination: "/:slug/",
        permanent: true,
      },
      // Old WordPress entry points that should never resolve on the new site.
      { source: "/wp-admin/:path*", destination: "/admin/", permanent: false },
      { source: "/wp-login.php", destination: "/sign-in/", permanent: false },
      { source: "/feed/", destination: "/sitemap.xml", permanent: true },
      // Old sized WordPress image URLs fall back to the original upload.
      {
        source: "/wp-content/uploads/:y/:m/:file",
        destination: "/uploads/:y/:m/:file",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
