# SuperAdmin Portal UI

This document describes the SuperAdmin Portal user interface, including user management pages, components, and UI patterns specific to SuperAdmin role.

---

## Overview

The SuperAdmin Portal provides complete user management functionality exclusively for users with the **SuperAdmin** role.

### Key Features

- View all users in the system
- Add new users with role assignment
- Delete users (except SuperAdmin users)
- View user profiles and roles
- Protected routes with strict RBAC
- Responsive design for mobile and desktop

### Access Control

- **Route Group**: `(superadmin)`
- **Allowed Roles**: SuperAdmin only
- **Protection**: HOC at layout level (`withRoleCheck`)
- **Redirect**: Unauthorized users redirected to `/superadmin-login`

---

## SuperAdmin Portal Pages

### 1. User Dashboard

**Route**: `/user-dashboard`
**File**: `app/(superadmin)/user-dashboard/page.tsx`

![SuperAdmin User Dashboard](../images/superadmin-user-dashboard.png)

#### UI Structure

```typescript
"use client";

import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  is_qr_superadmin: number;
  is_qr_admin: number;
  is_qr_member: number;
  created_at: string;
}

export default function UserDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const response = await fetch("/api/superadmin/get-users");
    const { users } = await response.json();
    setUsers(users);
    setIsLoading(false);
  };

  const handleDeleteUser = async () => {
    if (!selectedUserId) return;

    await fetch("/api/superadmin/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUserId }),
    });

    setIsDeleteDialogOpen(false);
    setSelectedUserId(null);
    fetchUsers();
  };

  const openDeleteDialog = (userId: string) => {
    setSelectedUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="p-2 sm:p-10">
      {/* Page Header */}
      <div className="border-b-4 border-red-500 mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-center py-4">
          User Management Dashboard
        </h1>
      </div>

      {/* Add User Button */}
      <div className="mb-6 flex justify-end">
        <Link href="/user-dashboard/add-user">
          <Button className="bg-green-600 hover:bg-green-500">
            Add New User
          </Button>
        </Link>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <Table>
          <TableHeader className="border-b-4 border-red-500">
            <TableRow>
              <TableHead className="font-bold text-sm sm:text-xl">Email</TableHead>
              <TableHead className="font-bold text-sm sm:text-xl">Roles</TableHead>
              <TableHead className="font-bold text-sm sm:text-xl">Created At</TableHead>
              <TableHead className="font-bold text-sm sm:text-xl text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-slate-50">
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>
                  <div className="flex gap-2 flex-wrap">
                    {user.is_qr_superadmin === 1 && (
                      <Badge className="bg-purple-500 text-white">SuperAdmin</Badge>
                    )}
                    {user.is_qr_admin === 1 && (
                      <Badge className="bg-blue-500 text-white">Admin</Badge>
                    )}
                    {user.is_qr_member === 1 && (
                      <Badge className="bg-green-500 text-white">Member</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Link href={`/user-dashboard/${user.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    {user.is_qr_superadmin !== 1 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(user.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <h3 className="text-lg font-bold">Confirm User Deletion</h3>
          </DialogHeader>
          <DialogTitle>
            <h1 className="text-red-500">
              Are you sure you want to delete this user? This action cannot be undone.
            </h1>
          </DialogTitle>
          <DialogFooter className="space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

### 2. Add User Page

**Route**: `/user-dashboard/add-user`
**File**: `app/(superadmin)/user-dashboard/add-user/page.tsx`

![SuperAdmin Add User Form](../images/superadmin-add-user-form.png)

#### UI Structure

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/common/BackButton";

export default function AddUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    is_qr_superadmin: false,
    is_qr_admin: false,
    is_qr_member: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation: At least one role must be selected
    if (!formData.is_qr_superadmin && !formData.is_qr_admin && !formData.is_qr_member) {
      setError("Please select at least one role");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/superadmin/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          is_qr_superadmin: formData.is_qr_superadmin ? 1 : 0,
          is_qr_admin: formData.is_qr_admin ? 1 : 0,
          is_qr_member: formData.is_qr_member ? 1 : 0,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/user-dashboard");
      } else {
        setError(data.error || "Failed to create user");
      }
    } catch (err) {
      setError("An error occurred while creating the user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-2 sm:p-10">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold">Add New User</h1>
        <BackButton text="Back to Dashboard" />
      </div>

      {/* Add User Form */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              <p className="text-sm text-slate-500">
                Password must be at least 8 characters long
              </p>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label>Assign Roles (select at least one)</Label>

              <div className="space-y-2">
                {/* SuperAdmin Checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="superadmin"
                    checked={formData.is_qr_superadmin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_qr_superadmin: e.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="superadmin" className="font-normal cursor-pointer">
                    SuperAdmin (Full system access, user management)
                  </Label>
                </div>

                {/* Admin Checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="admin"
                    checked={formData.is_qr_admin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_qr_admin: e.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="admin" className="font-normal cursor-pointer">
                    Admin (Manage events, orders, tickets)
                  </Label>
                </div>

                {/* Member Checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="member"
                    checked={formData.is_qr_member}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_qr_member: e.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="member" className="font-normal cursor-pointer">
                    Member (View-only access)
                  </Label>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### 3. User Profile View (SuperAdmin)

**Route**: `/user-dashboard/[userId]`
**File**: `app/(superadmin)/user-dashboard/[userId]/page.tsx`

![SuperAdmin User Profile](../images/superadmin-user-profile.png)

#### UI Structure

```typescript
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/common/BackButton";
import Spinner from "@/components/common/Spinner";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  is_qr_superadmin: number;
  is_qr_admin: number;
  is_qr_member: number;
  created_at: string;
}

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    const response = await fetch("/api/superadmin/get-users");
    const { users } = await response.json();
    const foundUser = users.find((u: User) => u.id === userId);
    setUser(foundUser || null);
    setIsLoading(false);
  };

  if (isLoading) return <Spinner />;
  if (!user) {
    return (
      <div className="p-10 text-center">
        <p className="text-xl text-red-500">User not found</p>
        <BackButton text="Back to Dashboard" />
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-10">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold">User Profile</h1>
        <BackButton text="Back to Dashboard" />
      </div>

      {/* User Profile Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Details */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Email Address</p>
              <p className="font-semibold text-lg">{user.email}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">User ID</p>
              <p className="font-medium">{user.id}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500 mb-2">Assigned Roles</p>
              <div className="flex gap-2 flex-wrap">
                {user.is_qr_superadmin === 1 && (
                  <Badge className="bg-purple-500 text-white text-sm px-3 py-1">
                    SuperAdmin
                  </Badge>
                )}
                {user.is_qr_admin === 1 && (
                  <Badge className="bg-blue-500 text-white text-sm px-3 py-1">
                    Admin
                  </Badge>
                )}
                {user.is_qr_member === 1 && (
                  <Badge className="bg-green-500 text-white text-sm px-3 py-1">
                    Member
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-500">Account Created</p>
              <p className="font-medium">
                {new Date(user.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Role Descriptions */}
          <div className="border-t pt-4 space-y-2">
            <h3 className="font-semibold text-slate-700">Role Permissions</h3>
            {user.is_qr_superadmin === 1 && (
              <p className="text-sm text-slate-600">
                <span className="font-medium">SuperAdmin:</span> Full system access
                including user management
              </p>
            )}
            {user.is_qr_admin === 1 && (
              <p className="text-sm text-slate-600">
                <span className="font-medium">Admin:</span> Manage events, orders,
                and tickets
              </p>
            )}
            {user.is_qr_member === 1 && (
              <p className="text-sm text-slate-600">
                <span className="font-medium">Member:</span> View-only access to
                events and orders
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Layout and Protection

### SuperAdmin Layout

**File**: `app/(superadmin)/layout.tsx`

```typescript
import { withRoleCheck } from "@/hoc/withRoleCheck";

function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <main>{children}</main>
    </div>
  );
}

export default withRoleCheck(SuperAdminLayout, {
  allowedRoles: ["is_qr_superadmin"],
  redirectTo: "/superadmin-login",
});
```

---

## UI Patterns

### Role Badge Pattern

```typescript
// Dynamic role badges
<div className="flex gap-2 flex-wrap">
  {user.is_qr_superadmin === 1 && (
    <Badge className="bg-purple-500 text-white">SuperAdmin</Badge>
  )}
  {user.is_qr_admin === 1 && (
    <Badge className="bg-blue-500 text-white">Admin</Badge>
  )}
  {user.is_qr_member === 1 && (
    <Badge className="bg-green-500 text-white">Member</Badge>
  )}
</div>
```

### Checkbox Group Pattern

```typescript
<div className="space-y-2">
  <div className="flex items-center space-x-2">
    <input
      type="checkbox"
      id="role"
      checked={isChecked}
      onChange={(e) => handleChange(e.target.checked)}
      className="h-4 w-4"
    />
    <Label htmlFor="role" className="font-normal cursor-pointer">
      Role Description
    </Label>
  </div>
</div>
```

### Delete Confirmation Pattern

```typescript
<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
  <DialogContent className="bg-white">
    <DialogHeader>
      <h3 className="text-lg font-bold">Confirm User Deletion</h3>
    </DialogHeader>
    <DialogTitle>
      <h1 className="text-red-500">
        Are you sure? This action cannot be undone.
      </h1>
    </DialogTitle>
    <DialogFooter className="space-x-3">
      <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        Delete User
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Action Buttons Pattern

```typescript
<div className="flex justify-center gap-2">
  <Link href={`/user-dashboard/${user.id}`}>
    <Button variant="outline" size="sm">
      View
    </Button>
  </Link>
  {user.is_qr_superadmin !== 1 && (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => handleDelete(user.id)}
    >
      Delete
    </Button>
  )}
</div>
```

---

## Form Validation

### Client-Side Validation

```typescript
// Role validation
if (!formData.is_qr_superadmin && !formData.is_qr_admin && !formData.is_qr_member) {
  setError("Please select at least one role");
  return;
}

// Email validation (handled by input type="email")
<Input
  type="email"
  required
/>

// Password validation
<Input
  type="password"
  minLength={8}
  required
/>
```

### Error Display

```typescript
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
    {error}
  </div>
)}
```

---

## Security Features

### SuperAdmin Protection

```typescript
// Only SuperAdmins can delete users
{user.is_qr_superadmin !== 1 && (
  <Button variant="destructive" onClick={() => handleDelete(user.id)}>
    Delete
  </Button>
)}
```

### Route Protection

- All routes wrapped with `withRoleCheck` HOC
- Only `is_qr_superadmin` role allowed
- Automatic redirect on unauthorized access

---

## Responsive Design

```typescript
// Responsive padding
<div className="p-2 sm:p-10">

// Responsive text
<h1 className="text-2xl sm:text-4xl font-extrabold">

// Responsive table headers
<TableHead className="font-bold text-sm sm:text-xl">

// Responsive badge wrapping
<div className="flex gap-2 flex-wrap">
```

---

## Related Documentation

- [Component Library](/docs/ui-components/component-library.md) - Shadcn components
- [Design System](/docs/ui-components/design-system.md) - Colors, typography, spacing
- [User Management](/docs/features/user-management.md) - User management feature
- [SuperAdmin Workflows](/docs/user-flows/superadmin-workflows.md) - SuperAdmin user flows

---

**Last Updated:** December 31, 2025
