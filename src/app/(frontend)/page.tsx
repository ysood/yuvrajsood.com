import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background text-foreground dark:bg-black dark:text-white">
      <div className="absolute inset-x-0 top-0">
        <SiteHeader hideNavigation />
      </div>
      <main>
        <h1 className="text-sm">experience in development.</h1>
      </main>
    </div>
  );
}
