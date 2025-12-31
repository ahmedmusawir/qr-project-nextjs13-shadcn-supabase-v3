# Authentication API Endpoints

This document describes all authentication-related API endpoints in the QR Project V3, including login, logout, signup, and user session management using Supabase Auth.

---

## Overview

The authentication API provides secure user access control using Supabase Authentication with Server-Side Rendering (SSR) support. All auth routes are located under `/app/api/auth/`.

### Authentication Flow

```
Client Request
    ↓
POST /api/auth/login
    ↓
Supabase Auth.signInWithPassword()
    ↓
Session Cookie Set (HTTP-only)
    ↓
User Metadata + JWT Token
    ↓
Client Receives User Data
```

### Base URL

```
http://localhost:4001/api/auth/
https://your-domain.com/api/auth/  (Production)
```

---

## Endpoints

### 1. Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticates a user with email and password, creating a server-side session.

**File Location:** `app/api/auth/login/route.ts:19`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "admin@example.com",
      "user_metadata": {
        "is_qr_superadmin": 1,
        "is_qr_admin": 1,
        "is_qr_member": 0,
        "name": "John Doe"
      }
    },
    "session": {
      "access_token": "jwt-token",
      "refresh_token": "refresh-token",
      "expires_in": 3600
    }
  }
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Invalid login credentials"
}
```

**Implementation:**
```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data }, { status: 200 });
}
```

**Key Features:**
- Server-side session creation
- HTTP-only cookies for security
- User metadata included in response
- Role-based access control (RBAC) data embedded

---

### 2. Logout

**Endpoint:** `POST /api/auth/logout`

**Description:** Terminates the current user session and clears authentication cookies.

**File Location:** `app/api/auth/logout/route.ts`

**Request:** No body required

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Implementation:**
```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
}
```

**Key Features:**
- Clears server-side session
- Removes HTTP-only cookies
- Invalidates JWT token

---

### 3. Signup (User Registration)

**Endpoint:** `POST /api/auth/signup`

**Description:** Registers a new user account with email confirmation.

**File Location:** `app/api/auth/signup/route.ts:4`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "secure_password",
  "user_metadata": {
    "is_qr_superadmin": 0,
    "is_qr_admin": 0,
    "is_qr_member": 1,
    "name": "New User"
  }
}
```

**Response (200 OK):**
```json
{
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "newuser@example.com",
      "user_metadata": {
        "is_qr_superadmin": 0,
        "is_qr_admin": 0,
        "is_qr_member": 1,
        "name": "New User"
      }
    }
  }
}
```

**Response (400 Bad Request):**
```json
{
  "error": "User already registered"
}
```

**Implementation:**
```typescript
// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const { email, password, user_metadata } = await req.json();
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: user_metadata,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data }, { status: 200 });
}
```

**Key Features:**
- Email confirmation required (Supabase setting)
- User metadata embedded during signup
- Roles assigned via metadata

**Important:** By default, Supabase sends a confirmation email. Configure email settings in your Supabase dashboard.

---

### 4. Get Current User

**Endpoint:** `GET /api/auth/getUser`

**Description:** Retrieves the currently authenticated user's data from the session.

**File Location:** `app/api/auth/getUser/route.ts`

**Request:** No body required (uses session cookie)

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid-string",
    "email": "admin@example.com",
    "user_metadata": {
      "is_qr_superadmin": 1,
      "is_qr_admin": 1,
      "is_qr_member": 0,
      "name": "John Doe"
    }
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Not authenticated"
}
```

**Implementation:**
```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ user }, { status: 200 });
}
```

**Key Features:**
- Server-side session validation
- Extracts user from HTTP-only cookie
- Used for protected route access

---

### 5. Email Confirmation

**Endpoint:** `GET /api/auth/confirm`

**Description:** Confirms user email after signup via confirmation link.

**File Location:** `app/api/auth/confirm/route.ts`

**Query Parameters:**
- `token_hash`: Email confirmation token
- `type`: Confirmation type (e.g., "signup")

**Example URL:**
```
/api/auth/confirm?token_hash=abc123&type=signup
```

**Response (200 OK):**
```json
{
  "message": "Email confirmed successfully"
}
```

**Implementation:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const supabase = createClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash: token_hash!,
    type: type as any,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.redirect("/auth?confirmed=true");
}
```

---

## User Metadata Structure

All users have metadata stored in Supabase Auth that defines their roles:

```typescript
interface UserMetadata {
  is_qr_superadmin: number; // 1 = SuperAdmin, 0 = Not SuperAdmin
  is_qr_admin: number;      // 1 = Admin, 0 = Not Admin
  is_qr_member: number;     // 1 = Member, 0 = Not Member
  name: string;             // User's display name
}
```

**Role Hierarchy:**
1. **SuperAdmin** (`is_qr_superadmin: 1`) - Full access, user management
2. **Admin** (`is_qr_admin: 1`) - Event and order management
3. **Member** (`is_qr_member: 1`) - Limited read-only access

---

## Session Management

### Server-Side Session Creation

```typescript
// utils/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
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
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}
```

### Session Validation Middleware

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  const { data: { user } } = await supabase.auth.getUser();

  // Redirect unauthenticated users to login
  if (!user && request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return response;
}
```

---

## Frontend Integration

### Using Authentication in Client Components

```typescript
// Example: Login component
"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const { data, error } = await response.json();

    if (error) {
      console.error("Login failed:", error);
      return;
    }

    // Update Zustand store
    login(data.user);
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

---

## Error Handling

### Common Error Codes

| Error Message | Status | Cause |
|--------------|--------|-------|
| `Invalid login credentials` | 400 | Wrong email or password |
| `User already registered` | 400 | Email already exists |
| `Not authenticated` | 401 | No valid session |
| `Email not confirmed` | 400 | User hasn't confirmed email |
| `Token expired` | 401 | Session token expired |

### Error Response Format

```json
{
  "error": "Detailed error message from Supabase"
}
```

---

## Security Best Practices

1. **HTTP-Only Cookies** - Session tokens stored in secure cookies (not localStorage)
2. **Server-Side Validation** - All protected routes validate session server-side
3. **HTTPS Only** - Production environment uses HTTPS for all requests
4. **Password Requirements** - Minimum 6 characters (configurable in Supabase)
5. **Rate Limiting** - Supabase provides built-in rate limiting on auth endpoints

---

## Testing

### Manual Testing with cURL

**Login:**
```bash
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

**Get Current User:**
```bash
curl -X GET http://localhost:4001/api/auth/getUser \
  -H "Cookie: sb-access-token=YOUR_SESSION_TOKEN"
```

**Logout:**
```bash
curl -X POST http://localhost:4001/api/auth/logout \
  -H "Cookie: sb-access-token=YOUR_SESSION_TOKEN"
```

---

## Related Documentation

- [Authentication Architecture](/docs/architecture/authentication.md) - Complete auth flow and RBAC
- [State Management](/docs/architecture/state-management.md) - Zustand auth store
- [User Management](/docs/features/user-management.md) - SuperAdmin user operations
- [Deployment Guide](/docs/guides/deployment-guide.md) - Production auth setup

---

**Last Updated:** December 31, 2025
