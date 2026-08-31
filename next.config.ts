import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import path from "path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const serverActionOrigins = [
  process.env.SERVER_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined,
  ...(process.env.ADMIN_ALLOWED_ORIGINS?.split(",") ?? []),
]
  .filter((origin): origin is string => Boolean(origin?.trim()))
  .map((origin) => {
    try {
      return new URL(origin.trim()).host;
    } catch {
      return origin.trim();
    }
  });

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [...new Set(serverActionOrigins)],
    },
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  images: {
    localPatterns: [
      {
        pathname: "/api/media/file/**",
      },
    ],
    remotePatterns: [
      {
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
        protocol: "https",
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };

    return webpackConfig;
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
