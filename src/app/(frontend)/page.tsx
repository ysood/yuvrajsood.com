import { HomeRoles } from "@/components/home-roles";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="absolute inset-x-0 top-0">
        <SiteHeader hideNavigation />
      </div>
      <main className="w-full max-w-site px-4 sm:px-7">
        <HomeRoles />
      </main>
    </div>
  );
}
