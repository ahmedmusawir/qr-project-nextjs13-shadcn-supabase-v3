# STEP 2 + STEP 3 — Facts Off Disk & README Upgrade

**Date:** 2026-08-02 20:01:53
**Branch:** readme-1
**Task:** Gather facts from disk, then upgrade README.md (preserve images/sections, wrap in factory format). Touch only README.md + .gitignore.

---

## STEP 2 — Facts Off Disk

### Versions (from `package.json`)
- **Next.js:** 13.5.6
- **React:** ^18
- **TypeScript:** ^5.6.2
- **Supabase:** `@supabase/ssr` ^0.5.1, `@supabase/supabase-js` ^2.44.0
- **Tailwind:** ^3.4.1 · **ShadCN** (Radix-based) · **Zustand:** ^4.5.4
- **qrcode:** ^1.5.4 · **Zod:** ^3.23.8 · **react-hook-form:** ^7.51.5
- **Socket.io:** ^4.8.0 (server + client) · **Winston:** ^3.14.2 (logging)
- Custom Express server: `server.js` (dev), `server.prod.js` (prod)

### Route inventory (App Router)
**Pages (19):** route groups `(admin)`, `(auth)`, `(members)`, `(public)`, `(superadmin)` + `demo`, `error`, `template`.
- Admin: `admin-portal`, `events/[id]`, `orders/[id]`, `profile/[id]`, `socket-test`, `wp-test[/id]`
- Auth: `auth`, `auth/pass-reset`
- Members: `members-portal`
- Public: `page` (home), `wp-blog[/id]`
- Superadmin: `superadmin-portal`, `add-user`, `superadmin/profile/[id]`

**API routes (40 handlers):** `/api/admin`, `/api/auth/{confirm,getUser,login,logout,signup}`, `/api/ghl/{contacts[/id],events,hooktest,orders[/id],orders/sync,price[/id],qrtest,ticket-types,webhook-qr}`, `/api/posts[/id]`, `/api/qrapp/{active-fields,contacts[/id],events[/id],fields,orders[/id],orders,total-orders,sync-status,test-sync,tickets/[orderId],tickets/status[/id],timer,upsert-field,users/{add,delete}-user}`, `/api/superadmin/{add,delete}-user`, `/api/test`.

### Tests
**No test suite exists** — no `*.test.*`/`*.spec.*` files, no jest/vitest config. (Tech-stack context in CLAUDE.md mentions Jest for TS, but none is wired up here.)

### GHL integration map (verified from source)
1. **Webhook entry** — `app/api/ghl/webhook-qr/route.ts` `POST`: GHL fires on new order → extracts `order_id`/`contact_id`/`product_id` → generates QR from order URL → writes QR image back to GHL contact (`updateGHLField`) → async-calls `/api/ghl/orders/[id]` to sync.
2. **Order sync** — `app/api/ghl/orders/[id]/route.ts` + `app/api/ghl/orders/sync/syncOrders.ts` upsert orders + per-ticket rows into Supabase `ghl_qr_orders`; `services/syncStatusService.ts`; manual `/api/ghl/orders/sync`; Winston logs to `logs/`.
3. **QR generation** — `utils/qrapp/helpers.ts` `generateQRCode` (uses `qrcode` lib); `services/qrServices.ts` `updateQrCodeImage` persists to `ghl_qr_orders.qr_code_image`.
4. **Ticket validation** — `app/api/qrapp/tickets/status/[id]/route.ts` (single) + `app/api/qrapp/tickets/status/route.ts` (by order) `PUT` update ticket status; `services/ticketServices.ts` (`updateTicketStatusById`, `updateTicketsStatusByOrderId`, `fetchTicketsByOrderId`).

### Roles / portals
`middleware-role.ts` gates routes by Supabase `user_metadata` — e.g. `/superadmin-portal` requires `is_qr_superadmin === 1`; unauthenticated → redirect `/auth`.

### Conventions
`/services` = all API/external-integration logic (10 files); `/types` = all interfaces (`tickets.ts`, `orders.ts`, `events.ts`, `fields.ts`, `sync.ts`, `user.ts`, `posts.ts`); Zustand for state; ShadCN + Tailwind UI.

### docs/ inventory
`docs/{architecture,api,database,features,guides,state,ui-components,user-flows}/*.md` + `docs/images/*.png` (15 screenshots/diagrams) + `docs/README.md` index. Full table rendered in README.

---

## STEP 3 — README Upgrade (written to `README.md`)

Preserved every existing Cloudinary image URL and section heading (Overview, Auth & Roles, GHL Webhook, Admin Portal ×7, SuperAdmin Portal ×5, Forgotten Password). Wrapped in factory format:

1. Kept H1, added bold one-liner under it.
2. Badge row: Next.js 13.5.6 · TypeScript 5.6.2 · Supabase Auth+RLS · ShadCN · GHL Integration · YouTube Walkthrough (Part 1, links video).
3. Two YouTube links converted to clickable `img.youtube.com/vi/{id}/maxresdefault.jpg` thumbnails (Part 1 = `onxKPsJC7dA`, Part 2 = `I9gyM0be9sk`), with `hqdefault` fallback noted in HTML comments.
4. "Why This Exists" — 2 paragraphs (business problem + architecture story) + App Factory line.
5. "What's Inside" — 8 bullets, each verified against source files.
6. Documentation table linking `docs/` contents (filenames verified).
7. Quickstart — env vars from disk, placeholder shapes only (no realistic-looking keys).
8. Footer: Built by Ahmed Musawir — Software Architect & AI Engineer — through the App Factory → github.com/ahmedmusawir.

## Files changed (this step)
- `README.md` — rewritten (preserve + wrap)
- `.gitignore` — appended `/logs/`, `/temp/`, `/SESSION_31_DEC_2025.md`, `/DOCUMENTATION_PLAN.md`

## Status
**READY FOR COMMIT.** Git untrack/delete command block handed to operator (Rule Zero — Claude runs no git writes).