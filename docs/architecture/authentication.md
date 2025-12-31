# Authentication Architecture

This document describes the authentication and authorization system in the QR Project V3, including Supabase Auth integration, role-based access control, and session management.

---

## Overview

The QR Project V3 uses **Supabase Auth** for authentication with a custom role-based access control (RBAC) system. Users are authenticated via email/password and assigned roles stored in user metadata.

---

## Authentication Flow

![Auth and Role-Based Redirection](../images/auth-roles-flow.png)

### Login Process

```
┌─────────────┐
│    User     │
│  /auth page │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│   <AuthTab />               │
│   Location: components/auth/│
│            AuthTab.tsx:1    │
│                             │
│   Contains:                 │
│   - <LoginForm />           │
│   - Sign up tab             │
└──────┬──────────────────────┘
       │ Email & Password
       ▼
┌─────────────────────────────────────┐
│  <LoginForm />                      │
│  Location: components/auth/         │
│           LoginForm.tsx:1           │
│                                     │
│  react-hook-form + Zod validation  │
└──────┬──────────────────────────────┘
       │ Submit
       ▼
┌─────────────────────────────────────┐
│  Zustand Store                      │
│  useAuthStore.login(email, password)│
│  Location: store/useAuthStore.ts:46 │
└──────┬──────────────────────────────┘
       │ POST
       ▼
┌─────────────────────────────────────┐
│  POST /api/auth/login/route.ts:1    │
│                                     │
│  Calls Supabase Auth:               │
│  supabase.auth.signInWithPassword() │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  SUPABASE AUTH                      │
│  supabase.auth.signInWithPassword({ │
│    email,                           │
│    password                         │
│  })                                 │
└──────┬──────────────────────────────┘
       │ Returns user + session
       ▼
┌─────────────────────────────────────┐
│  Update Zustand Store               │
│  set({                              │
│    user,                            │
│    isAuthenticated: true,           │
│    roles: user.user_metadata        │
│  })                                 │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Role-Based Redirect                │
│                                     │
│  if (is_qr_superadmin === 1)        │
│    → /superadmin-portal             │
│  else if (is_qr_admin === 1)        │
│    → /admin-portal                  │
│  else if (is_qr_member === 1)       │
│    → /members-portal                │
│  else                               │
│    → /                              │
└─────────────────────────────────────┘
```

### Code Implementation

#### 1. Login Form Component

```typescript
// components/auth/LoginForm.tsx:1
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/useAuthStore';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const login = useAuthStore((state) => state.login);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        type="email"
        {...register('email')}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email.message}</span>}

      <Input
        type="password"
        {...register('password')}
        placeholder="Password"
      />
      {errors.password && <span>{errors.password.message}</span>}

      <Button type="submit">Login</Button>
    </form>
  );
};
```

#### 2. Zustand Auth Store

```typescript
// store/useAuthStore.ts:46
login: async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error);
  }

  const result = await response.json();
  const user = result.data.user;

  set({
    user,
    roles: user?.user_metadata || {
      is_qr_superadmin: 0,
      is_qr_admin: 0,
      is_qr_member: 0,
    },
    isAuthenticated: true,
  });
}
```

#### 3. Login API Endpoint

```typescript
// app/api/auth/login/route.ts:1
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
```

---

## Role-Based Access Control (RBAC)

### User Roles

The system supports three roles:

| Role | Metadata Key | Value | Access Level |
|------|-------------|-------|--------------|
| **SuperAdmin** | `is_qr_superadmin` | `1` | Full system access + user management |
| **Admin** | `is_qr_admin` | `1` | Event, order, ticket management |
| **Member** | `is_qr_member` | `1` | Limited access to member portal |

### User Metadata Structure

Roles are stored in Supabase Auth user metadata:

```typescript
{
  "is_qr_superadmin": 1,  // 1 = has role, 0 = doesn't have role
  "is_qr_admin": 1,
  "is_qr_member": 0,
  "name": "John Doe"
}
```

### Multiple Roles

Users can have multiple roles. For example, a SuperAdmin typically also has Admin privileges:

```json
{
  "is_qr_superadmin": 1,
  "is_qr_admin": 1,
  "is_qr_member": 0,
  "name": "Super Admin User"
}
```

**Redirect Priority:**
1. If `is_qr_superadmin === 1` → `/superadmin-portal`
2. Else if `is_qr_admin === 1` → `/admin-portal`
3. Else if `is_qr_member === 1` → `/members-portal`
4. Else → `/` (homepage)

---

## Route Protection

### HOC-Based Protection

Routes are protected using Higher-Order Components (HOCs) that wrap layout components.

#### Admin Protection

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

          // Redirect to auth
          router.push('/auth');
        }
      }
    }, [isAuthenticated, roles, router, isLoading, logoutInProgress]);

    // Show spinner while loading
    if (isLoading || !isAuthenticated || roles.is_qr_admin !== 1) {
      return <Spinner />;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAdminProtection;
```

#### Usage in Layout

```typescript
// app/(admin)/layout.tsx:1
import withAdminProtection from '@/hoc/withAdminProtection';

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <AdminSidebar />
      <main>{children}</main>
    </div>
  );
}

// Wrap and export
export default withAdminProtection(AdminLayout);
```

### Protection Hierarchy

```
Request: /admin-portal
        │
        ▼
┌───────────────────────┐
│   Next.js Middleware  │
│   middleware.ts:1     │
│   - Validate session  │
│   - Refresh tokens    │
└───────┬───────────────┘
        │
        ▼
┌───────────────────────┐
│   Admin Layout        │
│   (admin)/layout.tsx  │
└───────┬───────────────┘
        │
        ▼
┌───────────────────────┐
│   withAdminProtection │
│   HOC Wrapper         │
│   - Check auth        │
│   - Check role        │
└───────┬───────────────┘
        │
    ┌───┴───┐
   No      Yes
    │       │
    ▼       ▼
Redirect  Render
to /auth  Page
```

---

## Session Management

### Cookie-Based Sessions

Supabase Auth uses HTTP-only cookies for session management, providing security against XSS attacks.

#### Server Client

```typescript
// utils/supabase/server.ts:1
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
};
```

#### Browser Client

```typescript
// utils/supabase/client.ts:1
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

### Session Persistence

- **Server-Side:** Sessions stored in HTTP-only cookies
- **Client-Side:** Zustand store persists auth state to localStorage
- **Auto-Refresh:** Middleware refreshes tokens on every request

---

## Password Reset Flow

![Forgotten Password Flow](../images/forgotten-password-flow.png)

### Reset Process

```
User → /auth → Click "Forgot Password?"
       │
       ▼
┌─────────────────────────────┐
│  <ForgotPassForm />         │
│  Location: components/auth/ │
│           ForgotPassForm.tsx│
│                             │
│  Enter email address        │
└─────┬───────────────────────┘
      │
      ▼
┌─────────────────────────────┐
│  handleForgotPassword()     │
│  supabase.auth              │
│    .resetPasswordForEmail() │
└─────┬───────────────────────┘
      │
      ▼
┌─────────────────────────────┐
│  SUPABASE AUTH              │
│  Sends email with reset link│
│  Link contains session token│
└─────┬───────────────────────┘
      │
      ▼
┌─────────────────────────────┐
│  User clicks email link     │
│  Redirected to:             │
│  /auth/pass-reset           │
│  ?token=...                 │
└─────┬───────────────────────┘
      │
      ▼
┌─────────────────────────────┐
│  /auth/pass-reset/page.tsx  │
│  Location: app/(auth)/auth/ │
│           pass-reset/       │
│           page.tsx:1        │
│                             │
│  getSession() - Auto login  │
└─────┬───────────────────────┘
      │
      ▼
┌─────────────────────────────┐
│  <ResetPassForm />          │
│  Location: app/(auth)/auth/ │
│           pass-reset/       │
│           reset-pass-form.tsx│
│                             │
│  Enter new password         │
└─────┬───────────────────────┘
      │
      ▼
┌─────────────────────────────┐
│  updatePassword()           │
│  Location: services/        │
│           userServices.ts:1 │
│                             │
│  supabase.auth.updateUser({ │
│    password: newPassword    │
│  })                         │
└─────┬───────────────────────┘
      │
      ▼
┌─────────────────────────────┐
│  Password Updated           │
│  Redirect to app            │
└─────────────────────────────┘
```

### Code Implementation

#### Forgot Password Form

```typescript
// components/auth/ForgotPassForm.tsx:1
export const ForgotPassForm = () => {
  const handleForgotPassword = async (email: string) => {
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/pass-reset`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password reset email sent');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input type="email" placeholder="Email" {...register('email')} />
      <Button type="submit">Send Reset Link</Button>
    </form>
  );
};
```

#### Reset Password Form

```typescript
// app/(auth)/auth/pass-reset/reset-pass-form.tsx:1
import { updatePassword } from '@/services/userServices';

export const ResetPassForm = () => {
  const handleResetPassword = async (password: string) => {
    try {
      await updatePassword(password);
      toast.success('Password updated successfully');
      router.push('/auth');
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input type="password" placeholder="New Password" {...register('password')} />
      <Button type="submit">Update Password</Button>
    </form>
  );
};
```

#### Update Password Service

```typescript
// services/userServices.ts:1
export const updatePassword = async (password: string) => {
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) throw error;
};
```

---

## Logout Process

```
User clicks "Logout"
       │
       ▼
┌─────────────────────────────┐
│  Zustand Store              │
│  useAuthStore.logout()      │
│  Location: store/           │
│           useAuthStore.ts:1 │
└─────┬───────────────────────┘
      │
      ▼
┌─────────────────────────────┐
│  POST /api/auth/logout      │
│  Location: app/api/auth/    │
│           logout/route.ts:1 │
└─────┬───────────────────────┘
      │
      ▼
┌─────────────────────────────┐
│  supabase.auth.signOut()    │
│  Clears session cookies     │
└─────┬───────────────────────┘
      │
      ▼
┌─────────────────────────────┐
│  Clear Zustand Store        │
│  set({                      │
│    user: null,              │
│    isAuthenticated: false,  │
│    roles: { ... all 0 }     │
│  })                         │
└─────┬───────────────────────┘
      │
      ▼
┌─────────────────────────────┐
│  Redirect to /              │
└─────────────────────────────┘
```

### Code Implementation

```typescript
// store/useAuthStore.ts:1
logout: async () => {
  set({ logoutInProgress: true });

  await fetch('/api/auth/logout', {
    method: 'POST',
  });

  set({
    user: null,
    roles: {
      is_qr_superadmin: 0,
      is_qr_admin: 0,
      is_qr_member: 0,
    },
    isAuthenticated: false,
    logoutInProgress: false,
  });

  router.push('/');
}
```

---

## User Management (SuperAdmin Only)

### Creating Users

SuperAdmins can create new users with specific roles.

```typescript
// services/userServices.ts:1
export const superadminAddNewUser = async (
  email: string,
  password: string,
  user_metadata: {
    name: string;
    is_qr_admin: number;
    is_qr_superadmin: number;
    is_qr_member: number;
  }
) => {
  const response = await fetch('/api/superadmin/add-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, user_metadata }),
  });

  if (!response.ok) throw new Error('Failed to create user');
  return response.json();
};
```

### Deleting Users

```typescript
// services/userServices.ts:1
export const deleteUserCompletely = async (user_id: string) => {
  const response = await fetch('/api/superadmin/delete-user', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id }),
  });

  if (!response.ok) throw new Error('Failed to delete user');
  return response.json();
};
```

**Note:** User deletion removes the user from both:
1. **Supabase Auth** (authentication table)
2. **ghl_qr_users** (custom user table)

---

## Security Best Practices

### 1. Never Expose Service Role Key

```typescript
// ✅ Good - Server-side only
// utils/supabase/admin-client.ts:1
import { createClient } from '@supabase/supabase-js';

export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!  // Server-side env var
  );
```

```typescript
// ❌ Bad - Never do this
const adminClient = createClient(
  url,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY  // WRONG!
);
```

### 2. Validate on Server

Always validate sessions on the server, not just client:

```typescript
// API Route
export async function GET(request: NextRequest) {
  const supabase = createClient();

  // Validate session
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Proceed...
}
```

### 3. HTTP-Only Cookies

Supabase SSR automatically uses HTTP-only cookies, protecting against XSS attacks.

### 4. CSRF Protection

Next.js provides built-in CSRF protection for API routes.

---

## Quick Reference

### Auth Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | User login |
| `/api/auth/logout` | POST | User logout |
| `/api/auth/signup` | POST | User registration |
| `/api/auth/getUser` | GET | Get current user |
| `/api/auth/confirm` | GET | Email confirmation |

### Key Files

| File | Purpose | Location |
|------|---------|----------|
| Auth Store | Authentication state | `store/useAuthStore.ts:1` |
| Admin HOC | Admin route protection | `hoc/withAdminProtection.tsx:1` |
| Server Client | Server-side Supabase | `utils/supabase/server.ts:1` |
| Browser Client | Client-side Supabase | `utils/supabase/client.ts:1` |
| Admin Client | Admin operations | `utils/supabase/admin-client.ts:1` |

### Role Checks

```typescript
// Check if user is SuperAdmin
const isSuperAdmin = useAuthStore((state) => state.roles.is_qr_superadmin === 1);

// Check if user is Admin
const isAdmin = useAuthStore((state) => state.roles.is_qr_admin === 1);

// Check if authenticated
const isAuth = useAuthStore((state) => state.isAuthenticated);
```

---

## Related Documentation

- [Routing Architecture](/docs/architecture/routing.md)
- [System Overview](/docs/architecture/overview.md)
- [User Management Feature](/docs/features/user-management.md)
- [Authentication Flows](/docs/user-flows/authentication-flows.md)

---

**Last Updated:** December 31, 2025
