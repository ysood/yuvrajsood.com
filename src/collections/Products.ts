import type { CollectionConfig, FieldHook } from "payload";

import { authenticated } from "@/access/authenticated";

const formatSlug = (value: string) =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const populateSlug: FieldHook = ({ siblingData, value }) => {
  if (typeof value === "string" && value.length > 0) {
    return formatSlug(value);
  }

  if (typeof siblingData.name === "string") {
    return formatSlug(siblingData.name);
  }

  return value;
};

const validatePurchaseLink = (value: null | string | undefined) => {
  if (!value) return true;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol)
      ? true
      : "Use an http or https URL.";
  } catch {
    return "Enter a valid URL.";
  }
};

export const Products: CollectionConfig = {
  slug: "products",
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  admin: {
    defaultColumns: ["name", "type", "brand", "category", "price", "staffPick"],
    useAsTitle: "name",
  },
  defaultSort: "name",
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      hooks: {
        beforeValidate: [populateSlug],
      },
      index: true,
      required: true,
      unique: true,
    },
    {
      name: "type",
      type: "select",
      defaultValue: "product",
      index: true,
      options: [
        {
          label: "Product",
          value: "product",
        },
        {
          label: "Subscription",
          value: "subscription",
        },
      ],
      required: true,
    },
    {
      name: "brand",
      type: "text",
      required: true,
    },
    {
      name: "category",
      type: "text",
      index: true,
      required: true,
    },
    {
      name: "price",
      type: "number",
      min: 0,
      required: true,
    },
    {
      name: "purchaseLink",
      type: "text",
      label: "Purchase link",
      validate: validatePurchaseLink,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "description",
      type: "richText",
      label: "About / description",
      required: true,
    },
    {
      name: "staffPick",
      type: "checkbox",
      defaultValue: false,
      label: "Staff pick",
    },
  ],
};
