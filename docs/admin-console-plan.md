# Admin console plan

Target branch: `feature/admin-console`

## Intended experience

- Keep `/admin` out of the public navigation.
- Present a minimal sign-in screen with shadcn `Input` and `Button` components.
- After authentication, provide a focused interface for creating and editing products, subscriptions, images, and future site settings.

## Authentication approach

- Keep Payload's `users` collection and role-ready authentication as the underlying security boundary.
- A password-only screen can be the public-facing experience, but it should create a real Payload session behind the scenes.
- Do not commit or compare a literal password in client or server source. Store credentials as a salted password hash through Payload, and keep bootstrap credentials in deployment secrets only.
- Add rate limiting, secure HTTP-only session cookies, generic error responses, and an authentication audit trail before exposing the route publicly.

## Initial implementation scope

1. Add a custom password-only login screen at `/admin`.
2. Use the existing Payload user model for the single initial administrator.
3. Add a `role` field only when a second permission level is actually needed.
4. Build product editing on the existing `products` and `media` collections.
5. Add site-settings controls, including the header identity image, as a separate Payload global.
