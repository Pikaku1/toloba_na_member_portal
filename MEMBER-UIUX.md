# Tolobana — Member Portal UI/UX Spec

## 1. Design principles

- **Mobile-first, always.** Every screen is designed for a phone screen (~390px) first. Desktop is a stretch goal, not a starting point.
- **Clean and minimal.** White backgrounds, generous whitespace, restrained use of color. Nothing decorative that doesn't serve a function.
- **Low cognitive load.** Members should never have to think about where they are or what to do next. One primary action per screen.
- **Instant feedback.** Every tap/submit gets an immediate visual response — loading states, success states, error states. No silent failures.
- **Real-time by default.** Where Convex subscriptions are active, data updates without any user action.

---

## 2. Visual language

### 2.1 Color

| Role | Value | Usage |
|------|-------|-------|
| Background | `#FFFFFF` | All page backgrounds |
| Surface | `#F9F9F9` | Cards, input backgrounds |
| Border | `#E5E5E5` | Card borders, dividers, input borders |
| Text primary | `#111111` | Headings, body |
| Text secondary | `#6B6B6B` | Subtitles, metadata, helper text |
| Text muted | `#ABABAB` | Placeholders, disabled states |
| Accent | `#1A1A1A` | Primary buttons, active nav, key actions |
| Accent hover | `#333333` | Button hover/press state |
| Success | `#16A34A` | Confirmation states |
| Error | `#DC2626` | Inline errors, rejected submissions |
| Live badge | `#DCFCE7` / `#16A34A` | Green pill on live items |

No gradients, no shadows heavier than `0 1px 3px rgba(0,0,0,0.06)`. The UI earns visual weight through space and typography, not decoration.

### 2.2 Typography

| Role | Size | Weight | Notes |
|------|------|--------|-------|
| Page title | 22px | 600 | Top of each screen |
| Section heading | 16px | 600 | Card titles, section labels |
| Body | 15px | 400 | Announcement body, form labels |
| Caption / meta | 13px | 400 | Dates, counts, helper text |
| Button | 15px | 500 | All button labels |

Font: system font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`). No external font loading — keeps it fast on mobile.

### 2.3 Spacing

Base unit: `4px`. All spacing is multiples of this (8, 12, 16, 20, 24, 32, 48).

- Page horizontal padding: `20px`
- Card padding: `16px`
- Stack gap between list items: `12px`
- Section gap: `32px`

### 2.4 Components

**Cards** — white background, `1px solid #E5E5E5` border, `10px` border radius, `16px` padding. No shadows.

**Buttons (primary)** — full width on mobile, `#1A1A1A` background, white text, `10px` border radius, `48px` height, `15px/500` font. Tap target always ≥ 44px.

**Buttons (secondary/ghost)** — white background, `1px solid #E5E5E5` border, `#111111` text. Same sizing.

**Inputs** — full width, `#F9F9F9` background, `1px solid #E5E5E5` border, `10px` border radius, `48px` height for single-line, `15px` font. Focus: border becomes `#1A1A1A`.

**Pills/badges** — small inline labels. Live: `#DCFCE7` background, `#16A34A` text. Closed: `#F3F4F6` background, `#6B6B6B` text.

**Bottom nav** — fixed at bottom of screen. Four destinations: Announcements, Surveys, Hub, (optionally Profile/logout). Icon + label. Active item uses `#1A1A1A`; inactive `#ABABAB`.

---

## 3. Navigation

### 3.1 Structure

The app uses a **fixed bottom navigation bar** (mobile-native pattern). Four tabs:

| Tab | Icon suggestion | Route |
|-----|----------------|-------|
| Announcements | Bell | `/announcements` |
| Surveys | Clipboard | `/surveys` |
| Hub | Heart / Hands | `/hub` |
| Account | Person | `/account` (logout + member name) |

No sidebar. No hamburger menu. Bottom nav is always visible once logged in.

### 3.2 Active state

Active tab: icon + label in `#1A1A1A`, subtle `2px` top border in `#1A1A1A`.
Inactive: `#ABABAB`, no border.

### 3.3 Login screen

Login is a standalone full-screen page with no nav bar. After successful login the bottom nav appears and stays for the session.

---

## 4. Screen designs

### 4.1 Login (`/login`)

**Layout:** Centered vertically and horizontally on the screen.

**Elements (top to bottom):**
- Logo / wordmark (top, centered) — `Tolobana` or org mark
- Page title: "Welcome" — 22px/600
- Subtitle: "Enter your ITS number to continue" — 15px/400, `#6B6B6B`
- ITS number input — numeric keyboard (`inputmode="numeric"`), placeholder "ITS number", full width
- "Sign in" primary button — full width, below input, `16px` margin top
- Error state: red inline text below input ("ITS number not recognised — contact your administrator")
- Loading state: button shows spinner, disabled

**Behaviour:**
- Autofocus the input on mount.
- `inputmode="numeric"` triggers the number pad on iOS/Android.
- On submit: button goes to loading state immediately; no double-submit.
- On success: brief success flash then push to `/announcements`.
- No "forgot my number" link in v1.

---

### 4.2 Announcements (`/announcements`)

**Layout:** Scrollable list, no pagination in v1.

**Header:** Page title "Announcements" — sticky at top with white background.

**Empty state:** "No announcements yet." centered, `#6B6B6B`.

**List item (card):**
```
┌─────────────────────────────────┐
│ Title                    [date] │
│ Body text preview (2 lines,     │
│ truncated with ellipsis)        │
└─────────────────────────────────┘
```
- Tap to expand full announcement inline (accordion) or push to a detail view — accordion preferred on mobile.
- Date formatted as relative ("2 days ago") with full date on hover/long-press.
- No member interaction beyond reading.

**Real-time:** New announcements slide in at the top. No manual refresh needed.

---

### 4.3 Surveys list (`/surveys`)

**Header:** "Surveys"

**Empty state:** "No open surveys right now."

**List item (card):**
```
┌─────────────────────────────────┐
│ [LIVE]  Survey title            │
│ Description (1 line, truncated) │
│                      [Start →]  │
└─────────────────────────────────┘
```
- `[LIVE]` green pill badge.
- If member has already submitted: replace `[Start →]` with `[Submitted ✓]` in green — card is non-tappable or taps to a "already submitted" confirmation screen.
- No draft/closed surveys shown.

---

### 4.4 Survey form (`/surveys/:slug`)

**Header:** Back arrow + survey title. No bottom nav overlap — form takes full screen with a scrollable body and a sticky "Submit" button at the bottom.

**Question rendering by type:**

| Type | Component |
|------|-----------|
| `short_text` | Single-line text input |
| `long_text` | Textarea, min 3 rows, auto-grow |
| `email` | Email input, `inputmode="email"`, `type="email"` |
| `single_choice` | Vertical radio list — tappable rows, not small radio dots |
| `multiple_choice` | Vertical checkbox list — tappable rows |
| `dropdown` | Native `<select>` on mobile for best UX |
| `yes_no` | Two large tappable pill buttons: "Yes" / "No" |
| `date` | Native `<input type="date">` |
| `number` | Number input, `inputmode="decimal"` |

**Per-question layout:**
```
Label text *           ← * if required
Help text (if set)     ← 13px, #6B6B6B, below label
[input component]
[inline error if any]  ← 13px, #DC2626
```

**Submit button:** Full-width, sticky to bottom of viewport (`position: sticky; bottom: 20px`). Text: "Submit". Disabled until all required fields filled.

**States:**
- Loading: button spinner, inputs disabled.
- Success: replace form with a confirmation card — "Thanks! Your response has been recorded." with a green check icon.
- Error (already submitted): "You've already submitted this survey."
- Error (survey closed): "This survey is no longer accepting responses."
- Generic error: "Something went wrong — please try again."

---

### 4.5 Hub list (`/hub`)

**Header:** "Hub"

**Empty state:** "No active collections right now."

**List item (card):**
```
┌─────────────────────────────────┐
│ Collection title         [LIVE] │
│ Total raised: $240              │
│ 8 contributors                  │
│                   [Contribute →]│
└─────────────────────────────────┘
```
- `amount_display` from admin shown as a subtitle if set (e.g. "Goal: $500" — display only, no progress bar).
- Total raised computed from `hub_contributions` sum.
- Contributor count from `hub_contributions` distinct member count.
- Tapping anywhere on card navigates to `/hub/:slug`.

---

### 4.6 Hub collection detail (`/hub/:slug`)

**Layout:** Scrollable page. Header with back arrow + collection title.

**Sections (top to bottom):**

**1. Summary block**
```
Collection title
amount_display (if set)          ← admin display string e.g. "Target: $500"
Total raised: $240  ·  8 contributors
```

**2. Contributors**
- Heading: "Who's contributed"
- Horizontal scrolling pill list of contributor names, or a simple vertical list if few.
- Names only, no amounts.
- If no contributions yet: "Be the first to contribute."

**3. Contribute CTA**
- Large primary button: "I want to contribute"
- Tapping reveals the **payment reveal section** (see below) — the button does not navigate away.

**4. Payment reveal (shown after tapping "I want to contribute")**

Slides in below the button (accordion/expand pattern):

```
┌─────────────────────────────────┐
│ Send via Zelle                  │
│                                 │
│  [QR code or Zelle link]        │
│  Memo: [desired_memo]           │
│                                 │
│  ⚠ Send the payment first,     │
│    then log it below.           │
└─────────────────────────────────┘
```

- `payment_url` rendered as a tappable link ("Open Zelle") and/or a QR code image if it's a URL that resolves to one.
- `desired_memo` shown in a copy-able monospace chip (tap to copy).
- Warning note in amber (`#FBBF24` background, `#92400E` text) — not red, not alarming, just a nudge.

**5. Log contribution form (shown below payment reveal)**

```
Amount (USD) *
[number input]

Note (optional)
[textarea, 2 rows]

[Log my contribution]  ← primary button
```

- Amount: `inputmode="decimal"`, min `0.01`, no max in v1.
- Submit: creates `hub_contributions` record.
- Success state: inline confirmation "Logged! Thank you." — contributor list and total update in real time below.
- The form resets after success so member can log again (instalments).

---

### 4.7 Account tab (`/account`)

Minimal — just enough for session management.

```
[Member name]
ITS: [its_number]

──────────────────

[Sign out]         ← ghost/secondary button, full width
```

No profile editing in v1. No settings. Just identity confirmation and logout.

---

## 5. States & feedback

Every interactive element must have all four states defined:

| State | Pattern |
|-------|---------|
| **Default** | As designed |
| **Loading** | Spinner in button, inputs disabled, opacity 0.6 on form |
| **Success** | Green check + confirmation message; form replaced or reset |
| **Error** | Inline red text below the triggering element; button re-enabled |

**No full-page loading spinners.** Use skeleton screens or inline spinners only. The app should feel instant.

**Toasts:** Avoid unless necessary. Prefer inline confirmation states over floating toasts on mobile.

---

## 6. Empty & edge case screens

| Scenario | UI |
|----------|----|
| Survey goes offline mid-session | On submit: error "This survey is no longer accepting responses." Form locked. |
| Collection goes inactive mid-session | On contribute submit: error "This collection is no longer active." Form hidden. |
| No live announcements | "No announcements yet." centered in grey. |
| No live surveys | "No open surveys right now." centered in grey. |
| No live hub collections | "No active collections right now." centered in grey. |
| Member already submitted survey | Survey card shows "Submitted ✓"; form page shows confirmation state. |
| Network error | "Connection issue — please check your internet and try again." with a retry button. |

---

## 7. Accessibility

- All tap targets ≥ 44×44px.
- All inputs have associated `<label>` elements (not just placeholders).
- Color is never the only indicator of state — always pair with text or icon.
- Form errors are announced to screen readers via `aria-live` or `role="alert"`.
- Bottom nav items have `aria-label` attributes.
- Focus states visible on all interactive elements (for users on external keyboards).

---

## 8. Motion & animation

Keep motion purposeful and restrained:

- **Route changes (signed-in shell):** Main content uses a single **fade-in** (~200ms) when the path changes. No horizontal slides (mobile comfort).
- **Login screen:** Same **fade-only** entry (~200ms) on the login card container.
- **List content:** Optional staggered **fade + 4px vertical nudge** (~200ms per row) for cards and timeline items; delays are CSS-only (no decorative loops on large surfaces).
- **Loading:** List-style pages use **skeleton placeholders** with a **slow, low-contrast shimmer**; shimmer is disabled when the user prefers reduced motion (static blocks instead).
- **LIVE badge:** The gold dot may use a **subtle pulse loop** only when `prefers-reduced-motion: no-preference`; otherwise the dot stays static.
- **Accordion / expands** (e.g. announcements, payment reveal): opacity / max-height style transitions (~200–300ms).
- **Success states:** One-shot **scale emphasis** (~300ms) on confirmation icons (e.g. survey submitted).
- **Buttons & nav:** Short **press** feedback (`scale(0.98)` / `0.96` on nav links) with `--transition-fast`.
- **No parallax** or ambient full-screen motion. Respect **`prefers-reduced-motion`** for enter animations, list stagger, success icon pop, and shimmer.

---

## 9. Responsive notes

Primary target is **375–430px viewport width** (iPhone SE → iPhone Pro Max). Design and test here first.

For tablet/desktop (≥768px):
- Max content width: `480px`, centered.
- Bottom nav becomes a left sidebar (optional — can defer to v2).
- Everything else scales naturally.

---

*Version 1.0 — Initial UI/UX spec. Mobile-first, clean & minimal.*
