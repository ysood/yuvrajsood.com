import type { Metadata } from "next";

import { ContactComposer } from "@/components/contact-composer";
import { SiteDock } from "@/components/site-dock";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Yuvraj Sood.",
};

export default function ContactPage() {
  return (
    <div className="relative grid min-h-screen justify-items-center bg-background py-24 text-foreground">
      <div className="absolute inset-x-0 top-0">
        <SiteHeader hideNavigation />
      </div>
      <main className="grid w-full max-w-site grid-rows-[minmax(2rem,1fr)_auto_minmax(2rem,1fr)] px-4 sm:px-7">
        <ContactComposer />
      </main>
      <SiteDock current="/contact" />
    </div>
  );
}
