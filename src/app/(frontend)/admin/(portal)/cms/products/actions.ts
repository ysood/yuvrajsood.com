"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminUser } from "@/lib/admin-auth";
import { getPayloadClient } from "@/lib/payload";
import type { Product } from "@/payload-types";

const descriptionSchema = z.object({
  root: z.object({ children: z.array(z.unknown()).max(500), type: z.string().refine((value) => value === "root") }).passthrough(),
}).passthrough();

const productSchema = z.object({
  brand: z.string().trim().min(1, "Brand is required.").max(120),
  category: z.string().trim().min(1, "Category is required.").max(120),
  description: descriptionSchema,
  id: z.number().int().positive().nullable(),
  imageID: z.number().int().positive().nullable(),
  name: z.string().trim().min(1, "Name is required.").max(160),
  price: z.number().finite().min(0, "Price cannot be negative.").max(1_000_000),
  purchaseLink: z.url("Enter a valid purchase URL.").refine((value) => ["http:", "https:"].includes(new URL(value).protocol), "Use an http or https URL."),
  slug: z.string().trim().min(1, "Slug is required.").max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  staffPick: z.boolean(),
  type: z.enum(["product", "subscription"]),
});

export type ProductInput = z.input<typeof productSchema>;
export type ProductActionResult = { error?: string; errors?: Record<string, string[]>; product?: { id: number; slug: string }; success?: string };

function descriptionHasText(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  if ("text" in value && typeof value.text === "string" && value.text.trim()) return true;
  return Object.values(value).some(descriptionHasText);
}

export async function saveProductAction(input: ProductInput): Promise<ProductActionResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { error: "Correct the highlighted fields.", errors: parsed.error.flatten().fieldErrors };
  if (!descriptionHasText(parsed.data.description)) return { error: "Add a description.", errors: { description: ["Description is required."] } };

  const user = await requireAdminUser();
  const payload = await getPayloadClient();
  let previousSlug: string | null = null;

  try {
    if (parsed.data.id) {
      const existing = await payload.findByID({ collection: "products", id: parsed.data.id, overrideAccess: false, user });
      previousSlug = existing.slug;
    }

    const data = {
      brand: parsed.data.brand,
      category: parsed.data.category,
      description: parsed.data.description as Product["description"],
      image: parsed.data.imageID,
      name: parsed.data.name,
      price: parsed.data.price,
      purchaseLink: parsed.data.purchaseLink,
      slug: parsed.data.slug,
      staffPick: parsed.data.staffPick,
      type: parsed.data.type,
    };
    const product = parsed.data.id
      ? await payload.update({ collection: "products", data, id: parsed.data.id, overrideAccess: false, user })
      : await payload.create({ collection: "products", data, overrideAccess: false, user });

    console.info(JSON.stringify({ event: parsed.data.id ? "admin.product.updated" : "admin.product.created", productID: product.id }));
    revalidatePath("/admin/cms/products");
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);
    if (previousSlug && previousSlug !== product.slug) revalidatePath(`/products/${previousSlug}`);
    return { product: { id: product.id, slug: product.slug }, success: "Product saved." };
  } catch {
    return { error: "The product could not be saved. Check that the slug is unique and try again." };
  }
}

export async function deleteProductAction(id: number): Promise<ProductActionResult> {
  const parsedID = z.number().int().positive().safeParse(id);
  if (!parsedID.success) return { error: "Invalid product." };
  const user = await requireAdminUser();
  const payload = await getPayloadClient();
  const existing = await payload.findByID({ collection: "products", id: parsedID.data, overrideAccess: false, user });
  await payload.delete({ collection: "products", id: parsedID.data, overrideAccess: false, user });
  console.info(JSON.stringify({ event: "admin.product.deleted", productID: parsedID.data }));
  revalidatePath("/admin/cms/products");
  revalidatePath("/products");
  revalidatePath(`/products/${existing.slug}`);
  return { success: "Product deleted." };
}
