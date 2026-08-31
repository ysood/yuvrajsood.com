import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_type" AS ENUM('product', 'subscription');
  ALTER TABLE "products" ADD COLUMN "type" "enum_products_type" DEFAULT 'product' NOT NULL;
  CREATE INDEX "products_type_idx" ON "products" USING btree ("type");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "products_type_idx";
  ALTER TABLE "products" DROP COLUMN "type";
  DROP TYPE "public"."enum_products_type";`)
}
