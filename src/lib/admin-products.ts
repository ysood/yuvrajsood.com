import { toAdminMediaItem, type AdminMediaItem } from "@/lib/admin-media";
import type { Product } from "@/payload-types";

export type AdminProduct = {
  brand: string;
  category: string;
  description: Product["description"];
  id: number;
  image: AdminMediaItem | null;
  name: string;
  price: number;
  purchaseLink: string;
  slug: string;
  staffPick: boolean;
  type: "product" | "subscription";
  updatedAt: string;
};

export function toAdminProduct(product: Product): AdminProduct {
  return {
    brand: product.brand,
    category: product.category,
    description: product.description,
    id: product.id,
    image: product.image && typeof product.image === "object" ? toAdminMediaItem(product.image) : null,
    name: product.name,
    price: product.price,
    purchaseLink: product.purchaseLink,
    slug: product.slug,
    staffPick: Boolean(product.staffPick),
    type: product.type,
    updatedAt: product.updatedAt,
  };
}

export const emptyDescription: Product["description"] = {
  root: {
    children: [{ children: [], direction: null, format: "", indent: 0, type: "paragraph", version: 1 }],
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
};
