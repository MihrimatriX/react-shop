import type { NextConfig } from "next";

// GitHub Pages: yalnızca statik frontend (API ayrı sunucuda, NEXT_PUBLIC_API_URL ile).
const pages = process.env.GITHUB_PAGES === "true";

// API başka origin'den (GitHub Pages) çağrılacağı için CORS gerekli.
// Kimlik doğrulama Bearer header ile (cookie yok), "*" güvenli; kısıtlamak için CORS_ORIGIN ver.
const allowOrigin = process.env.CORS_ORIGIN || "*";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  agentRules: false,
  ...(pages
    ? {
        output: "export",
        basePath: "/react-shop",
        env: { NEXT_PUBLIC_BASE_PATH: "/react-shop" },
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {
        output: "standalone",
        async headers() {
          return [
            {
              source: "/api/:path*",
              headers: [
                { key: "Access-Control-Allow-Origin", value: allowOrigin },
                { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
                { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
