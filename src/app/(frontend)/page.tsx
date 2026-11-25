import { HomeRoles } from "@/components/home-roles";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="relative grid min-h-screen justify-items-center bg-background py-24 text-foreground">
      <div className="absolute inset-x-0 top-0">
        <SiteHeader hideNavigation />
      </div>
      <main className="grid w-full max-w-site grid-rows-[minmax(4rem,1fr)_auto_minmax(4rem,1fr)] px-4 sm:px-7">
        <HomeRoles />
      </main>
    </div>
  );
}
