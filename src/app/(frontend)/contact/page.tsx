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
    <div className="relative flex min-h-screen items-center justify-center bg-background py-24 text-foreground">
      <div className="absolute inset-x-0 top-0">
        <SiteHeader hideNavigation />
      </div>
      <main className="w-full max-w-site px-4 sm:px-7">
        <details className="mx-auto w-full max-w-[23rem]">
          <summary className="mx-auto w-fit cursor-pointer list-none rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
            <h1 className="text-center text-sm font-normal">What&apos;s on your mind?</h1>
          </summary>
          <ContactComposer />
        </details>
      </main>
      <SiteDock current="/contact" />
    </div>
  );
}
