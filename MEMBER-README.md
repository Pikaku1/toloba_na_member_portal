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

2. **Convex**

   This repo shares the **existing** Convex deployment from the admin console. Do **not** create a new deployment.

   To push schema/function changes to the shared deployment:

   ```bash
   npx convex dev
   ```

   Point it at the shared deployment when prompted (or set `CONVEX_DEPLOYMENT` in your shell). Leave it running during development.

   > ⚠️ Coordinate schema changes with the admin console repo — both apps share one schema file.

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

---

## Schema (member portal additions)

This repo adds two tables to the shared Convex schema. Always coordinate with the admin console repo before pushing schema changes — one schema, two repos.

**`members`** — ITS number, display name, created_at. Seeded by dev team.

**`hub_contributions`** — collection_id, member_id, amount (USD), optional note, logged_at. Indexes: `by_collection`, `by_member`, `by_collection_and_member`.

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

**Schema conflict after pull**
If the admin console repo pushed schema changes, run `npx convex dev` here to sync. Never edit `convex/_generated/*` manually.

---

## Deploy (Vercel)

- Build command: `npm run build`, output directory: `dist`.
- Set `VITE_CONVEX_URL` to the shared Convex deployment URL.
- No Clerk env vars.
- For backend changes: `npx convex deploy` (coordinate with admin console team — shared deployment).

---

## Docs

| File | Contents |
|------|----------|
| `MEMBER-SPEC.md` | Full product spec — features, data model, policies, implementation plan |
| `MEMBER-UIUX.md` | UI/UX spec — visual language, screen designs, component states, accessibility |
