# User Management

This document describes the user management system in QR Project V3, including role-based access control (RBAC), user creation, deletion, and the SuperAdmin portal.

---

## Overview

The User Management feature provides SuperAdmins with complete control over application users. It supports creating users with specific roles (SuperAdmin, Admin, Member), deleting users, and managing user metadata.

### Key Features

- **Role-Based Access Control** - Three role levels (SuperAdmin, Admin, Member)
- **User Creation** - Create users with predefined roles
- **User Deletion** - Remove users from the system
- **Metadata Management** - Store user roles in Supabase Auth metadata
- **Dual Storage** - Users stored in both Supabase Auth and custom table
- **Auto-Confirmation** - Email verification skipped for admin-created users

---

## Role Hierarchy

```
┌──────────────────┐
│   SuperAdmin     │ ← Full access, user management
└────────┬─────────┘
         │
    ┌────▼─────┐
    │  Admin   │ ← Event & order management
    └────┬─────┘
         │
    ┌────▼─────┐
    │  Member  │ ← Read-only access
    └──────────┘
```

### Role Permissions

| Feature | SuperAdmin | Admin | Member |
|---------|-----------|-------|--------|
| Create/Delete Users | ✅ | ❌ | ❌ |
| Manage Events | ✅ | ✅ | ❌ |
| Validate Tickets | ✅ | ✅ | ❌ |
| Sync Orders | ✅ | ✅ | ❌ |
| View Orders | ✅ | ✅ | ✅ |
| View Events | ✅ | ✅ | ✅ |

---

## User Metadata Structure

All users have role metadata stored in Supabase Auth:

```typescript
interface UserMetadata {
  is_qr_superadmin: number;  // 1 = SuperAdmin, 0 = Not
  is_qr_admin: number;       // 1 = Admin, 0 = Not
  is_qr_member: number;      // 1 = Member, 0 = Not
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
  "name": "John SuperAdmin"
}
```

**Admin:**
```json
{
  "is_qr_superadmin": 0,
  "is_qr_admin": 1,
  "is_qr_member": 0,
  "name": "Jane Admin"
}
```

**Member:**
```json
{
  "is_qr_superadmin": 0,
  "is_qr_admin": 0,
  "is_qr_member": 1,
  "name": "Bob Member"
}
```

---

## Database Storage

### Supabase Auth

Primary user authentication data is stored in Supabase Auth:

```sql
-- auth.users table (managed by Supabase)
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  encrypted_password TEXT,
  email_confirmed_at TIMESTAMPTZ,
  raw_user_meta_data JSONB,  -- Contains role metadata
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Custom User Table

Additional user data is mirrored in `ghl_qr_users`:

```sql
CREATE TABLE ghl_qr_users (
  id UUID PRIMARY KEY,          -- Matches Supabase Auth user ID
  name TEXT,
  email TEXT UNIQUE,
  type TEXT,                    -- 'Super Admin', 'Admin', or 'Member'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:**
- Easier user listing (no need for Admin API in queries)
- Additional user fields if needed
- Backup user data reference

---

## Creating Users

### SuperAdmin API Endpoint

**Endpoint:** `POST /api/superadmin/add-user`

**File Location:** `app/api/superadmin/add-user/route.ts:4`

**Request:**
```json
{
  "email": "newadmin@example.com",
  "password": "SecurePassword123",
  "user_metadata": {
    "is_qr_superadmin": 0,
    "is_qr_admin": 1,
    "is_qr_member": 0,
    "name": "New Admin User"
  }
}
```

**Implementation:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin-client";

export async function POST(req: NextRequest) {
  const { email, password, user_metadata } = await req.json();
  const supabase = createAdminClient();

  try {
    // Create user using Admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata,        // Roles embedded here
      email_confirm: true,  // Skip email verification
    });

    if (error) {
      console.error("Error creating user:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("CREATED USER:", data);

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    console.error("Error in /superadmin/add-user route:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": "uuid-generated",
      "email": "newadmin@example.com",
      "email_confirmed_at": "2025-12-31T10:00:00.000Z",
      "user_metadata": {
        "is_qr_superadmin": 0,
        "is_qr_admin": 1,
        "is_qr_member": 0,
        "name": "New Admin User"
      },
      "created_at": "2025-12-31T10:00:00.000Z"
    }
  }
}
```

---

## Admin Client Setup

**File Location:** `utils/supabase/admin-client.ts`

```typescript
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

**Environment Variable:**
```bash
# .env.local
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # NEVER expose to client
```

---

## SuperAdmin Add User Form

**File Location:** `components/superadmin/AddUserForm.tsx` (example)

![SuperAdmin Add User Form](../images/superadmin-add-user-form.png)

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export default function AddUserForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "admin",  // 'superadmin', 'admin', or 'member'
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
      // Reset form
      setFormData({ email: "", password: "", name: "", role: "admin" });
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="user@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Secure password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full border rounded p-2"
        >
          <option value="member">Member (Read-only)</option>
          <option value="admin">Admin (Manage events)</option>
          <option value="superadmin">SuperAdmin (Full access)</option>
        </select>
      </div>

      <Button type="submit" className="w-full">
        Create User
      </Button>
    </form>
  );
}
```

---

## Deleting Users

### SuperAdmin Delete Endpoint

**Endpoint:** `POST /api/superadmin/delete-user`

**File Location:** `app/api/superadmin/delete-user/route.ts`

**Request:**
```json
{
  "userId": "uuid-of-user-to-delete"
}
```

**Implementation:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin-client";

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  const supabase = createAdminClient();

  try {
    // Delete from Supabase Auth
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

    console.log("DELETED USER:", data);

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

**Response:**
```json
{
  "message": "User deleted successfully",
  "data": {
    "user": {
      "id": "uuid-deleted",
      "email": "deleted@example.com"
    }
  }
}
```

---

## Delete User Component

```typescript
"use client";

import { Button } from "@/components/ui/button";

export default function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete user: ${userName}?`)) {
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

## User Listing

### Get All Users

```typescript
const fetchAllUsers = async () => {
  const supabase = createClient();

  const { data: users, error } = await supabase
    .from("ghl_qr_users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return users;
};
```

### User Dashboard Component

![SuperAdmin User Dashboard](../images/superadmin-user-dashboard.png)

```typescript
"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  type: string;
  created_at: string;
}

export default function UserDashboard() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      const fetchedUsers = await fetchAllUsers();
      setUsers(fetchedUsers);
    };

    loadUsers();
  }, []);

  return (
    <div>
      <h1>User Management</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.type}</td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
              <td>
                <DeleteUserButton userId={user.id} userName={user.name} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Database Synchronization

### Automatic Sync via Trigger

Create a Supabase trigger to automatically sync users to `ghl_qr_users`:

```sql
-- Function to sync auth user to ghl_qr_users
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

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_to_qr_users();
```

---

## Route Protection

### Middleware Protection

**File Location:** `middleware.ts`

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  const { data: { user } } = await supabase.auth.getUser();

  // Protect SuperAdmin routes
  if (request.nextUrl.pathname.startsWith("/superadmin")) {
    if (!user || user.user_metadata.is_qr_superadmin !== 1) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  // Protect Admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user || user.user_metadata.is_qr_admin !== 1) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/superadmin/:path*", "/admin/:path*"],
};
```

---

## Security Best Practices

### 1. Service Role Key Security

**NEVER expose the service role key to the client:**

```bash
# .env.local (Server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-only
```

### 2. Password Requirements

Enforce strong passwords:

```typescript
const validatePassword = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
};
```

### 3. Role Validation

Always validate roles server-side:

```typescript
const isAuthorized = (user: User, requiredRole: string): boolean => {
  if (requiredRole === "superadmin") {
    return user.user_metadata.is_qr_superadmin === 1;
  }
  if (requiredRole === "admin") {
    return user.user_metadata.is_qr_admin === 1;
  }
  return false;
};
```

---

## Related Documentation

- [SuperAdmin Endpoints](/docs/api/superadmin-endpoints.md) - User management APIs
- [Authentication](/docs/architecture/authentication.md) - RBAC and auth flow
- [SuperAdmin Workflows](/docs/user-flows/superadmin-workflows.md) - User management workflows
- [Authentication Endpoints](/docs/api/auth-endpoints.md) - User authentication

---

**Last Updated:** December 31, 2025
