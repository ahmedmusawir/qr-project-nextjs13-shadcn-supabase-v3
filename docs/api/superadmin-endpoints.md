# SuperAdmin API Endpoints

This document describes the SuperAdmin-specific API endpoints for user management operations, including creating and deleting users with elevated privileges.

---

## Overview

The SuperAdmin API provides privileged operations for managing application users. These endpoints are protected and should only be accessible to users with `is_qr_superadmin: 1` role.

**Key Features:**
- Create new users (Admin, SuperAdmin, Member)
- Delete existing users
- Automatic user metadata synchronization
- Admin-level Supabase client usage

All SuperAdmin routes are located under `/app/api/superadmin/`.

### Base URL

```
http://localhost:4001/api/superadmin/
https://your-domain.com/api/superadmin/  (Production)
```

---

## Endpoints

### 1. Add User

**Endpoint:** `POST /api/superadmin/add-user`

**Description:** Creates a new user with specified role metadata using Supabase Admin API. This endpoint bypasses the normal signup flow and automatically confirms the user's email.

**File Location:** `app/api/superadmin/add-user/route.ts:4`

**Request Body:**
```json
{
  "email": "newadmin@example.com",
  "password": "secure_password_123",
  "user_metadata": {
    "is_qr_superadmin": 0,
    "is_qr_admin": 1,
    "is_qr_member": 0,
    "name": "Jane Smith"
  }
}
```

**User Metadata Roles:**

| Field | Value | Role |
|-------|-------|------|
| `is_qr_superadmin` | `1` | SuperAdmin (full access) |
| `is_qr_admin` | `1` | Admin (event & order management) |
| `is_qr_member` | `1` | Member (read-only access) |
| `name` | String | User's display name |

**Response (200 OK):**
```json
{
  "data": {
    "user": {
      "id": "uuid-generated-by-supabase",
      "email": "newadmin@example.com",
      "email_confirmed_at": "2025-12-31T10:00:00.000Z",
      "user_metadata": {
        "is_qr_superadmin": 0,
        "is_qr_admin": 1,
        "is_qr_member": 0,
        "name": "Jane Smith"
      },
      "created_at": "2025-12-31T10:00:00.000Z"
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

**Response (500 Internal Server Error):**
```json
{
  "error": "Failed to create user: Database connection error"
}
```

**Implementation:**
```typescript
// app/api/superadmin/add-user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin-client";

export async function POST(req: NextRequest) {
  const { email, password, user_metadata } = await req.json();
  const supabase = createAdminClient();

  try {
    // Create user using Admin API (bypasses auto-login)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata,        // Pass metadata directly
      email_confirm: true,  // Auto-confirm email
    });

    if (error) {
      console.error("Error creating user:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("CREATED USER /superadmin/add-user", data);

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    console.error("Error in /superadmin-add-user route:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

**Admin Client Setup:**
```typescript
// utils/supabase/admin-client.ts
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,  // Service role key
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
```

**Key Features:**
- **Admin API Usage** - Uses `supabase.auth.admin.createUser()` instead of regular signup
- **No Auto-Login** - User is created but not automatically logged in
- **Email Confirmation** - `email_confirm: true` skips email verification step
- **Metadata Embedding** - User roles embedded during creation

---

### 2. Delete User

**Endpoint:** `POST /api/superadmin/delete-user`

**Description:** Permanently deletes a user from Supabase Auth and the `ghl_qr_users` table.

**File Location:** `app/api/superadmin/delete-user/route.ts`

**Request Body:**
```json
{
  "userId": "uuid-of-user-to-delete"
}
```

**Response (200 OK):**
```json
{
  "message": "User deleted successfully",
  "data": {
    "user": {
      "id": "uuid-of-deleted-user",
      "email": "deleted@example.com"
    }
  }
}
```

**Response (400 Bad Request):**
```json
{
  "error": "User not found"
}
```

**Response (500 Internal Server Error):**
```json
{
  "error": "Failed to delete user: Database error"
}
```

**Implementation:**
```typescript
// app/api/superadmin/delete-user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin-client";

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  const supabase = createAdminClient();

  try {
    // Delete user from Supabase Auth
    const { data, error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error("Error deleting user:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Delete from ghl_qr_users table
    const { error: dbError } = await supabase
      .from("ghl_qr_users")
      .delete()
      .eq("id", userId);

    if (dbError) {
      console.error("Error deleting user from database:", dbError.message);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    console.log("DELETED USER /superadmin/delete-user", data);

    return NextResponse.json({
      message: "User deleted successfully",
      data,
    }, { status: 200 });
  } catch (err: any) {
    console.error("Error in /superadmin/delete-user route:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

**Key Features:**
- **Two-Step Deletion** - Deletes from both Supabase Auth and `ghl_qr_users` table
- **Admin API Usage** - Uses service role key for privileged operations
- **Error Handling** - Returns specific error messages for debugging

---

## User Metadata Structure

All users created via SuperAdmin endpoints have the following metadata:

```typescript
interface UserMetadata {
  is_qr_superadmin: number;  // 1 = SuperAdmin, 0 = Not SuperAdmin
  is_qr_admin: number;       // 1 = Admin, 0 = Not Admin
  is_qr_member: number;      // 1 = Member, 0 = Not Member
  name: string;              // User's display name
}
```

### Role Examples

**SuperAdmin:**
```json
{
  "is_qr_superadmin": 1,
  "is_qr_admin": 1,
  "is_qr_member": 0,
  "name": "Super Admin User"
}
```

**Admin:**
```json
{
  "is_qr_superadmin": 0,
  "is_qr_admin": 1,
  "is_qr_member": 0,
  "name": "Admin User"
}
```

**Member:**
```json
{
  "is_qr_superadmin": 0,
  "is_qr_admin": 0,
  "is_qr_member": 1,
  "name": "Member User"
}
```

---

## Database Synchronization

After user creation, the user is also added to the `ghl_qr_users` table:

```sql
-- ghl_qr_users table structure
CREATE TABLE ghl_qr_users (
  id UUID PRIMARY KEY,              -- Matches Supabase Auth user ID
  name TEXT,
  email TEXT UNIQUE,
  type TEXT,                        -- 'Admin' or 'Super Admin'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Automatic Sync (via Supabase Trigger):**
```sql
-- Trigger to sync Supabase Auth users to ghl_qr_users
CREATE OR REPLACE FUNCTION sync_auth_user_to_qr_users()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ghl_qr_users (id, name, email, type)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    CASE
      WHEN (NEW.raw_user_meta_data->>'is_qr_superadmin')::int = 1 THEN 'Super Admin'
      WHEN (NEW.raw_user_meta_data->>'is_qr_admin')::int = 1 THEN 'Admin'
      ELSE 'Member'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    type = EXCLUDED.type;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_to_qr_users();
```

---

## Frontend Integration

### Add User Form

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddUserForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "admin", // 'superadmin', 'admin', or 'member'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare user metadata based on role
    const user_metadata = {
      is_qr_superadmin: formData.role === "superadmin" ? 1 : 0,
      is_qr_admin: formData.role === "admin" || formData.role === "superadmin" ? 1 : 0,
      is_qr_member: formData.role === "member" ? 1 : 0,
      name: formData.name,
    };

    const response = await fetch("/api/superadmin/add-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        user_metadata,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      alert("User created successfully!");
      console.log("Created user:", result.data);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <Input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <Input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <select
        value={formData.role}
        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
      >
        <option value="member">Member</option>
        <option value="admin">Admin</option>
        <option value="superadmin">SuperAdmin</option>
      </select>
      <Button type="submit">Create User</Button>
    </form>
  );
}
```

### Delete User Button

```typescript
"use client";

import { Button } from "@/components/ui/button";

export default function DeleteUserButton({ userId }: { userId: string }) {
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    const response = await fetch("/api/superadmin/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const result = await response.json();

    if (response.ok) {
      alert("User deleted successfully!");
      window.location.reload();
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  return (
    <Button variant="destructive" onClick={handleDelete}>
      Delete User
    </Button>
  );
}
```

---

## QR App User Management Endpoints

In addition to the SuperAdmin endpoints, there are internal user management endpoints under `/api/qrapp/users/`:

### 3. QR App - Add User

**Endpoint:** `POST /api/qrapp/users/add-user`

**Description:** Alternative user creation endpoint (may have different permissions or logic).

**File Location:** `app/api/qrapp/users/add-user/route.ts`

---

### 4. QR App - Delete User

**Endpoint:** `POST /api/qrapp/users/delete-user`

**Description:** Alternative user deletion endpoint.

**File Location:** `app/api/qrapp/users/delete-user/route.ts`

**Note:** These endpoints may be wrappers or have different access controls compared to `/api/superadmin/` endpoints.

---

## Security Considerations

### 1. Route Protection

SuperAdmin endpoints should be protected using middleware or HOCs:

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  const { data: { user } } = await supabase.auth.getUser();

  // Protect SuperAdmin routes
  if (request.nextUrl.pathname.startsWith("/api/superadmin")) {
    if (!user || user.user_metadata.is_qr_superadmin !== 1) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }
  }

  return response;
}
```

### 2. Service Role Key Security

**NEVER expose the service role key to the client:**

```bash
# .env.local (Server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # NEVER send to client
```

### 3. Password Requirements

Enforce strong passwords:

```typescript
// Validation before API call
const validatePassword = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
};
```

---

## Error Handling

### Common Errors

| Error Message | Status | Cause |
|--------------|--------|-------|
| `User already registered` | 400 | Email already exists in Supabase Auth |
| `User not found` | 400 | Invalid user ID for deletion |
| `Unauthorized` | 403 | Non-SuperAdmin user attempting access |
| `Database connection error` | 500 | Supabase connection issue |
| `Missing required fields` | 400 | Incomplete request body |

### Error Logging

```typescript
console.error("Error in SuperAdmin operation:", {
  operation: "add-user",
  error: error.message,
  email: email,
  timestamp: new Date().toISOString(),
});
```

---

## Testing

### Add User

```bash
curl -X POST http://localhost:4001/api/superadmin/add-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testadmin@example.com",
    "password": "SecurePass123",
    "user_metadata": {
      "is_qr_superadmin": 0,
      "is_qr_admin": 1,
      "is_qr_member": 0,
      "name": "Test Admin"
    }
  }'
```

### Delete User

```bash
curl -X POST http://localhost:4001/api/superadmin/delete-user \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "uuid-to-delete"
  }'
```

---

## Related Documentation

- [Authentication Endpoints](/docs/api/auth-endpoints.md) - Regular user authentication
- [Authentication Architecture](/docs/architecture/authentication.md) - RBAC and auth flow
- [User Management](/docs/features/user-management.md) - User management features
- [SuperAdmin Workflows](/docs/user-flows/superadmin-workflows.md) - Complete workflows

---

**Last Updated:** December 31, 2025
