# Tolobana — Member Portal

Member-facing portal for the Tolobana / Khidmat platform. Members log in with their **ITS number**, read announcements, fill out surveys, and log contributions to hub collections.

The **admin console** (separate repo) is where staff manage all content. Both apps share **one Convex deployment** — the member portal has read-only access to admin-owned tables and full access to member-owned tables. See [§ Convex access model](#convex-access-model) below.

Stack: React (Vite), Convex (shared deployment). **No Clerk.**

---

## Prerequisites

- Node.js **≥ 20.12** (Convex CLI needs `util.styleText`; 20.11 and older will crash). **22 LTS** recommended — add `.nvmrc` with `22`, run `nvm use`.
- Access to the shared Convex deployment URL (same one the admin console uses — get it from that repo's `.env.local`).
- The `members` table must be seeded with ITS numbers before any member can log in. The dev team handles this directly in Convex.

---

## Setup

1. **Install**

   ```bash
   npm install
   ```

2. **Convex (backend source of truth: admin repo)**

   Schema and all Convex functions live in **`tolobana_admin/convex/`** only. Running **`npx convex deploy`** (or **`npx convex dev`**) from **this** repo’s root would overwrite the shared deployment and can break Clerk on the admin app or member APIs.

   To change the backend: use the **admin** repo (`nvm use`, then `npx convex dev` or `npx convex deploy` there).

   To refresh TypeScript bindings after admin codegen:

   ```bash
   npm run convex:sync-types
   ```

   This copies `tolobana_admin/convex/_generated/` into `toloba_na_member_portal/convex/_generated/`. Run it whenever the admin team changes Convex functions or you pull backend-related changes.

   See also [`convex/README.md`](convex/README.md).

3. **Frontend env**

   Copy `.env.example` to `.env.local` and set:

   ```
   VITE_CONVEX_URL=<shared deployment URL>
   ```

   This is the **only** env var needed. No Clerk keys — this app does not use Clerk.

4. **Run**

   ```bash
   npm run dev
   ```

   Open `/login`. Enter an ITS number to authenticate.

---

## Convex access model

One deployment, two access levels:

| Table | Owned by | Member portal access |
|-------|----------|----------------------|
| `announcements` | Admin | Read only |
| `forms` | Admin | Read only |
| `questions` | Admin | Read only |
| `submissions` | Admin | Append only (own submissions) |
| `answers` | Admin | Append only (own answers) |
| `hub_collections` | Admin | Read only |
| `members` | Member portal | Read + write |
| `hub_contributions` | Member portal | Read + write |

The member portal **never calls Clerk-guarded admin functions**. Admin mutations enforce Clerk auth server-side — calling them from this app will fail by design.

---

## Routes

| Route | Page | Auth |
|-------|------|------|
| `/login` | ITS number login | Public |
| `/announcements` | Live announcements | Required |
| `/surveys` | Live surveys list | Required |
| `/surveys/:slug` | Survey form | Required |
| `/hub` | Hub collections list | Required |
| `/hub/:slug` | Collection detail + contribute | Required |
| `/account` | Member name + logout | Required |

Unauthenticated access to any protected route redirects to `/login`.

---

## Authentication

No Clerk. Auth works like this:

1. Member enters ITS number on `/login`.
2. App calls a Convex mutation that looks it up via `by_its_number` index on `members`.
3. Found → member's Convex `_id` stored in `localStorage`; session active.
4. Not found → error shown. Member contacts dev team to get their ITS number added.

Logout clears `localStorage` and returns to `/login`. No password, no OTP, no token exchange in v1.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run convex:sync-types` | Copy `tolobana_admin/convex/_generated/` → `convex/_generated/` (after `npx convex codegen` in admin) |

---

## Schema (member portal additions)

Member-specific tables are defined in **`tolobana_admin/convex/schema.ts`** (same repo as the admin console) alongside admin tables (`members`, `hub_contributions`, and the `submissions.by_respondent_email` index). Edit schema only through the admin Convex project, then deploy from there.

**`members`** — ITS number, display name, optional email, `created_at`. Seeded by dev team.

**`hub_contributions`** — `collection_id`, `member_id`, amount (USD), optional note, `logged_at`. Indexes: `by_collection`, `by_member`, `by_collection_and_member`.

---

## Troubleshooting

**"ITS number not recognised"**
Member's ITS number is not in the `members` table. Dev team adds/corrects it directly in Convex dashboard.

**Data not appearing / out of sync**
Both apps must use the **same** `VITE_CONVEX_URL`. Mismatched URLs = separate databases.

**Contribution not saving**
Server rejects contributions if `collection_id` maps to an inactive collection. Check `is_live` in Convex dashboard. Also verify the member session is valid (log out and back in).

**Survey submission rejected**
Survey may have gone offline between page load and submit. The server enforces `is_live` — member will see an error and can refresh to confirm.

**Schema / API types out of date after pull**
If the admin console repo changed Convex functions, run **`npm run convex:sync-types`** (after they ran **`npx convex codegen`** in admin, or after you do the same in admin). Do not hand-edit `convex/_generated/*`.

---

## Deploy (Vercel)

- Build command: `npm run build`, output directory: `dist`.
- Set `VITE_CONVEX_URL` to the shared Convex deployment URL.
- No Clerk env vars.
- For **backend** changes: deploy only from **`tolobana_admin`** (`npx convex deploy` there). Never deploy Convex from this repo against the shared production deployment.

---

## Docs

| File | Contents |
|------|----------|
| `MEMBER-SPEC.md` | Full product spec — features, data model, policies, implementation plan |
| `MEMBER-UIUX.md` | UI/UX spec — visual language, screen designs, component states, accessibility |
