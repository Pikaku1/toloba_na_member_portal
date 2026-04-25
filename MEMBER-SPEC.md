# Tolobana — Member Portal Spec

## 1. Purpose

### 1.1 System surfaces

| Surface | Role |
|---------|------|
| **Admin console** | Staff-only. Creates surveys, publishes announcements, launches hub collections. Separate repo, Clerk-authenticated. |
| **Member portal** | Member-facing. Members log in with ITS number, read announcements, answer surveys, log hub contributions. **This repo.** |
| **Shared Convex deployment** | **One Convex deployment, shared by both apps.** The member portal has read-only access to admin-owned tables and full read/write access to member-owned tables. Neither app gets a separate deployment — the schema is the contract. |

### 1.2 Convex access split (critical)

This is the most important architectural rule in this repo:

| Table | Owner | Member portal access |
|-------|-------|----------------------|
| `announcements` | Admin | **Read only** — live announcements via public query |
| `forms` | Admin | **Read only** — live forms via public query |
| `questions` | Admin | **Read only** — questions for a live form |
| `submissions` | Admin | **Append only** — member creates a submission; cannot read others' |
| `answers` | Admin | **Append only** — member creates answers for their submission |
| `hub_collections` | Admin | **Read only** — live collections via public query |
| `members` | Member portal | **Read/write** — login lookup (read), future profile edits |
| `hub_contributions` | Member portal | **Read/write** — member logs and reads their own + aggregates |

The member portal **never calls admin-privileged Convex functions**. Admin mutations are Clerk-guarded server-side — even if called from this app they will fail. Public queries/mutations enforce `is_live` checks and scoping server-side; the member portal never trusts client-only checks.

---

## 2. Technology stack

| Layer | Choice | Notes |
|-------|--------|-------|
| **Backend** | Convex (shared deployment) | Same `VITE_CONVEX_URL` as admin console. Member portal calls only public queries/mutations. |
| **Auth** | Convex `members` table | No Clerk. ITS number lookup against `members` table. Session stored in `localStorage`. |
| **Frontend** | React (Vite) | Separate repo. Mobile-first. Clean & minimal aesthetic. |
| **Hosting** | Vercel | Separate Vercel project. Only env var: `VITE_CONVEX_URL`. |

---

## 3. Goals

- Zero-friction login — enter ITS number, you're in.
- Surface admin-published content (announcements, surveys, hub collections) in a clean read-only or submit-only interface.
- Let members log hub contributions and see collective progress in real time.
- Mobile-first, minimal UI — members are on their phones, not desktops.
- Keep the member portal strictly consumer-facing — it never touches admin logic.

---

## 4. Non-goals (v1)

- No self-registration — dev team seeds `members` table directly.
- No password or PIN — ITS number is the only credential.
- No admin content management from this app.
- No social features (comments, reactions, DMs).
- No push notifications or email digests.
- No file uploads.
- No numeric fundraising goal / progress bar — total raised is shown, no target to measure against.

---

## 5. Authentication

### 5.1 Flow

1. Member opens the portal → lands on `/login`.
2. Enters ITS number → app calls a Convex public query using the `by_its_number` index on `members`.
3. **Found** → member's `_id` stored in `localStorage`; redirected to `/announcements`.
4. **Not found** → inline error: "ITS number not recognised — contact your administrator."

No password, PIN, OTP, or token exchange in v1.

### 5.2 Session

- Member `_id` (Convex document id) stored in `localStorage` after login.
- All mutations that write member data receive `member_id` and verify it server-side against the `members` table.
- Logout clears `localStorage`, redirects to `/login`.
- All routes except `/login` redirect unauthenticated visitors to `/login`.

### 5.3 Security

- Rate-limit ITS number lookup mutation to prevent enumeration.
- Server-side verify `member_id` on every write mutation — never trust the client alone.
- Member portal cannot escalate to admin access; Clerk guard on admin mutations is the hard stop.

---

## 6. Data model

### 6.1 Member-owned tables (this repo writes these)

**`members`**
```
its_number   string     Unique login credential. Index: by_its_number.
name         string     Display name shown in contributor lists.
created_at   float64    Timestamp.
```

**`hub_contributions`**
```
collection_id   Id<"hub_collections">   Which collection this belongs to.
member_id       Id<"members">           Who logged it.
amount          float64                 USD amount (member-reported, honour system).
note            string?                 Optional message.
logged_at       float64                 Timestamp.

Indexes: by_collection, by_member, by_collection_and_member
```

### 6.2 Admin-owned tables (this repo reads these)

**`announcements`** — read via `by_live` index. Fields used: `title`, `body`, `created_at`.

**`forms`** — read via `by_slug` index and `is_live` filter. Fields used: `title`, `description`, `slug`, `is_live`.

**`questions`** — read via `by_form` index. All fields used to render the form.

**`submissions`** — appended to on survey submit. Member portal queries own submissions by `respondent_email` for history view.

**`answers`** — appended to on survey submit alongside submission.

**`hub_collections`** — read via `is_live` filter and `by_slug` index. Fields used: `title`, `amount_display`, `desired_memo`, `payment_url`, `slug`, `is_live`.

---

## 7. Feature requirements

### 7.1 Auth

| ID | Requirement |
|----|-------------|
| M1 | Login screen: single ITS number input, submit button. |
| M2 | Valid ITS number → session + redirect to `/announcements`. |
| M3 | Invalid ITS number → inline error, no session. |
| M4 | All routes except `/login` require active session; else redirect. |
| M5 | Logout clears session, returns to `/login`. |
| M6 | Session survives page refresh via `localStorage`. |
| M7 | Login lookup is rate-limited server-side. |

### 7.2 Announcements

| ID | Requirement |
|----|-------------|
| A1 | List all live announcements ordered by `created_at` descending. |
| A2 | Each item shows: title, body, date. |
| A3 | Read-only — no member interaction beyond reading. |
| A4 | Real-time updates via Convex subscription (new announcements appear instantly). |

### 7.3 Surveys

| ID | Requirement |
|----|-------------|
| SV1 | List all live, non-archived forms. |
| SV2 | Each card shows: title, description (if set). |
| SV3 | Opening a form renders questions dynamically from `questions` table, ordered by `order`. |
| SV4 | All question types supported: `short_text`, `long_text`, `email`, `single_choice`, `multiple_choice`, `dropdown`, `yes_no`, `date`, `number`. |
| SV5 | Client-side validation mirrors server rules (required fields, choice constraints). |
| SV6 | Submit calls existing public mutation → creates `submission` + `answers`. Server validates `is_live` and deduplicates by `respondent_email`. |
| SV7 | If member has already submitted (matched by email in `submissions`), show "Already submitted" state instead of form. |
| SV8 | If survey is no longer live mid-session, submission is rejected server-side with a clear error. |
| SV9 | Member can view their own submission history (surveys they've completed). |

### 7.4 Hub

| ID | Requirement |
|----|-------------|
| H1 | List all live, non-archived hub collections. |
| H2 | Each card shows: title, `amount_display`, total raised (sum of `hub_contributions.amount`), contributor count. |
| H3 | Collection detail shows: title, description, total raised, contributor count, list of contributor **names** (no amounts). |
| H4 | "I want to contribute" button reveals payment info: `payment_url` (Zelle link/QR) and `desired_memo`. |
| H5 | Alongside payment info, a clear instruction: "Send via Zelle first, then log your contribution below." |
| H6 | Log contribution form: amount (required, positive number, USD) + note (optional). |
| H7 | Submit creates a `hub_contributions` record. Server verifies `member_id` and `collection_id` is live. |
| H8 | Member may log multiple contributions to the same collection. |
| H9 | After logging, total raised and contributor list update in real time (Convex subscription). |
| H10 | Inactive/archived collections are read-only — no log form shown. |

---

## 8. Routes

| Route | Page | Auth required |
|-------|------|---------------|
| `/login` | ITS number login | No |
| `/announcements` | Live announcements list | Yes |
| `/surveys` | Live surveys list | Yes |
| `/surveys/:slug` | Individual survey form | Yes |
| `/hub` | Live hub collections list | Yes |
| `/hub/:slug` | Collection detail + contribute flow | Yes |

Default redirect after login: `/announcements`. Unauthenticated access to any protected route → `/login`.

---

## 9. Backend rules (Convex)

| ID | Rule |
|----|------|
| B1 | ITS number lookup: rate-limited public mutation. Returns member `_id` and `name` only. |
| B2 | `hub_contributions` write: verify `member_id` in `members` + `collection_id` in `hub_collections` with `is_live === true`. |
| B3 | Survey submit: existing public mutation — validates `is_live`, deduplicates by `respondent_email`. |
| B4 | Total raised: computed from `hub_contributions` via `by_collection` index (sum `amount`). Not denormalized in v1. |
| B5 | Contributor name list: returns `members.name` only — never `amount` — for public endpoint. |
| B6 | Member portal never calls any Clerk-guarded admin function. |
| B7 | Announcements, forms, hub_collections: only `is_live: true` and non-archived records are returned by public queries. |

---

## 10. Policies

| Topic | Decision |
|-------|----------|
| Login | ITS number only, no password, v1. |
| Member records | Dev team seeds `members` table directly. No self-registration. |
| Contribution visibility | Names visible to all members; individual amounts never shown. Total raised always shown. |
| Multiple contributions | Allowed — members can log instalments. |
| Survey dedup | One submission per email per survey, server-enforced. |
| Goal tracking | No numeric goal in v1. `amount_display` is a freeform string set by admin. |
| Locale | English only. |
| Deployment | One shared Convex deployment. `VITE_CONVEX_URL` is the only env var. |

---

## 11. Implementation plan

### Phase 1 — Foundation & auth
- Bootstrap React/Vite repo; wire `convex/react`.
- Add `members` and `hub_contributions` to shared schema (coordinate with admin repo).
- ITS number login screen + Convex lookup mutation (rate-limited).
- `localStorage` session, route guards, logout.

### Phase 2 — Announcements & surveys
- `/announcements` — real-time list via `by_live` index.
- `/surveys` — live form list; `/surveys/:slug` — dynamic question renderer.
- Survey submit using existing public mutation.
- Survey history view.

### Phase 3 — Hub
- `/hub` — live collections list with total raised + contributor count.
- `/hub/:slug` — detail, contributor names, "I want to contribute" reveal flow.
- Contribution log form + mutation.
- Real-time subscription on `hub_contributions`.

### Phase 4 — Hardening
- Rate limiting on login.
- Amount input validation (positive number, reasonable max).
- Edge cases: survey/collection goes offline mid-session.
- Mobile layout polish.

---

## 12. Success criteria

- Member enters ITS number → lands on portal instantly, no other credential needed.
- All live announcements appear in real time.
- Member submits a survey → submission visible in admin Responses tab immediately.
- Member opens a hub collection, taps "I want to contribute", sees Zelle info + memo, logs a contribution → total raised updates in real time and their name appears in the contributor list.
- Admin toggling a survey or collection offline is reflected in the member portal without a page reload.

---

*Version 1.2 — Convex access split clarified; read/write ownership explicit.*
