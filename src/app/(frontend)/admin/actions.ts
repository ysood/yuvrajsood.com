"use server";

import config from "@payload-config";
import { logout } from "@payloadcms/next/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createLocalReq, loginOperation } from "payload";
import { z } from "zod";

import { configuredAdminEmail } from "@/access/authenticated";
import {
  clearLoginRateLimit,
  getLoginRateLimit,
  recordFailedLogin,
} from "@/lib/admin-rate-limit";
import { ensureAdminCredential } from "@/lib/admin-auth";
import { getPayloadClient } from "@/lib/payload";

export type LoginState = {
  message?: string;
  retryAfterSeconds?: number;
};

const passwordSchema = z.string().min(1).max(100);

async function recordLoginFailure(key: string) {
  try {
    await recordFailedLogin(key);
  } catch {
    console.error(JSON.stringify({ event: "admin.login.rate-limit-write-failed" }));
  }
}

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = passwordSchema.safeParse(formData.get("password"));
  const adminEmail = configuredAdminEmail();
  let rateLimit;
  try {
    rateLimit = await getLoginRateLimit();
  } catch {
    console.error(JSON.stringify({ event: "admin.login.rate-limit-read-failed" }));
    return { message: "Unable to sign in right now. Try again shortly." };
  }

  if (rateLimit.retryAfterSeconds > 0) {
    return {
      message: "Too many attempts. Try again when the cooldown ends.",
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    };
  }

  if (!password.success) {
    await recordLoginFailure(rateLimit.key);
    return { message: "Unable to sign in with that password." };
  }

  try {
    await ensureAdminCredential();
    const payload = await getPayloadClient();
    const result = await loginOperation({
      collection: payload.collections.users,
      data: { email: adminEmail, password: password.data },
      req: await createLocalReq({}, payload),
    });

    if (!result.token || !result.exp) throw new Error("Missing login token");

    const cookieStore = await cookies();
    cookieStore.set(`${payload.config.cookiePrefix}-token`, result.token, {
      expires: new Date(result.exp * 1000),
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  } catch {
    await recordLoginFailure(rateLimit.key);
    console.warn(JSON.stringify({ event: "admin.login.failed" }));
    return { message: "Unable to sign in with that password." };
  }

  try {
    await clearLoginRateLimit(rateLimit.key);
  } catch {
    console.error(JSON.stringify({ event: "admin.login.rate-limit-clear-failed" }));
  }
  console.info(JSON.stringify({ event: "admin.login.succeeded" }));

  redirect("/admin/cms");
}

export async function logoutAction() {
  await logout({ config });
  console.info(JSON.stringify({ event: "admin.logout.succeeded" }));
  redirect("/admin");
}
