import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Without PUBLIC_API_URL the API returns relative /uploads paths. Proxy them
  // to the API like the admin and vendor apps, or they 404 on the storefront.
  // Set API_URL=http://localhost:4000/api/v1 in .env.local for a local API; the
  // live API is the default so a production build without .env.local still works.
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${(process.env.API_URL || "https://api.barwaqt.com/api/v1").replace(/\/api\/v1\/?$/, "")}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
