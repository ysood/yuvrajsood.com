import config from "@payload-config";
import { getPayload } from "payload";

import type { Product } from "./payload-types";

const richText = (...paragraphs: string[]): Product["description"] => ({
  root: {
    type: "root",
    children: paragraphs.map((text) => ({
      type: "paragraph",
      children: [
        {
          type: "text",
          detail: 0,
          format: 0,
          mode: "normal",
          style: "",
          text,
          version: 1,
        },
      ],
      direction: null,
      format: "",
      indent: 0,
      textFormat: 0,
      textStyle: "",
      version: 1,
    })),
    direction: null,
    format: "",
    indent: 0,
    version: 1,
  },
});

const products = [
  {
    name: "Studio Display",
    slug: "studio-display",
    type: "product",
    brand: "Apple",
    category: "Tech",
    price: 1599,
    purchaseLink: "https://www.apple.com/studio-display/",
    staffPick: true,
    description: richText(
      "A focused desktop display with a clean aluminium enclosure, crisp 5K panel, and a useful built-in camera and speaker system.",
      "This entry is placeholder editorial copy for the new product system. It can be replaced from Payload as the catalogue takes shape.",
    ),
  },
  {
    name: "Stagg EKG Electric Kettle",
    slug: "stagg-ekg-electric-kettle",
    type: "product",
    brand: "Fellow",
    category: "Coffee",
    price: 200,
    purchaseLink:
      "https://fellowproducts.com/products/stagg-ekg-electric-pour-over-kettle",
    staffPick: false,
    description: richText(
      "A temperature-controlled gooseneck kettle built for measured pours and repeatable brewing.",
      "The restrained controls and compact footprint make it straightforward to keep on a kitchen bench rather than store away.",
    ),
  },
  {
    name: "Aeron Chair",
    slug: "aeron-chair",
    type: "product",
    brand: "Herman Miller",
    category: "Workspace",
    price: 1930,
    purchaseLink:
      "https://www.hermanmiller.com/products/seating/office-chairs/aeron-chairs/",
    staffPick: true,
    description: richText(
      "An ergonomic work chair designed around support, adjustability, and long sessions at a desk.",
      "This seeded record exists to exercise longer names, larger prices, and the staff-pick treatment before final products are entered.",
    ),
  },
] satisfies Array<Omit<Product, "createdAt" | "id" | "image" | "updatedAt">>;

const payload = await getPayload({ config });

for (const product of products) {
  const existing = await payload.find({
    collection: "products",
    limit: 1,
    overrideAccess: true,
    where: {
      slug: {
        equals: product.slug,
      },
    },
  });

  if (existing.totalDocs === 0) {
    await payload.create({
      collection: "products",
      data: product,
      overrideAccess: true,
    });
    payload.logger.info(`Seeded product: ${product.name}`);
  } else {
    payload.logger.info(`Skipped existing product: ${product.name}`);
  }
}

payload.logger.info("Product seed complete.");
process.exit(0);
