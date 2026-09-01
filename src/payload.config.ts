import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import path from "path";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";

import { Media } from "./collections/Media";
import { Products } from "./collections/Products";
import { Users } from "./collections/Users";
import { SiteSettings } from "./globals/SiteSettings";
import { isConfiguredAdmin } from "./access/authenticated";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.SERVER_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined,
  ...(process.env.ADMIN_ALLOWED_ORIGINS?.split(",") ?? []),
]
  .filter((origin): origin is string => Boolean(origin?.trim()))
  .map((origin) => origin.trim());

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: " · yuvrajsood.com",
    },
    user: Users.slug,
  },
  collections: [Users, Products, Media],
  csrf: [...new Set(allowedOrigins)],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
    push: false,
  }),
  editor: lexicalEditor(),
  globals: [SiteSettings],
  plugins: [
    vercelBlobStorage({
      addRandomSuffix: true,
      alwaysInsertFields: true,
      clientUploads: {
        access: ({ collectionSlug, req }) =>
          collectionSlug === "media" && isConfiguredAdmin(req.user),
      },
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || "",
  serverURL: process.env.SERVER_URL,
  sharp,
  upload: {
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  },
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
