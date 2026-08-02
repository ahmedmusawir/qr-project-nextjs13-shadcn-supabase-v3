# QR Project V3 — Next.js 13 + Shadcn + Supabase w/ GHL Integration

**Live event ticketing platform with QR generation/scanning, GHL CRM integration, and role-based portals.**

![Next.js](https://img.shields.io/badge/Next.js-13.5.6-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20RLS-3ECF8E?logo=supabase&logoColor=white)
![ShadCN](https://img.shields.io/badge/ShadCN-UI-1f2937?logo=shadcnui&logoColor=white)
![GHL](https://img.shields.io/badge/GHL-Integration-8b5cf6)
[![YouTube Walkthrough](https://img.shields.io/badge/YouTube-Walkthrough_Part_1-FF0000?logo=youtube&logoColor=white)](https://www.youtube.com/watch?v=onxKPsJC7dA)

## Walkthrough Videos

[![QR Project w/ Next.js, Supabase & GHL — Part 1](https://img.youtube.com/vi/onxKPsJC7dA/maxresdefault.jpg)](https://www.youtube.com/watch?v=onxKPsJC7dA)
<!-- fallback: https://img.youtube.com/vi/onxKPsJC7dA/hqdefault.jpg -->

[![QR Project w/ Next.js, Supabase & GHL — Part 2](https://img.youtube.com/vi/I9gyM0be9sk/maxresdefault.jpg)](https://www.youtube.com/watch?v=I9gyM0be9sk)
<!-- fallback: https://img.youtube.com/vi/I9gyM0be9sk/hqdefault.jpg -->

## Why This Exists

Event organizers sell tickets through GoHighLevel (GHL) but had no way to validate
entry at the door: orders lived in the CRM, there were no per-ticket QR codes, and
gate staff had nothing to scan. This project closes that loop. When a customer
places an order in GHL, a webhook fires into the Next.js app, which generates a
unique QR code per order, writes it back onto the GHL contact record, and syncs the
order (and its individual tickets) into Supabase. At the event, staff scan the QR
code and the app validates each ticket against Supabase in real time — marking it
used, preventing duplicates, and giving admins a live view of admissions.

The architecture pairs **Next.js 13 (App Router)** with **Supabase** for auth,
row-level security, and order/ticket storage, and **GHL** as the upstream CRM and
order source. A custom Express-wrapped Next.js server hosts a Socket.io layer for
live updates, `middleware-role.ts` enforces role-based access across the admin,
superadmin, members, and public route groups, and a `/services` + `/types`
convention keeps all API logic and data shapes in one place. Originally hand-built
end to end; now maintained under the **App Factory** methodology.

The RBAC lessons from this build directly shaped the database-authoritative role model in my current Next.js 16 starter kit.

## What's Inside

- **GHL webhook → QR generation** — `POST /api/ghl/webhook-qr` fires on every new GHL order, generates a QR code from the order URL, writes the QR image back to the GHL contact, and kicks off a background order sync.
- **Order & ticket data sync** — the webhook async-calls `/api/ghl/orders/[id]` to upsert orders and per-ticket rows into Supabase (`ghl_qr_orders`), with a manual `/api/ghl/orders/sync` route, `syncStatusService`, and Winston logging.
- **QR code generation** — the `qrcode` library generates scannable per-order QR images via `utils/qrapp/helpers.ts` (`generateQRCode`), stored against each order for validation.
- **Ticket validation / scanning** — `PUT /api/qrapp/tickets/status/[id]` (single ticket) and `PUT /api/qrapp/tickets/status` (by order) update ticket status; `fetchTicketsByOrderId` pulls tickets per order in real time.
- **Role-based portals** — route groups `(admin)`, `(superadmin)`, `(members)`, `(auth)`, and `(public)` with role-based access control; superadmin handles user add/delete.
- **Supabase auth + password reset** — Supabase Auth powers login, signup, logout, email confirm, and a forgotten-password reset flow.
- **Real-time + logging** — Socket.io for live admissions updates, Winston logger, and a custom Express server (`server.js` / `server.prod.js`).
- **Conventions** — `/services` for all API/external-integration logic, `/types` for all interfaces (e.g. `types/tickets.ts`), Zustand for state, ShadCN + Tailwind for UI.

## Documentation

### Architecture

| Document | Path |
| --- | --- |
| Overview | [docs/architecture/overview.md](docs/architecture/overview.md) |
| Authentication | [docs/architecture/authentication.md](docs/architecture/authentication.md) |
| Data Flow | [docs/architecture/data-flow.md](docs/architecture/data-flow.md) |
| Routing | [docs/architecture/routing.md](docs/architecture/routing.md) |
| State Management | [docs/architecture/state-management.md](docs/architecture/state-management.md) |

### API

| Document | Path |
| --- | --- |
| Auth Endpoints | [docs/api/auth-endpoints.md](docs/api/auth-endpoints.md) |
| GHL Integration | [docs/api/ghl-integration.md](docs/api/ghl-integration.md) |
| QR App Endpoints | [docs/api/qr-app-endpoints.md](docs/api/qr-app-endpoints.md) |
| Superadmin Endpoints | [docs/api/superadmin-endpoints.md](docs/api/superadmin-endpoints.md) |
| Webhook Integration | [docs/api/webhook-integration.md](docs/api/webhook-integration.md) |

### Database

| Document | Path |
| --- | --- |
| Schema | [docs/database/schema.md](docs/database/schema.md) |
| Data Relationships | [docs/database/data-relationships.md](docs/database/data-relationships.md) |
| Tables Reference | [docs/database/tables-reference.md](docs/database/tables-reference.md) |

### Features

| Document | Path |
| --- | --- |
| Event Ticketing | [docs/features/event-ticketing.md](docs/features/event-ticketing.md) |
| QR Code Generation | [docs/features/qr-code-generation.md](docs/features/qr-code-generation.md) |
| Ticket Validation | [docs/features/ticket-validation.md](docs/features/ticket-validation.md) |
| Data Synchronization | [docs/features/data-synchronization.md](docs/features/data-synchronization.md) |
| User Management | [docs/features/user-management.md](docs/features/user-management.md) |

### Guides

| Document | Path |
| --- | --- |
| Getting Started | [docs/guides/getting-started.md](docs/guides/getting-started.md) |
| Development Workflow | [docs/guides/development-workflow.md](docs/guides/development-workflow.md) |
| Deployment Guide | [docs/guides/deployment-guide.md](docs/guides/deployment-guide.md) |

### State & UI

| Document | Path |
| --- | --- |
| State Patterns | [docs/state/state-patterns.md](docs/state/state-patterns.md) |
| Zustand Stores | [docs/state/zustand-stores.md](docs/state/zustand-stores.md) |
| Design System | [docs/ui-components/design-system.md](docs/ui-components/design-system.md) |
| Component Library | [docs/ui-components/component-library.md](docs/ui-components/component-library.md) |
| Forms & Validation | [docs/ui-components/forms-and-validation.md](docs/ui-components/forms-and-validation.md) |
| Admin Portal | [docs/ui-components/admin-portal.md](docs/ui-components/admin-portal.md) |
| Superadmin Portal | [docs/ui-components/superadmin-portal.md](docs/ui-components/superadmin-portal.md) |

### User Flows

| Document | Path |
| --- | --- |
| Authentication Flows | [docs/user-flows/authentication-flows.md](docs/user-flows/authentication-flows.md) |
| Admin Workflows | [docs/user-flows/admin-workflows.md](docs/user-flows/admin-workflows.md) |
| Superadmin Workflows | [docs/user-flows/superadmin-workflows.md](docs/user-flows/superadmin-workflows.md) |

> Docs index: [docs/README.md](docs/README.md)

---

# Overview

![Project Overview](https://res.cloudinary.com/dyb0qa58h/image/upload/v1730270105/QR_PROJECT_-_OVERVIEW_ks1dvx.png)

## Authentication & Role-based Access

![Auth & Roles](https://res.cloudinary.com/dyb0qa58h/image/upload/v1731807952/QR_-_AUTH_ROLES_pr6ftf.png)

## GHL Webhook Integration w/ Next.js

![GHL Webhook](https://res.cloudinary.com/dyb0qa58h/image/upload/v1731807952/QR_-_GHL_WEBHOOK_tt8kpn.png)

# Admin Portal

## Overview

![Overview](https://res.cloudinary.com/dyb0qa58h/image/upload/v1730270105/QR_PROJECT_-_ADMIN_PORTAL_-_OVERVIEW_z8shwb.png)

## Data Sync Between GHL & Supabase via Next.js: Part 1

![Data Sync Part 1](https://res.cloudinary.com/dyb0qa58h/image/upload/v1730373534/QR_-_DATA_SYNC_-_PART_1_j4nben.png)

## Data Sync Between GHL & Supabase via Next.js: Part 2

![Data Sync Part 2](https://res.cloudinary.com/dyb0qa58h/image/upload/v1730373534/QR_-_DATA_SYNC_-_PART_2_b9ywvh.png)

## Data Sync Between GHL & Supabase via Next.js: Part 3

![Data Sync Part 3](https://res.cloudinary.com/dyb0qa58h/image/upload/v1730373533/QR_-_DATA_SYNC_-_PART_3_qild9w.png)

## Event List Page

![Event List Page](https://res.cloudinary.com/dyb0qa58h/image/upload/v1730270105/QR_PROJECT_-_ADMIN_PORTAL_-_EVENTS_LIST_PAGE_zsvdie.png)

## Order List Page

![Order List Page](https://res.cloudinary.com/dyb0qa58h/image/upload/v1730270105/QR_PROJECT_-_ADMIN_PORTAL_-_ORDER_LIST_PAGE_x9xjlh.png)

## Tickets List Page

![Tickets List Page](https://res.cloudinary.com/dyb0qa58h/image/upload/v1730270105/QR_PROJECT_-_ADMIN_PORTAL_-_TICKETS_PAGE_v46jbd.png)

## User Profile Page

![User Profile Page](https://res.cloudinary.com/dyb0qa58h/image/upload/v1730270106/QR_PROJECT_-_ADMIN_PORTAL_-_USER_PROFILE_aqqfuz.png)

# SuperAdmin Portal

## User Management Overview

![User Management](https://res.cloudinary.com/dyb0qa58h/image/upload/v1731812231/QR_-_SUPER_ADMIN_PORTAL_gru3s5.png)

## User Dashboard Page

![User Dashboard Page](https://res.cloudinary.com/dyb0qa58h/image/upload/v1731812231/QR_-_USER_DASHBOARD_shhvxm.png)

## Add User Form Page

![Add User Form Page](https://res.cloudinary.com/dyb0qa58h/image/upload/v1731812231/QR_-_ADD_USER_FORM_nkuzw1.png)

## User Profile Page

![User Profile Page](https://res.cloudinary.com/dyb0qa58h/image/upload/v1731812231/QR_-_SUPERADMIN_USER_PROFILE_xivrih.png)

## Forgotten Password Reset w/ Supabase

![Forgotten Password](https://res.cloudinary.com/dyb0qa58h/image/upload/v1731807952/QR_-_FORGOTTEN_PASSWORD_fxzw0n.png)

---

## Quickstart

> All secrets come from environment variables — none are hardcoded in the repo.
> Copy the shapes below into a `.env.local` file at the project root and fill in
> your own values. (These are placeholder shapes, not real keys.)

### Supabase

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### GoHighLevel (GHL)

```bash
NEXT_PUBLIC_GHL_API_BASE_URL=https://your-ghl-api-base-url
NEXT_PUBLIC_GHL_LOCATION_ID=your-ghl-location-id
GHL_ACCESS_TOKEN=your-ghl-access-token
GHL_WEBHOOK_SECRET=your-ghl-webhook-secret
```

### App

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### Install & run

```bash
npm install
npm run dev      # custom Express + Next.js server (server.js)
# production:
npm run build
npm run start    # server.prod.js
```

> **Note on roles:** Roles are granted via Supabase Auth — see
> [docs/architecture/authentication.md](docs/architecture/authentication.md).

---

<footer>

**Built by [Ahmed Musawir](https://github.com/ahmedmusawir) — Software Architect & AI Engineer — through the [App Factory](https://github.com/ahmedmusawir).**

</footer>