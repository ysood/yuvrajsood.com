import { ArrowUpRight, BadgeCheck } from "lucide-react";
import Link from "next/link";

import type { Media, Product } from "@/payload-types";
import { formatPrice } from "@/lib/format-price";
import { getProductImageSource } from "@/lib/product-image-source";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ProductImage } from "@/components/product-image";

export function ProductCard({ product }: { product: Product }) {
  const image: Media | null = product.image && typeof product.image === "object" ? product.image : null;
  const imageSource = image && getProductImageSource(image);

  return (
    <Card className="group relative min-h-[344px] gap-0 overflow-hidden rounded-2xl border-0 py-0 shadow-none sm:min-h-[400px] lg:aspect-square lg:min-h-0">
      <Link
        aria-label={`View ${product.name}`}
        className="absolute inset-0 z-10"
        href={`/products/${product.slug}`}
      />

      <CardContent className="relative flex min-h-0 flex-1 items-center justify-center p-6 sm:p-8">
        {image && imageSource ? (
          <ProductImage
            alt={image.alt}
            className="object-contain p-10 sm:p-12"
            sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 32vw"
            {...imageSource}
          />
        ) : null}

        {product.staffPick ? (
          <Badge className="absolute left-4 top-4 text-highlight-foreground" variant="ghost">
            <BadgeCheck aria-hidden="true" fill="currentColor" size={15} />
            <span>my pick</span>
          </Badge>
        ) : null}

        <Button
          asChild
          className="absolute right-4 top-4 rounded-full text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          size="icon"
          variant="secondary"
        >
          <span aria-hidden="true">
            <ArrowUpRight size={17} strokeWidth={1.6} />
          </span>
        </Button>
      </CardContent>

      <CardFooter className="grid grid-cols-[1fr_auto] gap-x-4 px-4 pb-4 text-sm leading-5">
        <p className="col-span-2 text-muted-foreground">
          {product.brand} · {product.category}
        </p>
        <h2 className="truncate font-normal">{product.name}</h2>
        <p className="tabular-nums">{formatPrice(product.price)}</p>
      </CardFooter>
    </Card>
  );
}
