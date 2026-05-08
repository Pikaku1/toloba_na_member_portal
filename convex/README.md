# Convex in this member repo

**Do not run `npx convex deploy` from this directory** for the shared production deployment.

The canonical backend (schema, functions, Clerk `auth.config.ts`) lives in **`tolobana_admin/convex/`**. Deploy and run `npx convex dev` only from the admin repo.

This folder holds **synced generated bindings** only (`convex/_generated/*`), updated via:

```bash
npm run convex:sync-types
```

Run that after `npx convex codegen` (or `npx convex dev`) in `tolobana_admin`.
