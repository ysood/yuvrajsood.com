#!/usr/bin/env node
// Delete Blob objects that no media row references. Dry run unless --delete.
//
//   node scripts/prune-orphan-blobs.mjs            # report only
//   node scripts/prune-orphan-blobs.mjs --delete   # actually remove

import { del, list } from "@vercel/blob";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local", quiet: true });

const token = process.env.BLOB_READ_WRITE_TOKEN;
const connectionString = process.env.DATABASE_URL;
if (!token || !connectionString) {
  console.error("BLOB_READ_WRITE_TOKEN and DATABASE_URL must be set.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const { rows } = await pool.query("select filename from media where filename is not null");
const referenced = new Set(rows.map((row) => row.filename));

const { blobs } = await list({ token });
const orphans = blobs.filter((blob) => !referenced.has(blob.pathname));

console.log(`media rows: ${referenced.size}   blob objects: ${blobs.length}   orphans: ${orphans.length}`);
for (const blob of blobs) {
  const orphan = !referenced.has(blob.pathname);
  console.log(`  ${orphan ? "ORPHAN " : "in use "} ${blob.pathname} (${blob.size} bytes)`);
}

if (!orphans.length) {
  console.log("Nothing to prune.");
} else if (process.argv.includes("--delete")) {
  await del(orphans.map((blob) => blob.url), { token });
  console.log(`Deleted ${orphans.length} orphaned object(s).`);
} else {
  console.log(`\nDry run. Re-run with --delete to remove the ${orphans.length} orphan(s) above.`);
}

await pool.end();
