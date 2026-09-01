import type { Access } from "payload";

export const configuredAdminEmail = () =>
  process.env.ADMIN_EMAIL?.trim().toLowerCase() || "admin@yuvrajsood.com";

export const isConfiguredAdmin = (user: Parameters<Access>[0]["req"]["user"]) => {
  const adminEmail = configuredAdminEmail();
  return Boolean(
    user &&
      user.collection === "users" &&
      user.email.toLowerCase() === adminEmail,
  );
};

export const authenticated: Access = ({ req }) => isConfiguredAdmin(req.user);
