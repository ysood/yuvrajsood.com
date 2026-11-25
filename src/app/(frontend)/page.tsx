import { SiteHeader } from "@/components/site-header";

const roles = [
  { id: "son", label: "Son" },
  { id: "creative-director", label: "Creative Director" },
  { id: "founder", label: "Founder" },
  { id: "student", label: "Student" },
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="absolute inset-x-0 top-0">
        <SiteHeader hideNavigation />
      </div>
      <main>
        <ul className="grid gap-2 text-center text-sm">
          {roles.map((role) => (
            <li key={role.id}>{role.label}</li>
          ))}
        </ul>
      </main>
    </div>
  );
}
