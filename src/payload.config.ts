import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
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
  secret: process.env.PAYLOAD_SECRET || "",
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
