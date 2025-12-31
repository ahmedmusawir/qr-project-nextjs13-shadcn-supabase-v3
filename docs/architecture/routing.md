# Routing Architecture

This document describes the routing structure of the QR Project V3, including Next.js App Router patterns, route groups, dynamic routes, and protected route implementation.

---

## Next.js 13 App Router

The application uses Next.js 13's App Router (introduced in Next.js 13), which provides:

- **File-based routing** - Folders define URL structure
- **React Server Components** - Server-side rendering by default
- **Route Groups** - Organize routes without affecting URL
- **Layouts** - Shared UI across routes
- **Loading & Error States** - Built-in UI states

---

## Route Organization

### Route Groups

Routes are organized into **route groups** using parentheses `(group-name)`. This allows logical grouping without affecting the URL path.

```
app/
├── (public)/              # Public routes (no auth required)
├── (auth)/                # Authentication routes
├── (admin)/               # Admin portal (protected)
├── (superadmin)/          # SuperAdmin portal (protected)
└── (members)/             # Members portal (protected)
```

**Key Benefit:** Each group can have its own layout and protection logic while sharing the same URL namespace.

---

## Complete Route Structure

```
app/
│
├── (public)/                              # Public Route Group
│   ├── page.tsx                           # Homepage: /
│   └── wp-blog/                           # Blog routes
│       ├── page.tsx                       # Blog list: /wp-blog
│       └── [id]/                          # Single post: /wp-blog/[id]
│           └── page.tsx
│
├── (auth)/                                # Auth Route Group
│   ├── auth/                              # Auth pages
│   │   ├── page.tsx                       # Login/Signup: /auth
│   │   └── pass-reset/                    # Password reset
│   │       └── page.tsx                   # Reset page: /auth/pass-reset
│   └── layout.tsx                         # Auth layout (minimal)
│
├── (admin)/                               # Admin Route Group (PROTECTED)
│   ├── layout.tsx                         # Admin layout (with HOC protection)
│   ├── admin-portal/                      # Admin dashboard
│   │   └── page.tsx                       # Dashboard: /admin-portal
│   ├── events/                            # Events routes
│   │   └── [id]/                          # Single event
│   │       └── page.tsx                   # Event page: /events/[id]
│   ├── orders/                            # Orders routes
│   │   └── [id]/                          # Single order
│   │       └── page.tsx                   # Order page: /orders/[id]
│   ├── profile/                           # User profile
│   │   └── [id]/                          # Profile by ID
│   │       └── page.tsx                   # Profile: /profile/[id]
│   └── socket-test/                       # Socket.IO test
│       └── page.tsx                       # Test: /socket-test
│
├── (superadmin)/                          # SuperAdmin Route Group (PROTECTED)
│   ├── layout.tsx                         # SuperAdmin layout (with HOC)
│   ├── superadmin-portal/                 # SuperAdmin dashboard
│   │   └── page.tsx                       # Dashboard: /superadmin-portal
│   ├── add-user/                          # Add user form
│   │   └── page.tsx                       # Form: /add-user
│   └── superadmin/                        # SuperAdmin nested
│       └── profile/                       # User profile management
│           └── [id]/                      # Profile by ID
│               └── page.tsx               # Profile: /superadmin/profile/[id]
│
├── (members)/                             # Members Route Group (PROTECTED)
│   ├── layout.tsx                         # Member layout (with HOC)
│   └── members-portal/                    # Member dashboard
│       └── page.tsx                       # Dashboard: /members-portal
│
├── api/                                   # API Routes
│   ├── auth/                              # Auth endpoints
│   │   ├── login/route.ts                 # POST /api/auth/login
│   │   ├── logout/route.ts                # POST /api/auth/logout
│   │   ├── signup/route.ts                # POST /api/auth/signup
│   │   ├── getUser/route.ts               # GET /api/auth/getUser
│   │   └── confirm/route.ts               # GET /api/auth/confirm
│   ├── ghl/                               # GHL integration
│   │   ├── orders/                        # Orders endpoints
│   │   │   ├── route.ts                   # GET /api/ghl/orders
│   │   │   ├── [id]/route.ts              # GET /api/ghl/orders/[id]
│   │   │   └── sync/route.ts              # GET /api/ghl/orders/sync
│   │   ├── webhook-qr/route.ts            # POST /api/ghl/webhook-qr
│   │   ├── events/route.ts                # GET /api/ghl/events
│   │   ├── contacts/route.ts              # GET /api/ghl/contacts
│   │   └── price/route.ts                 # GET /api/ghl/price
│   ├── qrapp/                             # Internal app endpoints
│   │   ├── orders/                        # Orders CRUD
│   │   │   ├── route.ts                   # GET /api/qrapp/orders
│   │   │   ├── [id]/route.ts              # GET /api/qrapp/orders/[id]
│   │   │   └── total-orders/route.ts      # GET /api/qrapp/orders/total-orders
│   │   ├── tickets/                       # Tickets CRUD
│   │   │   ├── [orderId]/route.ts         # GET /api/qrapp/tickets/[orderId]
│   │   │   └── status/                    # Ticket status updates
│   │   │       ├── route.ts               # PUT /api/qrapp/tickets/status
│   │   │       └── [id]/route.ts          # PUT /api/qrapp/tickets/status/[id]
│   │   ├── events/                        # Events endpoints
│   │   │   ├── route.ts                   # GET /api/qrapp/events
│   │   │   └── [id]/route.ts              # GET /api/qrapp/events/[id]
│   │   ├── users/                         # User endpoints
│   │   │   ├── add-user/route.ts          # POST /api/qrapp/users/add-user
│   │   │   └── delete-user/route.ts       # DELETE /api/qrapp/users/delete-user
│   │   └── fields/route.ts                # GET /api/qrapp/fields
│   ├── superadmin/                        # SuperAdmin endpoints
│   │   ├── add-user/route.ts              # POST /api/superadmin/add-user
│   │   └── delete-user/route.ts           # DELETE /api/superadmin/delete-user
│   └── sync-status/route.ts               # GET /api/sync-status
│
├── providers/                             # Context providers
│   └── ToastProvider.tsx                  # Toast notifications provider
│
└── layout.tsx                             # Root layout
```

---

## Route Groups Explained

### 1. (public) - Public Routes

**Access:** Anyone (no authentication required)

**Routes:**
- `/` - Homepage
- `/wp-blog` - Blog listing
- `/wp-blog/[id]` - Single blog post

**Layout:** Minimal layout with Navbar

**No Protection:** These routes are accessible without login

---

### 2. (auth) - Authentication Routes

**Access:** Unauthenticated users

**Routes:**
- `/auth` - Login/Signup page
- `/auth/pass-reset` - Password reset

**Special Behavior:**
- Authenticated users are redirected away from these routes
- After login, users are redirected to their appropriate portal

---

### 3. (admin) - Admin Portal (Protected)

**Access:** Users with `is_qr_admin: 1`

**Routes:**
- `/admin-portal` - Admin dashboard with events list
- `/events/[id]` - Event details with orders
- `/orders/[id]` - Single order with tickets
- `/profile/[id]` - User profile
- `/socket-test` - Socket.IO testing page

**Protection:** HOC wrapper at layout level

**Layout File:**
```typescript
// app/(admin)/layout.tsx:1
import withAdminProtection from '@/hoc/withAdminProtection';
import AdminSidebar from '@/components/admin/AdminSidebar';

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

export default withAdminProtection(AdminLayout);
```

---

### 4. (superadmin) - SuperAdmin Portal (Protected)

**Access:** Users with `is_qr_superadmin: 1`

**Routes:**
- `/superadmin-portal` - SuperAdmin dashboard with user list
- `/add-user` - Create new user
- `/superadmin/profile/[id]` - Manage user profiles

**Protection:** HOC wrapper at layout level

**Additional Capabilities:**
- All admin capabilities
- User management (create/delete users)
- Access to all user profiles

---

### 5. (members) - Members Portal (Protected)

**Access:** Users with `is_qr_member: 1`

**Routes:**
- `/members-portal` - Member dashboard

**Protection:** HOC wrapper at layout level

**Note:** Currently minimal functionality, designed for future expansion

---

## Protected Routes Implementation

### Higher-Order Components (HOC)

The application uses HOCs to wrap layout components, providing route protection at the layout level.

#### Admin Protection HOC

```typescript
// hoc/withAdminProtection.tsx:13
const withAdminProtection = (WrappedComponent: ComponentType<LayoutProps>) => {
  return (props: LayoutProps) => {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const roles = useAuthStore((state) => state.roles);
    const isLoading = useAuthStore((state) => state.isLoading);
    const logoutInProgress = useAuthStore((state) => state.logoutInProgress);

    useEffect(() => {
      if (!isLoading && !logoutInProgress) {
        if (!isAuthenticated || roles.is_qr_admin !== 1) {
          // Store current URL for post-login redirect
          const currentURL = window.location.href;
          localStorage.setItem('redirectAfterLogin', currentURL);

          // Redirect to auth page
          router.push('/auth');
        }
      }
    }, [isAuthenticated, roles, router, isLoading, logoutInProgress]);

    // Show spinner while loading or not authenticated
    if (isLoading || !isAuthenticated || roles.is_qr_admin !== 1) {
      return <Spinner />;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAdminProtection;
```

#### SuperAdmin Protection HOC

```typescript
// hoc/withSuperAdminProtection.tsx:1
const withSuperAdminProtection = (WrappedComponent: ComponentType<LayoutProps>) => {
  return (props: LayoutProps) => {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const roles = useAuthStore((state) => state.roles);
    const isLoading = useAuthStore((state) => state.isLoading);

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated || roles.is_qr_superadmin !== 1) {
          router.push('/auth');
        }
      }
    }, [isAuthenticated, roles, router, isLoading]);

    if (isLoading || !isAuthenticated || roles.is_qr_superadmin !== 1) {
      return <Spinner />;
    }

    return <WrappedComponent {...props} />;
  };
};
```

### Protection Flow

```
User requests /admin-portal
       │
       ▼
┌────────────────────────────┐
│  Next.js Middleware        │
│  middleware.ts:1           │
│                            │
│  1. Check Supabase session │
│  2. Validate cookie        │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│  Admin Layout              │
│  app/(admin)/layout.tsx:1  │
│                            │
│  Wrapped with HOC          │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│  withAdminProtection       │
│  hoc/withAdminProtection.  │
│  tsx:13                    │
│                            │
│  1. Check isAuthenticated  │
│  2. Check is_qr_admin = 1  │
│  3. Redirect if not auth   │
└────────┬───────────────────┘
         │
    ┌────┴────┐
    │         │
Not Auth   Authorized
    │         │
    ▼         ▼
Redirect   Render
to /auth   Admin Page
```

---

## Dynamic Routes

### Event Details

**Route:** `/events/[id]`

**File:** `app/(admin)/events/[id]/page.tsx`

**Access Params:**
```typescript
interface PageProps {
  params: {
    id: string; // Event ID
  };
}

export default async function EventPage({ params }: PageProps) {
  const eventId = params.id;
  // Fetch event data using eventId
}
```

**URL Example:** `/events/abc123xyz` → `params.id = "abc123xyz"`

### Order Details

**Route:** `/orders/[id]`

**File:** `app/(admin)/orders/[id]/page.tsx`

**Usage:**
```typescript
interface PageProps {
  params: {
    id: string; // Order ID
  };
}

export default async function OrderPage({ params }: PageProps) {
  const orderId = params.id;
  // Fetch order and tickets using orderId
}
```

### User Profile

**Route:** `/profile/[id]` or `/superadmin/profile/[id]`

**Multiple Implementations:**
- **Admin:** View own profile
- **SuperAdmin:** View/edit any user profile

---

## Middleware

Next.js middleware runs before every request to validate sessions.

```typescript
// middleware.ts:1
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Refresh session
  await supabase.auth.getSession();

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

**What Middleware Does:**
1. **Session Refresh** - Ensures session is valid
2. **Cookie Management** - Sets/removes session cookies
3. **Runs on Every Route** - Except static files

---

## Navigation

### Server-Side Navigation

```typescript
// Server Components
import { redirect } from 'next/navigation';

export default async function Page() {
  const user = await getUser();

  if (!user) {
    redirect('/auth');
  }

  return <div>...</div>;
}
```

### Client-Side Navigation

```typescript
// Client Components
'use client';

import { useRouter } from 'next/navigation';

export function MyComponent() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/admin-portal');
  };

  return <button onClick={handleClick}>Go to Admin</button>;
}
```

### Link Component

```typescript
import Link from 'next/link';

<Link href="/admin-portal">Admin Portal</Link>
<Link href={`/orders/${orderId}`}>View Order</Link>
```

---

## Role-Based Redirects

After login, users are redirected based on their role:

```typescript
// store/useAuthStore.ts (login function)
const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const user = data.user;
  const roles = {
    is_qr_superadmin: user.user_metadata.is_qr_superadmin || 0,
    is_qr_admin: user.user_metadata.is_qr_admin || 0,
    is_qr_member: user.user_metadata.is_qr_member || 0,
  };

  set({ user, isAuthenticated: true, roles });

  // Redirect based on role
  if (roles.is_qr_superadmin === 1) {
    router.push('/superadmin-portal');
  } else if (roles.is_qr_admin === 1) {
    router.push('/admin-portal');
  } else if (roles.is_qr_member === 1) {
    router.push('/members-portal');
  } else {
    router.push('/');
  }
};
```

---

## API Routes

### Route Convention

API routes follow Next.js App Router convention:
- `route.ts` files define API endpoints
- HTTP methods are exported functions

### Example API Route

```typescript
// app/api/qrapp/orders/route.ts:1
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('ghl_qr_orders')
      .select('*');

    if (error) throw error;

    return NextResponse.json({ orders: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### Dynamic API Route

```typescript
// app/api/qrapp/orders/[id]/route.ts:1
interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const orderId = context.params.id;

  // Fetch order by ID
  const { data } = await supabase
    .from('ghl_qr_orders')
    .select('*')
    .eq('order_id', orderId)
    .single();

  return NextResponse.json({ order: data });
}
```

---

## Quick Reference

### Route Protection Levels

| Route Group | Auth Required | Role Required | HOC Used |
|-------------|---------------|---------------|----------|
| (public) | ❌ No | None | None |
| (auth) | ❌ No | None | None |
| (admin) | ✅ Yes | `is_qr_admin: 1` | `withAdminProtection` |
| (superadmin) | ✅ Yes | `is_qr_superadmin: 1` | `withSuperAdminProtection` |
| (members) | ✅ Yes | `is_qr_member: 1` | `withMemberProtection` |

### Key Routing Files

| File | Purpose | Location |
|------|---------|----------|
| Root Layout | App-wide layout | `app/layout.tsx:1` |
| Admin Layout | Admin portal layout | `app/(admin)/layout.tsx:1` |
| SuperAdmin Layout | SuperAdmin layout | `app/(superadmin)/layout.tsx:1` |
| Middleware | Session validation | `middleware.ts:1` |
| Admin HOC | Admin protection | `hoc/withAdminProtection.tsx:1` |

---

## Related Documentation

- [System Overview](/docs/architecture/overview.md)
- [Authentication](/docs/architecture/authentication.md)
- [Admin Workflows](/docs/user-flows/admin-workflows.md)
- [SuperAdmin Workflows](/docs/user-flows/superadmin-workflows.md)

---

**Last Updated:** December 31, 2025
