# Component Library

This document provides an overview of the UI component library used in QR Project V3, including Shadcn UI components, custom components, and component organization.

---

## Overview

The QR Project V3 uses **Shadcn UI** as its primary component library. Shadcn UI is built on top of **Radix UI** primitives and styled with **Tailwind CSS**, providing a collection of accessible, customizable components.

### Tech Stack

- **Shadcn UI** - Component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Tailwind CSS** - Utility-first styling framework
- **Class Variance Authority (CVA)** - Component variant management
- **clsx** - Conditional class name utility

---

## Shadcn UI Components

### Installed Components

The following Shadcn components are installed in the project:

| Component | Description | Usage |
|-----------|-------------|-------|
| **Button** | Primary action component | Forms, CTAs, navigation |
| **Input** | Text input field | Forms, search |
| **Label** | Form field labels | Accessibility |
| **Table** | Data table component | Order lists, ticket tables |
| **Badge** | Status indicators | Ticket status, payment status |
| **Dialog** | Modal dialogs | Confirmations, forms |
| **Card** | Content containers | Dashboard cards, info blocks |
| **Select** | Dropdown selection | Role selection, filters |
| **Textarea** | Multi-line text input | Comments, descriptions |
| **Toast** | Notification messages | Success/error feedback |
| **Spinner** | Loading indicator | Data fetching states |

### Component Location

```
components/
├── ui/                    # Shadcn UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── table.tsx
│   ├── badge.tsx
│   ├── dialog.tsx
│   ├── card.tsx
│   ├── select.tsx
│   ├── textarea.tsx
│   └── toast.tsx
├── common/                # Custom reusable components
│   ├── Spinner.tsx
│   ├── BackButton.tsx
│   └── ...
└── [feature]/             # Feature-specific components
    ├── admin/
    ├── superadmin/
    └── auth/
```

---

## Button Component

**File Location:** `components/ui/button.tsx`

### Variants

```typescript
import { Button } from "@/components/ui/button";

// Default variant
<Button>Click Me</Button>

// Destructive variant (red)
<Button variant="destructive">Delete</Button>

// Outline variant
<Button variant="outline">Cancel</Button>

// Ghost variant (transparent)
<Button variant="ghost">Link</Button>

// Secondary variant
<Button variant="secondary">Secondary Action</Button>
```

### Sizes

```typescript
// Small
<Button size="sm">Small</Button>

// Default
<Button size="default">Default</Button>

// Large
<Button size="lg">Large</Button>

// Icon only
<Button size="icon">
  <Icon />
</Button>
```

### Usage Examples

```typescript
"use client";

import { Button } from "@/components/ui/button";

export default function ActionButtons() {
  const handleSave = () => {
    console.log("Saved!");
  };

  return (
    <div className="space-x-2">
      <Button onClick={handleSave}>
        Save
      </Button>

      <Button variant="destructive" onClick={() => console.log("Delete")}>
        Delete
      </Button>

      <Button variant="outline" disabled>
        Disabled
      </Button>
    </div>
  );
}
```

---

## Input Component

**File Location:** `components/ui/input.tsx`

### Basic Input

```typescript
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
  />
</div>
```

### Controlled Input

```typescript
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function ControlledInput() {
  const [value, setValue] = useState("");

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Type here..."
    />
  );
}
```

---

## Table Component

**File Location:** `components/ui/table.tsx`

### Table Structure

```typescript
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DataTable() {
  return (
    <Table>
      <TableCaption>A list of recent orders</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>order_123</TableCell>
          <TableCell>John Doe</TableCell>
          <TableCell>$150.00</TableCell>
          <TableCell>
            <Badge>Paid</Badge>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
```

### Used In

- Order list page (`app/(admin)/orders/page.tsx`)
- Ticket validation table (`components/admin/single-order-page/TicketTable.tsx`)
- User dashboard (`app/(superadmin)/user-dashboard/page.tsx`)

---

## Badge Component

**File Location:** `components/ui/badge.tsx`

### Variants

```typescript
import { Badge } from "@/components/ui/badge";

// Default (gray)
<Badge>Default</Badge>

// Destructive (red)
<Badge variant="destructive">Error</Badge>

// Outline
<Badge variant="outline">Outline</Badge>

// Secondary
<Badge variant="secondary">Secondary</Badge>
```

### Status Badges

```typescript
export function TicketStatusBadge({ status }: { status: string }) {
  const variant = status === "live" ? "default" : "destructive";

  return (
    <Badge variant={variant}>
      {status.toUpperCase()}
    </Badge>
  );
}
```

---

## Dialog Component

**File Location:** `components/ui/dialog.tsx`

### Confirmation Dialog

```typescript
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ConfirmDialog() {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    console.log("Confirmed!");
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Open Dialog
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <h3 className="text-lg font-bold">Confirm Action</h3>
          </DialogHeader>
          <DialogTitle>
            <h1 className="text-red-500">Are you sure?</h1>
          </DialogTitle>
          <DialogFooter className="space-x-3">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Used In

- Bulk ticket validation (`components/admin/single-order-page/TicketTable.tsx:82`)
- Delete user confirmation (`app/(superadmin)/user-dashboard/`)

---

## Card Component

**File Location:** `components/ui/card.tsx`

### Card Structure

```typescript
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function InfoCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
        <CardDescription>Order details and tickets</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Total Tickets: 5</p>
        <p>Total Paid: $250.00</p>
      </CardContent>
      <CardFooter>
        <Button>View Details</Button>
      </CardFooter>
    </Card>
  );
}
```

---

## Custom Components

### Spinner Component

**File Location:** `components/common/Spinner.tsx`

```typescript
export default function Spinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
}
```

### BackButton Component

**File Location:** `components/common/BackButton.tsx`

```typescript
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function BackButton({ text = "Go Back" }: { text?: string }) {
  const router = useRouter();

  return (
    <Button variant="outline" onClick={() => router.back()}>
      {text}
    </Button>
  );
}
```

---

## Form Components

### Login Form Example

```typescript
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      router.push("/admin-portal");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full">
        Login
      </Button>
    </form>
  );
}
```

---

## Component Composition Patterns

### Compound Components

```typescript
// Order info display using multiple components
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OrderCard({ order }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>{order.event_name}</span>
          <Badge>{order.payment_status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Order ID: {order.order_id}</p>
        <p>Total: ${order.total_paid}</p>
        <p>Tickets: {order.event_ticket_qty}</p>
      </CardContent>
    </Card>
  );
}
```

---

## Styling Conventions

### Tailwind CSS Classes

```typescript
// Standard spacing
className="space-y-4"        // Vertical spacing
className="space-x-2"        // Horizontal spacing
className="p-4"              // Padding
className="mt-8"             // Margin top

// Responsive design
className="p-2 sm:p-10"      // Responsive padding
className="text-sm sm:text-xl"  // Responsive text

// Flexbox
className="flex justify-center items-center"
className="flex-col"

// Grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
```

### Component-Specific Classes

```typescript
// Button styling
className="bg-red-700 hover:bg-red-600 text-white"

// Card styling
className="border rounded-lg shadow-md p-6"

// Table styling
className="border-b-4 border-red-500"
```

---

## Accessibility

All Shadcn components include built-in accessibility features:

- **ARIA labels** on interactive elements
- **Keyboard navigation** support
- **Focus management** in dialogs and modals
- **Screen reader** compatible

### Example: Accessible Form

```typescript
<div>
  <Label htmlFor="email">
    Email Address
  </Label>
  <Input
    id="email"
    type="email"
    aria-label="Email address"
    aria-required="true"
    required
  />
</div>
```

---

## Component Testing

### Unit Test Example

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("should render button text", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("should handle click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    fireEvent.click(screen.getByText("Click Me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText("Disabled")).toBeDisabled();
  });
});
```

---

## Related Documentation

- [Design System](/docs/ui-components/design-system.md) - Colors, typography, spacing
- [Admin Portal](/docs/ui-components/admin-portal.md) - Admin UI components
- [SuperAdmin Portal](/docs/ui-components/superadmin-portal.md) - SuperAdmin UI
- [Forms and Validation](/docs/ui-components/forms-and-validation.md) - Form patterns

---

**Last Updated:** December 31, 2025
