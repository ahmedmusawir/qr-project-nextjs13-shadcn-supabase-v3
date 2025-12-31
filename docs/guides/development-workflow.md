# Development Workflow

This guide covers development practices, code organization, and common tasks for working on the QR Project V3.

---

## Project Structure Overview

```
qr-project-nextjs13-shadcn-supabase-v3/
├── app/                          # Next.js 13 App Router
│   ├── (public)/                 # Public routes (no auth required)
│   │   ├── page.tsx              # Home page
│   │   └── wp-blog/              # Blog routes
│   ├── (auth)/                   # Authentication routes
│   │   ├── auth/page.tsx         # Login/signup page
│   │   └── auth/pass-reset/      # Password reset
│   ├── (admin)/                  # Admin portal (protected)
│   │   ├── layout.tsx            # Admin layout with HOC protection
│   │   ├── admin-portal/         # Admin dashboard
│   │   ├── events/[id]/          # Single event page
│   │   ├── orders/[id]/          # Single order page
│   │   └── profile/[id]/         # User profile
│   ├── (superadmin)/             # SuperAdmin portal (protected)
│   │   ├── layout.tsx            # SuperAdmin layout with HOC protection
│   │   ├── superadmin-portal/    # SuperAdmin dashboard
│   │   └── add-user/             # Add user form
│   ├── (members)/                # Members portal (protected)
│   │   └── members-portal/       # Member dashboard
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── ghl/                  # GHL integration
│   │   ├── qrapp/                # Internal app endpoints
│   │   └── superadmin/           # SuperAdmin endpoints
│   ├── providers/                # Context providers
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── ui/                       # Shadcn UI components
│   ├── admin/                    # Admin-specific components
│   ├── superadmin/               # SuperAdmin components
│   ├── global/                   # Global components (Navbar, etc.)
│   ├── common/                   # Common reusable components
│   ├── layout/                   # Layout components
│   └── auth/                     # Auth components (LoginForm, etc.)
├── lib/                          # Utility libraries
│   └── utils.ts                  # Utility functions (cn, etc.)
├── services/                     # Service layer (API interactions)
│   ├── orderServices.ts          # Order-related API calls
│   ├── ticketServices.ts         # Ticket-related API calls
│   ├── userServices.ts           # User-related API calls
│   ├── ghlServices.ts            # GHL API interactions
│   ├── eventServices.ts          # Event services
│   └── fieldServices.ts          # Custom field services
├── store/                        # Zustand state management
│   ├── useAuthStore.ts           # Authentication state
│   ├── useGHLDataStore.ts        # GHL data state
│   └── useSyncStore.ts           # Sync status state
├── types/                        # TypeScript type definitions
│   ├── custom.d.ts               # Custom type declarations
│   └── index.ts                  # Exported types
├── utils/                        # Utility functions
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── admin-client.ts       # Admin client (service role)
│   ├── qrapp/                    # QR code helpers
│   │   └── helpers.ts            # QR generation utilities
│   └── logging/                  # Winston logger
│       └── logger.ts             # Logger configuration
├── hoc/                          # Higher-Order Components
│   ├── withAdminProtection.tsx   # Admin route protection
│   ├── withSuperAdminProtection.tsx
│   └── withMemberProtection.tsx
├── hooks/                        # Custom React hooks
├── public/                       # Static assets
│   ├── ticket_types.json         # Generated ticket types
│   ├── valid_order_list.json     # Valid order IDs
│   └── sync_status.json          # Sync status tracker
├── docs/                         # Documentation
├── server.js                     # Custom Express + Socket.IO server
├── server.prod.js                # Production server
├── middleware.ts                 # Next.js middleware
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

---

## Development Best Practices

### 1. Code Organization

#### Keep Components Small and Focused

**Good:**
```typescript
// components/admin/EventItem.tsx
interface EventItemProps {
  event: GHLEvent;
  onSync: (eventId: string) => void;
}

export const EventItem = ({ event, onSync }: EventItemProps) => {
  return (
    <Card>
      <CardHeader>{event.name}</CardHeader>
      <Button onClick={() => onSync(event.id)}>Sync</Button>
    </Card>
  );
};
```

**Bad:**
```typescript
// One giant component doing everything
export const AdminPortal = () => {
  // 500 lines of code...
};
```

#### Use the Service Layer Pattern

**Always** separate API logic from components:

```typescript
// services/orderServices.ts
export const fetchOrderById = async (orderId: string) => {
  const response = await fetch(`/api/qrapp/orders/${orderId}`);
  if (!response.ok) throw new Error('Failed to fetch order');
  return response.json();
};

// components/admin/OrderDetails.tsx
import { fetchOrderById } from '@/services/orderServices';

const OrderDetails = ({ orderId }: { orderId: string }) => {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchOrderById(orderId).then(setOrder);
  }, [orderId]);

  return <div>{/* ... */}</div>;
};
```

### 2. Type Safety

#### Always Define Types

```typescript
// types/index.ts
export interface Order {
  order_id: string;
  location_id: string;
  total_paid: number;
  payment_status: string;
  contact_email: string;
  event_name: string;
  qr_code_image: string | null;
}

export interface Ticket {
  ticket_id: number;
  order_id: string;
  ticket_type: string;
  status: 'live' | 'used' | 'cancelled';
}
```

#### Use Type Inference Wisely

```typescript
// Let TypeScript infer when obvious
const orders = await fetchOrders(); // Type is inferred

// Be explicit for function parameters
const updateTicketStatus = (
  ticketId: number,
  status: 'live' | 'used' | 'cancelled'
): Promise<void> => {
  // ...
};
```

### 3. State Management

#### When to Use Zustand vs Local State

**Use Zustand for:**
- Authentication state
- Global data (GHL events, sync status)
- State needed across multiple routes

**Use Local State (useState) for:**
- Form inputs
- UI state (modals, dropdowns)
- Component-specific data

```typescript
// ✅ Good: Auth state in Zustand
const { user, isAuthenticated } = useAuthStore();

// ✅ Good: Form state local
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
```

### 4. API Routes

#### Structure API Routes Consistently

```typescript
// app/api/qrapp/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('ghl_qr_orders')
      .select('*')
      .order('date_added', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ orders: data }, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
```

#### Always Handle Errors

```typescript
// ❌ Bad
const data = await fetch('/api/orders').then(r => r.json());

// ✅ Good
try {
  const response = await fetch('/api/orders');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const data = await response.json();
} catch (error) {
  console.error('Failed to fetch orders:', error);
  toast.error('Failed to load orders');
}
```

---

## Common Development Tasks

### Adding a New Page

#### 1. Create the Page File

```typescript
// app/(admin)/my-new-page/page.tsx
import { MyPageContent } from '@/components/admin/MyPageContent';

export default function MyNewPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My New Page</h1>
      <MyPageContent />
    </div>
  );
}
```

#### 2. Create the Component

```typescript
// components/admin/MyPageContent.tsx
'use client';

import { useEffect, useState } from 'react';

export const MyPageContent = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch data
  }, []);

  return <div>{/* Component content */}</div>;
};
```

#### 3. Add Navigation Link

```typescript
// components/global/Navbar.tsx
<Link href="/my-new-page">My New Page</Link>
```

### Adding a New API Endpoint

#### 1. Create the Route File

```typescript
// app/api/myendpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Hello' }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Process the request
  return NextResponse.json({ success: true }, { status: 200 });
}
```

#### 2. Create a Service Function

```typescript
// services/myService.ts
export const callMyEndpoint = async (data: any) => {
  const response = await fetch('/api/myendpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Request failed');
  return response.json();
};
```

#### 3. Use in Component

```typescript
import { callMyEndpoint } from '@/services/myService';

const handleSubmit = async () => {
  try {
    await callMyEndpoint({ foo: 'bar' });
    toast.success('Success!');
  } catch (error) {
    toast.error('Failed');
  }
};
```

### Adding a Zustand Store

```typescript
// store/useMyStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MyState {
  items: string[];
  addItem: (item: string) => void;
  removeItem: (item: string) => void;
}

export const useMyStore = create<MyState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({
        items: [...state.items, item]
      })),
      removeItem: (item) => set((state) => ({
        items: state.items.filter(i => i !== item)
      })),
    }),
    {
      name: 'my-store', // localStorage key
    }
  )
);
```

### Adding a Shadcn Component

```bash
# Install a new Shadcn component
npx shadcn-ui@latest add button

# This will:
# 1. Download the component to components/ui/button.tsx
# 2. Add any required dependencies
```

### Adding Database Migrations

When modifying the database schema:

```sql
-- 1. Run in Supabase SQL Editor
ALTER TABLE ghl_qr_orders ADD COLUMN new_column TEXT;

-- 2. Update TypeScript types
-- types/index.ts
export interface Order {
  order_id: string;
  // ... existing fields
  new_column: string | null;
}

-- 3. Update any affected queries
```

---

## Working with GHL Integration

### Testing GHL API Calls

```typescript
// services/ghlServices.ts
const GHL_BASE_URL = process.env.NEXT_PUBLIC_GHL_API_BASE_URL;
const GHL_TOKEN = process.env.GHL_ACCESS_TOKEN;
const LOCATION_ID = process.env.NEXT_PUBLIC_GHL_LOCATION_ID;

export const fetchGHLOrders = async () => {
  const response = await fetch(
    `${GHL_BASE_URL}/payments/orders?altId=${LOCATION_ID}&altType=location`,
    {
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Version': '2021-07-28',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GHL API Error: ${response.status}`);
  }

  return response.json();
};
```

### Testing Webhooks Locally

Use a tool like **ngrok** to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose port 4001
ngrok http 4001

# You'll get a URL like: https://abc123.ngrok.io
# Configure this URL in GHL webhook settings
```

---

## Code Quality

### Linting and Formatting

```bash
# Type check
npx tsc --noEmit

# Format code (if configured)
npm run format
```

### Component Naming Conventions

- **Pages:** Use default exports - `export default function PageName()`
- **Components:** Use named exports - `export const ComponentName = () => {}`
- **Files:** Use PascalCase for components - `MyComponent.tsx`
- **Folders:** Use kebab-case - `my-feature/`

### File Naming

```
✅ Good:
components/admin/EventItem.tsx
services/orderServices.ts
store/useAuthStore.ts

❌ Bad:
components/admin/eventitem.tsx
services/order_services.ts
store/authstore.ts
```

---

## Testing

### Manual Testing Checklist

Before committing changes:

1. **Authentication**
   - [ ] Can log in as SuperAdmin
   - [ ] Can log in as Admin
   - [ ] Can log out
   - [ ] Protected routes redirect correctly

2. **Data Sync**
   - [ ] Sync button works
   - [ ] Progress dialog shows
   - [ ] Socket.IO updates in real-time
   - [ ] Orders sync correctly

3. **CRUD Operations**
   - [ ] Can view orders
   - [ ] Can view tickets
   - [ ] Can update ticket status
   - [ ] Can create users (SuperAdmin)
   - [ ] Can delete users (SuperAdmin)

4. **Responsive Design**
   - [ ] Works on mobile (375px)
   - [ ] Works on tablet (768px)
   - [ ] Works on desktop (1920px)

### API Testing with cURL

```bash
# Test order fetch
curl http://localhost:4001/api/qrapp/orders

# Test single order
curl http://localhost:4001/api/qrapp/orders/ORDER_ID

# Test with authentication (get cookie from browser)
curl -H "Cookie: sb-access-token=..." http://localhost:4001/api/auth/getUser
```

---

## Debugging

### Common Debugging Tools

#### 1. React DevTools
- Install React DevTools browser extension
- Inspect component tree
- View props and state

#### 2. Network Tab
- Open DevTools → Network
- Filter by XHR/Fetch
- Inspect API requests and responses

#### 3. Console Logging

```typescript
// Add strategic logs
console.log('Orders fetched:', orders);
console.log('User state:', useAuthStore.getState());
console.log('Sync status:', useSyncStore.getState());
```

#### 4. Winston Logger (Server-side)

```typescript
// utils/logging/logger.ts
import logger from '@/utils/logging/logger';

logger.info('Starting sync process');
logger.error('Sync failed:', error);
logger.debug('Order details:', order);
```

Logs are saved to `/logs` directory.

### Debugging Socket.IO

```typescript
// Check connection status
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

socket.on('sync_progress', (data) => {
  console.log('Sync progress:', data);
});
```

---

## Git Workflow

### Branch Naming

```
feature/add-export-functionality
bugfix/fix-ticket-status-update
hotfix/critical-auth-issue
docs/update-api-documentation
```

### Commit Messages

Follow conventional commits:

```
feat: add order export to CSV
fix: resolve ticket status not updating
docs: update getting started guide
refactor: extract order logic to service
style: fix linting errors in EventItem
```

### Before Pushing

```bash
# 1. Ensure no TypeScript errors
npx tsc --noEmit

# 2. Test the application
npm run dev
# Manually test affected features

# 3. Stage changes
git add .

# 4. Commit with meaningful message
git commit -m "feat: add order filtering by date range"

# 5. Push
git push origin feature/order-filtering
```

---

## Performance Optimization

### Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src={event.event_image}
  alt={event.event_name}
  width={400}
  height={300}
  priority={false}
/>
```

### Data Fetching Optimization

```typescript
// Use React Query or SWR for caching (if implemented)
// Or implement basic caching
const cache = new Map();

const fetchWithCache = async (key: string, fetcher: () => Promise<any>) => {
  if (cache.has(key)) return cache.get(key);
  const data = await fetcher();
  cache.set(key, data);
  return data;
};
```

---

## Environment-Specific Behavior

### Development vs Production

```typescript
// Check environment
if (process.env.NODE_ENV === 'development') {
  console.log('Dev mode: verbose logging enabled');
}

// Use different API URLs
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001';
```

---

## Quick Reference

### Common File Locations

| Task | Location |
|------|----------|
| Add admin page | `app/(admin)/my-page/page.tsx` |
| Add API route | `app/api/my-route/route.ts` |
| Add component | `components/admin/MyComponent.tsx` |
| Add service | `services/myService.ts` |
| Add Zustand store | `store/useMyStore.ts` |
| Add type | `types/index.ts` |
| Add utility | `lib/utils.ts` |

### Common Commands

```bash
# Start dev server
npm run dev

# Build production
npm run build

# Start production
npm start

# Type check
npx tsc --noEmit

# Add Shadcn component
npx shadcn-ui@latest add [component-name]
```

---

## Next Steps

- Review [System Architecture](/docs/architecture/overview.md)
- Understand [Data Flow](/docs/architecture/data-flow.md)
- Learn about [API Endpoints](/docs/api/auth-endpoints.md)
- Explore [UI Components](/docs/ui-components/component-library.md)

---

**Last Updated:** December 31, 2025
