import Link from "next/link";
import { ImageIcon, Package } from "lucide-react";

const collections = [
  { description: "Products and subscriptions", href: "/admin/cms/products", icon: Package, label: "Products" },
  { description: "Images and alt text", href: "/admin/cms/media", icon: ImageIcon, label: "Media" },
];

export default function CMSPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
      <h1 className="text-3xl font-normal">CMS</h1>
      <p className="mt-2 text-sm text-muted-foreground">Manage the content published on the site.</p>
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {collections.map(({ description, href, icon: Icon, label }) => (
          <Link className="rounded-2xl border bg-card p-5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={href} key={href}>
            <Icon aria-hidden="true" className="mb-8 text-muted-foreground" size={20} />
            <h2 className="font-medium">{label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
