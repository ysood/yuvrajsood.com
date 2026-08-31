"use server";

import config from "@payload-config";
import { login, logout } from "@payloadcms/next/auth";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  clearLoginRateLimit,
  getLoginRateLimit,
  recordFailedLogin,
} from "@/lib/admin-rate-limit";

export type LoginState = {
  message?: string;
  retryAfterSeconds?: number;
};

const passwordSchema = z.string().min(1).max(100);

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = passwordSchema.safeParse(formData.get("password"));
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const rateLimit = await getLoginRateLimit();

  if (rateLimit.retryAfterSeconds > 0) {
    return {
      message: "Too many attempts. Try again when the cooldown ends.",
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    };
  }

  if (!password.success || !adminEmail) {
    await recordFailedLogin(rateLimit.key);
    return { message: "Unable to sign in with that password." };
  }

  try {
    await login({
      collection: "users",
      config,
      email: adminEmail,
      password: password.data,
    });
    await clearLoginRateLimit(rateLimit.key);
    console.info(JSON.stringify({ event: "admin.login.succeeded" }));
  } catch {
    await recordFailedLogin(rateLimit.key);
    console.warn(JSON.stringify({ event: "admin.login.failed" }));
    return { message: "Unable to sign in with that password." };
  }

  redirect("/admin/cms");
}

export async function logoutAction() {
  await logout({ config });
  console.info(JSON.stringify({ event: "admin.logout.succeeded" }));
  redirect("/admin/login");
}
