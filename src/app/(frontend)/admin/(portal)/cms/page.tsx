import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminSession } from "@/lib/admin-auth";
import { getPayloadClient } from "@/lib/payload";

const cmsCollections = [
  {
    description: "Products and subscriptions shown on the public site.",
    href: "/admin/cms/products",
    label: "Products",
    slug: "products" as const,
  },
];

const timestampFields = new Set(["createdAt", "updatedAt"]);

const titleCase = (value: string) => value.replace(/([A-Z])/g, " $1").replace(/^./, (character) => character.toUpperCase());

export default async function CMSPage() {
  const user = await getAdminSession();
  if (!user) return null;

  const payload = await getPayloadClient();
  const collections = await Promise.all(
    cmsCollections.map(async (collection) => {
      const { totalDocs } = await payload.count({ collection: collection.slug, overrideAccess: false, user });
      const fields = payload.collections[collection.slug].config.fields.flatMap((field) =>
        "name" in field && field.name && !timestampFields.has(field.name)
          ? [typeof field.label === "string" ? field.label : titleCase(field.name)]
          : [],
      );

      return { ...collection, fields, totalDocs };
    }),
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
      <h1 className="text-3xl font-normal">CMS</h1>
      <p className="mt-2 text-sm text-muted-foreground">Active collections on this site.</p>

      <Accordion className="mt-10 rounded-2xl border bg-card px-5" collapsible type="single">
        {collections.map(({ description, fields, href, label, slug, totalDocs }) => (
          <AccordionItem key={slug} value={slug}>
            <AccordionTrigger>
              <span>
                <span className="block font-medium">{label}</span>
                <span className="mt-1 block text-sm text-muted-foreground tabular-nums">
                  {totalDocs} {totalDocs === 1 ? "item" : "items"}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">{description}</p>
              <dl className="mt-6 space-y-5">
                <div>
                  <dt className="text-xs text-muted-foreground">Collection slug</dt>
                  <dd className="mt-1 font-mono text-sm">{slug}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Fields</dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {fields.map((field) => (
                      <Badge key={field} variant="secondary">{field}</Badge>
                    ))}
                  </dd>
                </div>
              </dl>
              <Button asChild className="mt-7">
                <Link href={href}>
                  Manage items
                  <ArrowRight />
                </Link>
              </Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
