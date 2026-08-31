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

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

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
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
    push: false,
  }),
  editor: lexicalEditor(),
  plugins: [
    vercelBlobStorage({
      addRandomSuffix: true,
      alwaysInsertFields: true,
      clientUploads: true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
  routes: {
    admin: "/system",
  },
  secret: process.env.PAYLOAD_SECRET || "",
  serverURL: process.env.SERVER_URL,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
