# Project instructions

- Keep responses direct and concise. Avoid unnecessary fluff.
- Keep `main` deployable and create short-lived branches from the latest `main`.
- Commit cohesive, verified checkpoints frequently so work remains easy to review, revert, and hand off.
- Use concise conventional commit messages, and avoid bundling unrelated changes into one commit.
- Use simple, descriptive branch names with one of these prefixes: `feature/`, `fix/`, `cleanup/`, or `chore/`.
- Do not include `codex/` or other agent-related prefixes.
- Use issue numbers only when a matching GitHub issue exists, for example `feature/42-products-grid`.
- Treat slashes as naming categories, not as parent-child branch relationships.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
