import type { Access } from "payload";

export const isConfiguredAdmin = (user: Parameters<Access>[0]["req"]["user"]) => {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(
    adminEmail &&
      user &&
      user.collection === "users" &&
      user.email.toLowerCase() === adminEmail,
  );
};

export const authenticated: Access = ({ req }) => isConfiguredAdmin(req.user);
