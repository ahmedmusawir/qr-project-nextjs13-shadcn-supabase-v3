# Security Inference Audit — Service-Role Exposure + Metadata-Role Escalation

**Date:** 2026-08-02 20:17:16
**Branch:** readme-1
**Task:** Follow-up mission — audit the NEXT_PUBLIC_ service-role gap I under-reported, and the user_metadata role-escalation question. Diagnosis + README fixes. No git.

---

## TASK 1 — SERVICE-ROLE EXPOSURE AUDIT

### Every reference to the service-role key (both variants)

| File | Line | Variant | Live? | Reachability |
| --- | --- | --- | --- | --- |
| `utils/supabase/admin-client.ts` | 6 | `SUPABASE_SERVICE_ROLE_KEY` (non-public) | ✅ LIVE | Server-only — imported only by API routes (see below) |
| `app/api/admin/route.ts` | 40 | `SUPABASE_SERVICE_ROLE_KEY` (non-public) | ❌ commented-out dead code | n/a (dead) |
| `app/layout.tsx` | 44 | `SUPABASE_SERVICE_ROLE_KEY` (non-public) | ❌ commented-out `console.log` (dead) | n/a (dead) |
| `docs/architecture/authentication.md` | 715 | `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | ❌ doc anti-pattern example, commented `// WRONG!` | documentation only — not code |

### Import trace for the live service-role client (`createAdminClient`)

`utils/supabase/admin-client.ts` is imported by **only**:
- `app/api/admin/route.ts:2`
- `app/api/superadmin/add-user/route.ts:2`
- `app/api/superadmin/delete-user/route.ts:2`

All three are Next.js **API route handlers** (`route.ts` under `app/api/`) — strictly server-side, never inlined into the client bundle. No `"use client"` component or client hook imports `admin-client`.

The browser client (`utils/supabase/client.ts`) and SSR client (`utils/supabase/server.ts`) both use `NEXT_PUBLIC_SUPABASE_ANON_KEY` (correct — anon key, RLS-respecting).

### VERDICT — (c) CLEAN

The premise was wrong, and the error was **mine in the Step 1 report**: I listed `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` as an "env var in use." It is not. The only occurrence in the entire repo is `docs/architecture/authentication.md:715`, inside a **"Security Best Practices → ❌ Bad — Never do this"** anti-pattern block (with `// WRONG!`). No live code reads the `NEXT_PUBLIC_` service-role variant.

The live service-role usage is the **correct** pattern: `utils/supabase/admin-client.ts` reads the server-only `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix) and is reachable only from server-side API routes. The browser bundle ships only the anon key. **No god key is exposed to visitors.**

### Other NEXT_PUBLIC_ vars (client-bundle exposure check)

`process.env.NEXT_PUBLIC_*` referenced in code: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_GHL_API_BASE_URL`, `NEXT_PUBLIC_GHL_LOCATION_ID`, `NEXT_PUBLIC_SOCKET_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`.
- All are public-by-design values (URLs, the public anon key, the GHL location id which is a tenant identifier, not a secret token).
- `GHL_ACCESS_TOKEN` and `GHL_WEBHOOK_SECRET` are **not** `NEXT_PUBLIC_` — they stay server-side. ✅
- **No NEXT_PUBLIC_ var carries a token/secret/service key.**

### Latent housekeeping (flagged, NOT edited — out of scope)
- `app/layout.tsx:44` — commented `// console.log("Service role key:", process.env.SUPABASE_SERVICE_ROLE_KEY);` — a footgun if ever uncommented (would log the god key). Dead. Recommend operator authorize removal.
- `app/api/admin/route.ts:39-40` — commented dead declarations. Harmless.
- The doc anti-pattern block at `docs/architecture/authentication.md:711-717` is intentional teaching material — leave it.

---

## TASK 2 — METADATA-ROLE PRIVILEGE ESCALATION (diagnosis only)

`middleware-role.ts:24` gates `/superadmin-portal` on `user_metadata.is_qr_superadmin === 1`. In Supabase, `user_metadata` is **user-writable** via `auth.updateUser({ data })` unless blocked by a DB trigger / auth hook. Question: can a user elevate themselves?

### Finding A — Role-gating middleware is INERT
Next.js loads only the file named `middleware.ts`. The active `middleware.ts` does **session refresh only** (`updateSession`). `middleware-role.ts` is a non-default filename → **never executed**. Its `is_qr_superadmin === 1` gate on `/superadmin-portal` does not run. (`middleware.ts` matcher: everything except static assets; no role check.)

### Finding B — Actual portal guards are client-side HOCs reading user-writable metadata
- `app/(superadmin)/layout.tsx` → `export default withSuperAdminProtection(...)` (a `"use client"` HOC).
- `hoc/withSuperAdminProtection.tsx` → reads `roles` from `useAuthStore`; `store/useAuthStore.ts:69` populates `roles` from `user?.user_metadata`. If `roles.is_qr_superadmin !== 1` → `router.push("/auth")`.
- `hoc/withAdminProtection.tsx` → same pattern with `is_qr_admin`.
- These are **client-side** guards. They are bypassable (direct navigation / API calls), and they trust the very `user_metadata` Supabase lets users self-edit. No server-side, middleware, or DB role guard exists (no `migrations/`, `.sql`, triggers, or RLS policies are tracked in the repo).

### Finding C — Signup vector (unauthenticated → superadmin), CONFIRMED
`app/api/auth/signup/route.ts:5` → `const { email, password, user_metadata } = await req.json();` (attacker-controlled body, **no validation**).
`:6` → `createClient()` = the SSR anon client.
`:8-13` → `supabase.auth.signUp({ email, password, options: { data: user_metadata } })` — passes attacker metadata straight into the new account.

`components/auth/RegisterForm.tsx:66-70` defaults `is_qr_superadmin: 0, is_qr_admin: 0, is_qr_member: 1`, but the **server trusts the request body, not the form.** An unauthenticated attacker can POST:
```json
{"email":"a@x.com","password":"x","user_metadata":{"is_qr_superadmin":1,"is_qr_admin":1,"name":"a"}}
```
→ creates a superadmin account → `withSuperAdminProtection` (which reads that same metadata) admits them to `/superadmin-portal`. **Escalation possible in practice, no auth required.**

### Finding D — Superadmin add-user route is unguarded, CONFIRMED
`app/api/superadmin/add-user/route.ts:5-15` → uses `createAdminClient()` (service role) + `auth.admin.createUser({ email, password, user_metadata, email_confirm: true })`, but the route **performs no caller-auth/role check.** Anyone can POST and create a confirmed superadmin via the Admin API. (Active `middleware.ts` does not role-check API routes.)

### Finding E — Self-service metadata rewrite (authenticated → superadmin), POSSIBLE
`services/userServices.ts:145-149` calls `supabase.auth.updateUser({ password })` (password only — not a metadata vector itself). But the same client (`utils/supabase/client.ts`, anon key, in the browser bundle) lets any authenticated user run `supabase.auth.updateUser({ data: { is_qr_superadmin:1 } })` from the console. No DB trigger / auth hook / RLS guard is present in the repo to block it. Supabase permits self-writes to `user_metadata` by default. **Self-escalation is possible in practice** absent a server-side guard that does not exist here.

### Task 2 verdict
Privilege escalation is **possible in practice** via at least three vectors (C unauthenticated-signup, D unguarded-admin-route, E self-metadata-rewrite). Root cause: roles live entirely in user-writable `user_metadata` with no database-authoritative enforcement; the only guards are client-side HOCs, and the role-checking middleware is inert. **Diagnosis only — no refactor applied, per instruction.** This is the future Solution Module.

---

## TASK 3 — FIXES APPLIED

### 3.1 Service-role code changes
None required — verdict (c) CLEAN. No `NEXT_PUBLIC_` service-role reference exists in code to remove; the live usage already standardizes on the server-only `SUPABASE_SERVICE_ROLE_KEY`. The doc anti-pattern example is intentional and retained. (Latent dead-code cleanup in `app/layout.tsx:44` and `app/api/admin/route.ts:39-40` flagged for operator authorization — not edited, out of scope.)

### 3.2 README edits (README.md only)
- **Quickstart role note**: deleted flag name (`is_qr_superadmin`) and equality check; replaced with: "Roles are granted via Supabase Auth — see docs/architecture/authentication.md."
- **What's Inside — role-based portals bullet**: deleted `middleware-role.ts` mechanism detail and `is_qr_superadmin === 1` equality check (also corrects the prior inaccuracy that `middleware-role.ts` was the active gate — it is inert).
- **Why This Exists**: appended closing line — "The RBAC lessons from this build directly shaped the database-authoritative role model in my current Next.js 16 starter kit."

### 3.3 Quickstart env block
Confirmed: the Quickstart lists `SUPABASE_SERVICE_ROLE_KEY` (server-only, non-public) — **not** `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`. The audit kills no var, and the README does not resurrect the dangerous variant.

## Files changed (this step)
- `README.md` — three targeted edits (role note, portals bullet, Why This Exists closing line)

## Status
**READY FOR COMMIT.** No git commands run (Rule Zero).