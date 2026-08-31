import { RichText } from "@payloadcms/richtext-lexical/react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/format-price";
import { getPayloadClient } from "@/lib/payload";
import type { Media } from "@/payload-types";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

const getProduct = cache(async (slug: string) => {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "products",
    depth: 1,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
  });

  return result.docs[0] ?? null;
});

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await getProduct((await params).slug);

  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: `${product.brand} · ${product.category}`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const image =
    product.image && typeof product.image === "object"
      ? (product.image as Media)
      : null;

  return (
    <main className="min-h-screen bg-background pb-24 text-foreground sm:pb-20">
      <SiteHeader />

      <div className="mx-auto w-full max-w-site px-4 sm:px-7">
        <div className="mb-8 mt-8 grid items-end gap-5 sm:mb-10 sm:mt-12 lg:grid-cols-[1fr_auto]">
          <div>
            <Button
              asChild
              className="-ml-3 mb-10 text-muted-foreground hover:bg-transparent hover:text-foreground sm:mb-14"
              variant="ghost"
            >
              <Link href="/products">
                <ArrowLeft aria-hidden="true" size={16} />
                All products
              </Link>
            </Button>
            <p className="mb-2 text-sm text-muted-foreground">
              {product.brand} · {product.category}
            </p>
            <h1 className="text-display font-normal sm:text-display-lg">
              {product.name}
            </h1>
            <p className="mt-3 text-xl font-medium tabular-nums lg:hidden">
              {formatPrice(product.price)}
            </p>
          </div>

          <div className="hidden items-center gap-4 pb-1 lg:flex">
            <p className="text-xl font-medium tabular-nums">
              {formatPrice(product.price)}
            </p>
            <span className="h-6 w-px bg-border" />
            <Button asChild className="h-11 rounded-full px-5">
              <a
                href={product.purchaseLink}
                rel="noreferrer"
                target="_blank"
              >
                Purchase link
                <ArrowUpRight aria-hidden="true" size={16} />
              </a>
            </Button>
          </div>
        </div>

        <Card className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-3xl border-0 p-4 shadow-none sm:h-[560px] sm:p-10 lg:h-[720px]">
          {image?.url ? (
            <Image
              alt={image.alt}
              className="object-contain p-8 sm:p-16"
              fill
              priority
              sizes="(max-width: 639px) 90vw, 94vw"
              src={image.url}
            />
          ) : null}
        </Card>

        <section className="max-w-[540px] pb-10 pt-10 sm:pt-12">
          <h2 className="mb-4 text-section-title font-normal sm:text-section-title-lg">
            About
          </h2>
          <RichText
            className="space-y-5 text-base leading-6 text-muted-foreground"
            data={product.description}
          />
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-background/90 p-4 backdrop-blur-md lg:hidden">
        <Button asChild className="h-12 w-full rounded-full px-5">
          <a
            href={product.purchaseLink}
            rel="noreferrer"
            target="_blank"
          >
            Purchase for {formatPrice(product.price)}
            <ArrowUpRight aria-hidden="true" size={16} />
          </a>
        </Button>
      </div>
    </main>
  );
}
