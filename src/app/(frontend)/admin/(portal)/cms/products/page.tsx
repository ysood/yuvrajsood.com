import { Plus, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format-price";
import { getAdminSession } from "@/lib/admin-auth";
import { getPayloadClient } from "@/lib/payload";
import type { Where } from "payload";

const allowedSorts = new Set(["-updatedAt", "name", "price"]);

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getAdminSession();
  if (!user) return null;
  const query = await searchParams;
  const search = typeof query.q === "string" ? query.q.trim().slice(0, 120) : "";
  const type = query.type === "product" || query.type === "subscription" ? query.type : "";
  const staff = query.staff === "true" ? true : query.staff === "false" ? false : null;
  const sort = typeof query.sort === "string" && allowedSorts.has(query.sort) ? query.sort : "-updatedAt";
  const and: Where[] = [];
  if (search) and.push({ or: ["name", "brand", "category", "slug"].map((field) => ({ [field]: { contains: search } })) });
  if (type) and.push({ type: { equals: type } });
  if (staff !== null) and.push({ staffPick: { equals: staff } });

  const payload = await getPayloadClient();
  const products = await payload.find({ collection: "products", depth: 0, limit: 100, overrideAccess: false, select: { brand: true, category: true, name: true, price: true, staffPick: true, type: true, updatedAt: true }, sort, user, where: and.length ? { and } : undefined });

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex items-start justify-between gap-4"><div><h1 className="text-3xl font-normal">Products</h1><p className="mt-2 text-sm text-muted-foreground">Products and subscriptions shown on the public site.</p></div><Button asChild><Link href="/admin/cms/products/new"><Plus />New item</Link></Button></div>
      <form className="mt-8 grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-[1fr_auto_auto_auto]" method="get">
        <div className="relative"><Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} /><Input className="pl-9" defaultValue={search} name="q" placeholder="Search products" /></div>
        <select className="h-9 rounded-md border bg-background px-3 text-sm" defaultValue={type} name="type"><option value="">All types</option><option value="product">Products</option><option value="subscription">Subscriptions</option></select>
        <select className="h-9 rounded-md border bg-background px-3 text-sm" defaultValue={staff === null ? "" : String(staff)} name="staff"><option value="">All picks</option><option value="true">Staff picks</option><option value="false">Not staff picks</option></select>
        <select className="h-9 rounded-md border bg-background px-3 text-sm" defaultValue={sort} name="sort"><option value="-updatedAt">Recently updated</option><option value="name">Name</option><option value="price">Price</option></select>
        <Button className="sm:col-start-4" type="submit" variant="outline">Apply</Button>
      </form>
      {products.docs.length ? (
        <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
          <div className="hidden grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto_auto] gap-4 border-b px-4 py-3 text-xs text-muted-foreground md:grid"><span>Name</span><span>Type</span><span>Category</span><span>Price</span><span>Pick</span><span /></div>
          {products.docs.map((product) => <div className="grid gap-2 border-b px-4 py-4 last:border-b-0 md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto_auto] md:items-center md:gap-4" key={product.id}><div className="min-w-0"><p className="truncate text-sm font-medium">{product.name}</p><p className="truncate text-xs text-muted-foreground">{product.brand} · Updated {new Intl.DateTimeFormat("en-AU", { dateStyle: "medium" }).format(new Date(product.updatedAt))}</p></div><p className="hidden text-sm capitalize text-muted-foreground md:block">{product.type}</p><p className="hidden text-sm text-muted-foreground md:block">{product.category}</p><p className="hidden text-sm tabular-nums md:block">{formatPrice(product.price)}</p><p className="hidden text-xs text-muted-foreground md:block">{product.staffPick ? "Yes" : "No"}</p><p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground md:hidden"><span className="capitalize">{product.type}</span><span aria-hidden="true">·</span><span>{product.category}</span><span aria-hidden="true">·</span><span className="tabular-nums text-foreground">{formatPrice(product.price)}</span>{product.staffPick ? <><span aria-hidden="true">·</span><span>Staff pick</span></> : null}</p><Button asChild className="justify-self-start md:justify-self-auto" size="sm" variant="ghost"><Link href={`/admin/cms/products/${product.id}`}>Edit</Link></Button></div>)}
        </div>
      ) : <div className="mt-8 rounded-2xl border p-10 text-center"><p className="text-sm text-muted-foreground">{search || type || staff !== null ? "No products match these filters." : "No products yet."}</p></div>}
    </div>
  );
}
