import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin/cms");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-sm" aria-labelledby="admin-login-title">
        <div className="mb-10 flex size-11 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
          YS
        </div>
        <h1 className="text-2xl font-normal" id="admin-login-title">
          Admin
        </h1>
        <p className="mb-7 mt-2 text-sm text-muted-foreground">
          Sign in to manage site content.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
