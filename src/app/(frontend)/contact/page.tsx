import type { Metadata } from "next";

import { ContactComposer } from "@/components/contact-composer";
import { SiteDock } from "@/components/site-dock";
import { SiteHeader } from "@/components/site-header";

import styles from "./contact.module.css";

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
        <div className={`mx-auto w-full max-w-[19rem] ${styles.sequence}`}>
          <h1 className={`text-center text-sm font-normal ${styles.heading}`}>What&apos;s on your mind?</h1>
          <div className={`${styles.reveal} ${styles.emailReveal}`}>
            <div>
              <ContactComposer />
            </div>
          </div>
        </div>
      </main>
      <SiteDock current="/contact" />
    </div>
  );
}
