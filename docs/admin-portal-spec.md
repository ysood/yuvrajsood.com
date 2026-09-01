# Admin portal specification

Status: Draft for implementation

Target branch: `feature/admin-console`

Primary route: `/admin`

## Purpose

Create a private, responsive administration portal for maintaining site content without exposing Payload's generated interface as the primary experience. The portal should feel like the private counterpart to the public site: minimal, calm, and built from the same shadcn components, design tokens, typography, and theme system.

Version 1 has two sections:

- **Settings**, initially for changing the profile image used in the admin shell.
- **CMS**, for managing products and subscriptions, including each record's image.

The architecture must leave room for more settings, permissions, and collection types without adding those abstractions before they are needed.

## Product decisions

### Custom portal and Payload fallback

- The custom portal owns `/admin`.
- Payload's generated admin interface moves from `/admin` to `/system`.
- `/system` remains authenticated and unlinked from the public site. It is a fallback for bootstrap, recovery, and schema-level administration, not the normal content workflow.
- Moving the route is not a security control. Both interfaces must use the same Payload authentication and access rules.

### Authentication model

- The login screen presents one centered password field and a submit button.
- The administrator identity is implicit and supplied server-side from `ADMIN_EMAIL`. It is never sent as an editable field in the UI.
- The password is stored and hashed by Payload in the existing `users` collection. It must never be hardcoded in source or compared in browser code.
- A successful login creates Payload's secure, HTTP-only session cookie.
- The protected admin layout checks the session on every request. Unauthenticated requests redirect to `/admin/login`.
- Every create, update, and delete operation rechecks the authenticated user on the server and calls the Payload Local API with `overrideAccess: false`.
- Logout invalidates the Payload session and returns to `/admin/login`.
- Version 1 remains single-administrator. Do not add roles until a second permission level has a real use case.

### Session protection

- Use same-origin server actions for login and content mutations.
- Allow CSRF origins only for the production domain, its intentional aliases, Vercel preview domains where needed, and local development.
- Return the same generic message for unknown users and incorrect passwords.
- Rate-limit login attempts by account and IP. Initial policy: five failed attempts in fifteen minutes, followed by a temporary cooldown.
- Do not put passwords, session tokens, database URLs, or mutation payloads containing secrets in application logs.
- Use a finite session lifetime. Twelve hours is the recommended initial value.

## Information architecture

```text
/admin/login
/admin                    -> redirect to /admin/cms
/admin/cms
/admin/cms/products/new
/admin/cms/products/[id]
/admin/settings
/system                   -> generated Payload admin fallback
```

The CMS landing screen lists the active collections. Version 1 has one, Products. The `users` and `media` collections stay out of the CMS interface: media is never browsed on its own, because every image belongs to exactly one owner record.

## Admin shell

### Desktop and tablet

Use a fixed left sidebar that translates the public topbar into a vertical layout.

- **Top:** circular profile image. It opens a small account menu containing the administrator identity and Log out.
- **Middle:** vertically stacked `CMS` and `Settings` navigation, centered in the available sidebar space.
- **Bottom:** the existing icon-only light/dark theme toggle. It must not have a permanent bubble or filled container.

Navigation text uses the same subdued foreground treatment as the public topbar. Hover and keyboard focus increase contrast. The active destination is clear without introducing a visually heavy navigation block.

The main content region scrolls independently and uses a restrained maximum width where forms would otherwise become difficult to scan.

### Mobile

Below the medium breakpoint, turn the sidebar into a compact topbar:

- Profile image on the left.
- `CMS` and `Settings` centered horizontally.
- Icon-only theme toggle on the right.

There are only two primary destinations, so version 1 does not need a hamburger menu. Content becomes single-column, tables gain a compact card representation, and destructive actions remain reachable without horizontal scrolling.

### Design system rules

- Source colors, radii, spacing, borders, typography, and dark-mode values from the shared shadcn theme tokens in `globals.css`.
- Continue using the site's current Geist typefaces through the existing font variables.
- Prefer shadcn primitives for `Avatar`, `Button`, `Input`, `Select`, `Switch`, `Table`, `Dialog`, `AlertDialog`, `DropdownMenu`, `Tooltip`, `Skeleton`, and toast feedback.
- Add custom CSS only for layout and behavior not expressed cleanly by the shared primitives.
- Preserve visible focus states, keyboard navigation, labels, useful error text, and `aria-live` feedback for asynchronous saves.
- Respect the saved system/light/dark preference across both the public site and admin portal.

## Login experience

The login page is deliberately spare:

- Centered card or form region on the page, without public navigation.
- Small profile mark or site identity above the form.
- Password input, Show/Hide control, and `Sign in` button.
- Submit on Enter.
- Disabled and loading states while authentication is pending.
- Generic inline failure message and a clear cooldown message when rate-limited.
- No password reset workflow in version 1. Recovery uses the generated Payload admin or an explicit server-side reset procedure.

## Settings section

### Version 1: profile image

Add a Payload global named `site-settings` with a `profileImage` upload relationship to `media`. A global is appropriate because there is one site-level value, not a list of records.

The Settings screen contains:

- Current circular image preview.
- `Choose image` or drag-and-drop upload action. Choosing a file uploads and saves it in one step, with no intermediate confirmation.
- `Replace` and `Remove`, which save immediately and delete the superseded asset.
- File-type and file-size validation. Alt text is set automatically.

Saving updates the sidebar avatar immediately. The same global becomes the source of truth for the public header avatar when that integration is approved; changing the public homepage or header is not part of this portal's first implementation.

The existing `small` media variant should be used for the rendered avatar. Original assets remain available for later contexts.

### Production upload prerequisite

Before enabling uploads in production, configure the Payload Vercel Blob storage adapter for the existing `media` collection. Use client uploads so larger files do not pass through Vercel's server request body limit. The database stores media metadata and URLs, while binary files live in Blob storage.

## CMS section

### Landing view

The CMS landing screen presents the active collections as an accordion. Expanding one shows its slug, item count, and fields, plus a `Manage items` action that opens the collection's list view.

The Products view includes:

- `New item` primary action.
- Search by name, brand, category, or slug.
- Filters for type and staff-pick status. Category can become a filter once enough values exist to justify it.
- Sorting by most recently updated, name, and price.
- Responsive rows/cards showing name, type, category, price, staff-pick state, update time, and edit action.
- Empty, loading, error, and no-results states.

### Product and subscription editor

Products and subscriptions remain records in the existing `products` collection. The editor maps directly to its schema:

| Field | UI | Behavior |
| --- | --- | --- |
| Name | Input | Required |
| Slug | Input | Auto-generated from name, editable in an advanced section, unique |
| Type | Select | Required, `Product` or `Subscription` |
| Brand | Input | Optional |
| Category | Input | Optional free text in version 1 |
| Price | Number input | Optional, non-negative, stored in major currency units under the current schema |
| Purchase Link | URL input | Optional, validated URL |
| Image | Inline upload | Optional, one media relationship owned solely by this record |
| About/Description | Payload rich-text editor | Optional |
| Staff Pick | Switch | Defaults to false |

Editor actions:

- `Save` and `Cancel` are always clear.
- Successful saves show toast feedback and refresh the affected admin and public product routes.
- A public preview link appears once a record has a valid slug.
- Navigating away with unsaved changes prompts for confirmation.
- Delete uses an `AlertDialog`, names the affected item, and requires explicit confirmation.
- Validation errors appear beside the responsible fields and at a short page-level summary.

Autosave, scheduled publishing, revisions, and bulk editing are out of scope for version 1.

### Image ownership

There is no media library. Every image belongs to exactly one owner: a product, or the `site-settings` profile image. Images are uploaded from the owner's own editor and are never browsed or reused across records.

- Uploading replaces the owner's current image and deletes the superseded asset once the change is saved.
- Deleting a product deletes its image.
- Alt text is derived from the owner, the product name or `Profile image`, and is kept in sync when the product is renamed.
- Deletion always re-checks references first, so an asset that is still pointed at by any record is left in place.

Accepted formats should initially be PNG, JPEG, WebP, and AVIF. SVG upload remains disabled unless a sanitization policy is added.

### Mutation boundary

- Browser components do not receive database credentials or a privileged API token.
- Reads may use server components and Payload's Local API.
- Mutations use server actions or same-origin route handlers.
- Every Local API mutation supplies the authenticated user and sets `overrideAccess: false`, because Local API access control is overridden by default if this is omitted.
- Product changes revalidate `/products`, the affected `/products/[slug]` route, and relevant admin views.

## Creating new collections

### Version 1 decision

A prominent `New collection` control must not directly create arbitrary production tables. Payload collections are code-defined configuration that generates APIs and database schema. A new collection therefore requires code generation, updated types, a migration, review, and deployment.

Version 1 may show a secondary `New collection` action with a short explanatory dialog labelled `Planned`. It must not imply that a runtime collection can already be created safely.

### Future schema-builder workflow

When implemented, `New collection` should launch a constrained schema builder:

1. Enter a display name, validated slug, singular/plural labels, and description.
2. Add fields from an allowlist: text, number, boolean, select, URL, rich text, media relationship, and supported relationships.
3. Configure required, unique, default, and admin-display options.
4. Preview the generated Payload collection config and migration.
5. Create a short-lived Git branch such as `feature/collection-<slug>` through a narrowly scoped GitHub integration.
6. Generate the collection file, register it in Payload config, regenerate TypeScript types, and generate a migration.
7. Apply and test the migration on an isolated Neon branch and Vercel preview deployment.
8. Present the preview and diff for human approval before merging and deploying to production.
9. Detect the deployed collection automatically and expose it in the CMS navigation.

The builder must not accept arbitrary JavaScript, hooks, SQL, access-control code, or reserved collection names. It needs an audit trail and an explicit rollback path. A GitHub credential, Neon branch automation, and deployment status integration would be new infrastructure and require separate approval.

A generic entity-attribute-value content system is not recommended as a shortcut. It would weaken Payload's generated types, validation, relationships, and predictable APIs.

## Data model changes

### Keep

- `users`: underlying Payload authentication. No role field in version 1.
- `products`: existing product and subscription fields and access controls.
- `media`: existing upload collection and responsive sizes.

### Add

- `site-settings` Payload global:
  - `profileImage`: optional upload relationship to `media`.

### Defer

- User roles and multiple administrators.
- Persistent admin audit-event collection. Authentication and mutation events should still be emitted as structured server logs in version 1, without sensitive payloads.
- Collection schema definitions stored as editable production data.

## Environment and deployment configuration

Required or existing server-side variables:

- `DATABASE_URL`: pooled Neon runtime connection.
- `DATABASE_URL_UNPOOLED`: direct Neon connection for migrations.
- `PAYLOAD_SECRET`: Payload authentication and encryption secret.
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob adapter credential.
- `ADMIN_EMAIL`: implicit Payload user identity for password-only login.
- `SERVER_URL`: canonical production origin used by Payload and CSRF configuration.

Future collection-builder flag:

- `SCHEMA_BUILDER_ENABLED=false`

Secrets must be configured separately for local, preview, and production environments. No secret belongs in a `NEXT_PUBLIC_` variable.

## Delivery phases

1. **Storage and routing:** configure Vercel Blob, move generated Payload admin to `/system`, and verify migrations and imports.
2. **Authentication shell:** implement password-only login, session checks, rate limiting, logout, responsive sidebar/topbar, and theme behavior.
3. **Settings:** add the `site-settings` global and profile-image workflow.
4. **CMS:** implement product/subscription list, create, edit, and delete workflows, including inline image upload.
5. **Hardening:** add accessibility checks, destructive-action safeguards, structured audit logging, error states, and responsive browser tests.
6. **Future schema builder:** design and implement the branch, preview, review, migration, and deploy workflow as a separate project.

Each phase should be a small cohesive commit and must pass lint, type checking, production build, and relevant route/API checks before it is pushed.

## Acceptance criteria

### Authentication and authorization

- An unauthenticated request to any `/admin/*` route redirects to `/admin/login`.
- A valid password creates an HTTP-only Payload session without exposing the configured identity.
- Invalid credentials receive a generic response and repeated failures are rate-limited.
- Logout invalidates the session.
- An unauthenticated direct mutation fails even if the caller bypasses the UI.
- All Local API mutations execute with `overrideAccess: false` and the current authenticated user.

### Layout and theme

- Desktop shows profile image at the top, vertically centered CMS/Settings navigation, and an unboxed theme icon at the bottom.
- Mobile presents the equivalent controls in a compact topbar without horizontal overflow.
- Light and dark themes use shared shadcn tokens and persist across public and admin routes.
- All interactive controls work with keyboard navigation and visible focus.

### Settings

- The administrator can choose, upload, preview, save, replace, and remove the profile image.
- Production files are stored in Vercel Blob and metadata remains in Payload/Neon.
- A saved change is immediately visible in the admin shell.

### CMS

- The administrator can list, search, create, edit, preview, and delete products and subscriptions.
- Required and format validations match the Payload schema.
- Uploading a replacement image removes the superseded asset, and deleting a product removes its image.
- An asset that is still referenced by any record is never deleted.
- Successful mutations revalidate the relevant public pages and return useful feedback.

### Verification matrix

- Viewports: 320 px, 390 px, 768 px, and 1440 px.
- Themes: light and dark.
- States: logged out, invalid password, rate-limited, empty CMS, populated CMS, validation failure, upload in progress, save success, server failure, and destructive confirmation.
- Checks: lint, type checking, production build, migration status, authentication boundaries, public product API, and deployed route smoke tests.

## Explicitly out of scope for version 1

- Public homepage or tour/contact redesign.
- Multiple accounts, invitations, roles, or granular editorial permissions.
- Password reset UI.
- Arbitrary runtime collection creation.
- Bulk operations, drag ordering, autosave, revisions, workflow approvals, or scheduled publishing.
- Analytics and dashboard reporting.
