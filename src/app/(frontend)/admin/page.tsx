import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (await getAdminSession()) redirect("/admin/cms");

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <LoginForm />
    </main>
  );
}
