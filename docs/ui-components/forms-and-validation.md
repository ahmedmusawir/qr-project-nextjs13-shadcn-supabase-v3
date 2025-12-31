# Forms and Validation

This document describes form patterns, validation strategies, and best practices used in the QR Project V3.

---

## Overview

The application uses a combination of **React state management** and **client-side validation** for forms. While React Hook Form and Zod are installed, most forms use controlled components with manual validation.

### Form Libraries

- **React useState** - Primary form state management
- **React Hook Form** - Available but not widely used
- **Zod** - Schema validation library
- **Shadcn UI** - Form components (Input, Label, Button, etc.)

---

## Form Patterns

### 1. Controlled Component Pattern

**Most Common Pattern** - Used throughout the application

```typescript
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Submit form
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success handling
        router.push("/admin-portal");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}
```

---

### 2. Multi-Field Form Pattern

**Used In**: Add User Form, Profile Updates

```typescript
"use client";

import { useState } from "react";

interface FormData {
  email: string;
  password: string;
  is_qr_superadmin: boolean;
  is_qr_admin: boolean;
  is_qr_member: boolean;
}

export default function AddUserForm() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    is_qr_superadmin: false,
    is_qr_admin: false,
    is_qr_member: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation: At least one role must be selected
    if (!formData.is_qr_superadmin && !formData.is_qr_admin && !formData.is_qr_member) {
      setError("Please select at least one role");
      return;
    }

    setIsLoading(true);

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
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
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
      </div>

      {/* Role Checkboxes */}
      <div className="space-y-3">
        <Label>Assign Roles</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="superadmin"
              checked={formData.is_qr_superadmin}
              onChange={(e) =>
                setFormData({ ...formData, is_qr_superadmin: e.target.checked })
              }
            />
            <Label htmlFor="superadmin">SuperAdmin</Label>
          </div>
          {/* Additional checkboxes... */}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create User"}
      </Button>
    </form>
  );
}
```

---

## Validation Patterns

### 1. HTML5 Validation

**Built-in browser validation**

```typescript
<Input
  type="email"         // Email format validation
  required             // Required field
  minLength={8}        // Minimum length
  maxLength={100}      // Maximum length
  pattern="[a-z0-9]+"  // Custom regex pattern
/>
```

### 2. Client-Side Validation

**Manual JavaScript validation**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  // Email validation
  if (!email.includes("@")) {
    setError("Please enter a valid email address");
    return;
  }

  // Password length validation
  if (password.length < 8) {
    setError("Password must be at least 8 characters long");
    return;
  }

  // Role selection validation
  if (!is_qr_superadmin && !is_qr_admin && !is_qr_member) {
    setError("Please select at least one role");
    return;
  }

  // Submit form
  await submitForm();
};
```

### 3. Server-Side Validation

**API route validation**

```typescript
// app/api/superadmin/add-user/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password, is_qr_superadmin, is_qr_admin, is_qr_member } = await req.json();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 }
    );
  }

  // Validate password length
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters long" },
      { status: 400 }
    );
  }

  // Validate at least one role
  if (is_qr_superadmin !== 1 && is_qr_admin !== 1 && is_qr_member !== 1) {
    return NextResponse.json(
      { error: "At least one role must be assigned" },
      { status: 400 }
    );
  }

  // Process form
  // ...
}
```

---

## Form Components

### 1. Login Form

**File**: `app/(auth)/admin-login/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      router.push("/admin-portal");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-extrabold text-center">Admin Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
```

---

### 2. Search Form

**File**: `app/(admin)/orders/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);

  const filteredOrders = orders.filter((order) =>
    order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Search Input */}
      <div className="mb-6 max-w-md">
        <Input
          type="text"
          placeholder="Search by Order ID or Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Filtered Results */}
      <Table>
        {/* Table content with filteredOrders */}
      </Table>
    </div>
  );
}
```

---

### 3. Bulk Action Form

**File**: `components/admin/single-order-page/TicketTable.tsx`

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TicketTable({ orderId }: { orderId: string }) {
  const [tickets, setTickets] = useState([]);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  const toggleTicketSelection = (ticketId: string) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleValidateSelected = async () => {
    await fetch("/api/qrapp/tickets/validate-bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketIds: selectedTickets }),
    });

    setSelectedTickets([]);
    fetchTickets();
  };

  return (
    <div>
      {/* Bulk Action Bar */}
      {selectedTickets.length > 0 && (
        <div className="mb-4 flex justify-between items-center bg-slate-100 p-4 rounded">
          <p className="font-semibold">
            {selectedTickets.length} ticket(s) selected
          </p>
          <Button onClick={handleValidateSelected}>
            Validate Selected
          </Button>
        </div>
      )}

      {/* Ticket Checkboxes */}
      <Table>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.ticket_id}>
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedTickets.includes(ticket.ticket_id)}
                  onChange={() => toggleTicketSelection(ticket.ticket_id)}
                  disabled={ticket.status === "validated"}
                />
              </TableCell>
              {/* Other columns */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

---

## Error Handling

### 1. Inline Error Display

```typescript
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
    {error}
  </div>
)}
```

### 2. Field-Level Error Display

```typescript
const [errors, setErrors] = useState({
  email: "",
  password: "",
});

// Validation
if (!email.includes("@")) {
  setErrors({ ...errors, email: "Invalid email format" });
}

// Display
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className={errors.email ? "border-red-500" : ""}
  />
  {errors.email && (
    <p className="text-sm text-red-500">{errors.email}</p>
  )}
</div>
```

### 3. Toast Notifications

```typescript
import { toast } from "sonner";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    await submitForm();
    toast.success("User created successfully!");
  } catch (error) {
    toast.error("Failed to create user");
  }
};
```

---

## Form State Management

### 1. Single Field State

```typescript
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
```

### 2. Object State

```typescript
const [formData, setFormData] = useState({
  email: "",
  password: "",
  confirmPassword: "",
});

// Update single field
setFormData({ ...formData, email: e.target.value });
```

### 3. Loading State

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    await submitForm();
  } finally {
    setIsLoading(false);
  }
};

// Disable button during loading
<Button type="submit" disabled={isLoading}>
  {isLoading ? "Submitting..." : "Submit"}
</Button>
```

---

## Form Styling

### 1. Form Container

```typescript
<form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
  {/* Form fields */}
</form>
```

### 2. Form Field Wrapper

```typescript
<div className="space-y-2">
  <Label htmlFor="field">Field Label</Label>
  <Input
    id="field"
    type="text"
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />
  <p className="text-sm text-slate-500">Helper text</p>
</div>
```

### 3. Form Actions

```typescript
<div className="flex justify-end space-x-3 mt-6">
  <Button type="button" variant="outline" onClick={() => router.back()}>
    Cancel
  </Button>
  <Button type="submit" disabled={isLoading}>
    Submit
  </Button>
</div>
```

---

## Best Practices

### 1. Always Prevent Default

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault(); // Always prevent form submission
  // Handle form logic
};
```

### 2. Clear Errors on New Submission

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(""); // Clear previous errors
  // Submit form
};
```

### 3. Disable Submit During Loading

```typescript
<Button type="submit" disabled={isLoading}>
  {isLoading ? "Loading..." : "Submit"}
</Button>
```

### 4. Provide User Feedback

```typescript
// Show loading state
{isLoading && <Spinner />}

// Show error state
{error && <ErrorMessage error={error} />}

// Show success state
{success && <SuccessMessage message="Form submitted!" />}
```

### 5. Use Accessible Labels

```typescript
<Label htmlFor="email">Email Address</Label>
<Input
  id="email"
  type="email"
  aria-label="Email address"
  aria-required="true"
/>
```

---

## Common Form Patterns

### Login/Signup Form

- Email + Password fields
- Error display
- Loading state
- Redirect on success

### Add/Edit User Form

- Multiple input fields
- Checkbox group for roles
- Validation before submit
- Cancel and Submit actions

### Search Form

- Single input field
- Real-time filtering
- No submit button (live search)

### Bulk Action Form

- Checkbox selection
- Bulk action button
- Confirmation dialog
- Success feedback

---

## Related Documentation

- [Component Library](/docs/ui-components/component-library.md) - Form components
- [Design System](/docs/ui-components/design-system.md) - Form styling
- [Authentication](/docs/architecture/authentication.md) - Login forms
- [User Management](/docs/features/user-management.md) - User forms

---

**Last Updated:** December 31, 2025
