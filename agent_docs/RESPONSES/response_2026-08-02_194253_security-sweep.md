# STEP 1 — Security & Hygiene Sweep Report

**Date:** 2026-08-02 19:42:53
**Branch:** readme-1
**Task:** README upgrade mission — Step 1 (read-only security/hygiene sweep), REPORT AND STOP.

---

## 🔴 HIGH — `logs/ghl-order-sync/` (38 files, all git-tracked)

Committed production sync logs from a real ticketing system.

- **18 unique real GHL Order IDs** (MongoDB `ObjectId` format — 24-char hex). Example:
  `logs/ghl-order-sync/sync-2024-09-19T04-40-01-999Z.log:2` → `Order ID: 66c5f91c…` (value redacted).
  These are live production order record identifiers mapping to real customer orders in GHL.
- Ticket type + quantity per order (`Regular`, `VIP`, `Team Tickets`), e.g. `:4` → `Ticket type: Regular, Quantity: 2`.
- Timestamps spanning **Sep 2024 – Apr 2025**.
- ✅ **No emails, phone numbers, or customer names** in any log (verified by grep — all "phone-like" hits were the hex order IDs themselves).
- Includes `analyze.sh` — a helper that greps logs for "upserted"/"Error" counts (benign, but only useful if logs exist).

**Risk:** Order IDs + ticket metadata are real production identifiers. They expose order volume, ticket-type mix, and a list of real transaction IDs that could be queried against the GHL API if a token leaked. This is the #1 risk flagged in the mission.

**Recommendation:** Untrack the entire `logs/` directory and add `logs/` to `.gitignore`. (Cannot run `git rm` — git write op, forbidden by Rule Zero. Command block will be handed to the operator.)

---

## 🟠 MEDIUM — `temp/ghl-example.json` (tracked)

- `temp/ghl-example.json:4` → `"locationId": "4rKuUL…"` (redacted)
- `temp/ghl-example.json:3` → `"calendarId": "LtoA6…"` (redacted)

This `locationId` is the same shape the code reads from `NEXT_PUBLIC_GHL_LOCATION_ID` (`services/ghlServices.ts:117`, `app/api/ghl/events/route.ts:55`).

- Developer test data ("Moose Blocked Slot" calendar blocks, dated 2024-08-01) — not customer data.
- Appears to be a **real GHL location + calendar ID pair** — an operational secret in a multi-tenant GHL setup.

**Recommendation:** Untrack `temp/ghl-example.json` and add `temp/` to `.gitignore`.

---

## 🟢 CLEAN — No tracked env files, no hardcoded secrets

- `git ls-files | grep -iE "\.env"` → **empty**. No `.env`, no `.env.example`, no `.env.local` tracked. `.gitignore` already covers `.env*.local`.
- **All credentials flow through `process.env`** — verified env vars in use:
  `GHL_ACCESS_TOKEN`, `GHL_WEBHOOK_SECRET`, `NEXT_PUBLIC_GHL_LOCATION_ID`, `NEXT_PUBLIC_GHL_API_BASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, plus `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_SOCKET_URL`.
- The `eyJ…` token-pattern hits were all **benign**: Unsplash photo-URL `ixid` query params (`components/members/MemberEventList.tsx`, `app/(admin)/wp-test/PostItem.tsx`) and one `package-lock.json` integrity hash.
- No `sk_`/`pk_`/`whsec_`/`AIza`/`ghp_`/`Bearer <literal>` anywhere.

---

## 🟢 CLEAN — `docs/` for real PII

Every email in `docs/` is an obvious placeholder (`john@example.com`, `user@example.com`, `admin@example.com`, `your-email@example.com`) across `docs/api/*`, `docs/database/tables-reference.md`, `docs/architecture/state-management.md`, `docs/guides/getting-started.md`. `contact_phone` is a schema field name, not a value. **No real customer data in docs.**

---

## 🟡 LOW — Root clutter & `*-org.*` backup files (tracked)

| File | Status | Recommendation |
|---|---|---|
| `middleware-org.ts` | **IDENTICAL** to `middleware.ts` | Remove — pure dup |
| `next.config-org.js` | **IDENTICAL** to `next.config.js` | Remove — pure dup |
| `tailwind.config-org.ts` | **DIFFERENT** (stale older version) | Remove — git history keeps it |
| `package-org.json` | stale | Remove |
| `app/layout-org.tsx`, `app/(public)/HomePageContent-org.tsx`, `app/(admin)/wp-test/WPPostContent-org.tsx`, `app/(public)/wp-blog/WPPostContent-org.tsx`, `components/global/Navbar-org.tsx`, `utils/supabase/client-org.ts`, `app/api/ghl/qrtest/route-org.ts` | `*-org.*` backups | Remove — git history preserves originals |
| `DOCUMENTATION_PLAN.md` (5.5KB) | planning doc | Operator's call — keep or gitignore |
| `SESSION_31_DEC_2025.md` (17KB) | session notes | Operator's call — keep or gitignore |

---

## Status

**STOPPED.** Awaiting operator decisions on:
1. Whether to proceed to Step 2 (facts off disk) + Step 3 (README upgrade), touching **only `README.md`**.
2. Whether I should edit `.gitignore` (a normal file write — not a git command) to add `logs/` and `temp/`.
3. What to do with `*-org.*` backups and the planning/session markdown docs.

Git untrack commands will be handed to the operator as a copy-paste block (Rule Zero — I run no git writes).