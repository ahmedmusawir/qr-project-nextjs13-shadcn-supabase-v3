# State Management Architecture

This document describes the state management strategy in the QR Project V3, focusing on Zustand stores, state patterns, and best practices.

---

## Overview

The QR Project V3 uses **Zustand** for global state management with **localStorage persistence**. This provides a simple, performant, and type-safe state management solution.

---

## Why Zustand?

### Advantages Over Alternatives

| Feature | Zustand | Redux | Context API |
|---------|---------|-------|-------------|
| **Boilerplate** | Minimal | Heavy | Moderate |
| **Performance** | Excellent | Excellent | Poor (re-renders) |
| **DevTools** | ✅ Yes | ✅ Yes | ❌ No |
| **Persistence** | Built-in middleware | Requires redux-persist | Manual |
| **TypeScript** | Excellent | Good | Good |
| **Learning Curve** | Low | High | Low |
| **Bundle Size** | 1.2 KB | 11 KB | Built-in |

### Key Benefits

1. **Simple API** - No providers, no reducers, no actions
2. **Selective Subscriptions** - Components only re-render when their specific state changes
3. **Middleware Support** - Built-in persistence, devtools, immer
4. **TypeScript First** - Excellent type inference
5. **No Context Wrapping** - Direct store access anywhere

---

## Store Organization

The application has **5 Zustand stores**, each managing a specific domain:

```
store/
├── useAuthStore.ts           # Authentication state
├── useGHLDataStore.ts        # GHL data caching
├── useSyncStore.ts           # Sync status tracking
├── usePostStore.ts           # Blog posts state
└── useJsonsrvPostStore.ts    # JSON server posts
```

---

## Store Structure Pattern

Each store follows a consistent pattern:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreState {
  // State variables
  data: DataType | null;
  isLoading: boolean;

  // Actions
  fetchData: () => Promise<void>;
  setData: (data: DataType) => void;
  clearData: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      data: null,
      isLoading: false,

      // Actions
      fetchData: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/data');
          const data = await response.json();
          set({ data, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
        }
      },

      setData: (data) => set({ data }),

      clearData: () => set({ data: null }),
    }),
    {
      name: 'store-name', // localStorage key
    }
  )
);
```

---

## Store Details

### 1. useAuthStore

**Purpose:** Manages authentication state, user data, and role information.

**File:** `store/useAuthStore.ts:1`

**State Variables:**

```typescript
interface AuthState {
  user: any | null;                    // Supabase user object
  roles: {
    is_qr_superadmin: number;          // 1 or 0
    is_qr_admin: number;               // 1 or 0
    is_qr_member: number;              // 1 or 0
  };
  isAuthenticated: boolean;            // Login status
  isLoading: boolean;                  // Initial load state
  logoutInProgress: boolean;           // Logout in progress flag
  shouldStoreRedirectURL: boolean;     // Control redirect URL storage
}
```

**Actions:**

```typescript
{
  setIsLoading: (isLoading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: any) => void;
  setRoles: (roles: any) => void;
  setLogoutInProgress: (inProgress: boolean) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setShouldStoreRedirectURL: (shouldStore: boolean) => void;
}
```

**Usage:**

```typescript
// In a component
'use client';

import { useAuthStore } from '@/store/useAuthStore';

export function MyComponent() {
  // Select specific state (component only re-renders when these change)
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    await login('user@example.com', 'password');
  };

  return <div>{user?.email}</div>;
}
```

**Persistence:** Enabled (localStorage key: `auth-store`)

---

### 2. useGHLDataStore

**Purpose:** Caches GHL data (events, custom fields) to reduce API calls.

**File:** `store/useGHLDataStore.ts:1`

**State Variables:**

```typescript
interface GHLDataState {
  events: GHLEvent[] | null;           // Cached events/products
  customFields: CustomField[] | null;  // Cached custom fields
  isLoading: boolean;
}
```

**Actions:**

```typescript
{
  fetchEvents: () => Promise<void>;
  fetchCustomFields: () => Promise<void>;
  setEvents: (events: GHLEvent[]) => void;
  setCustomFields: (fields: CustomField[]) => void;
  clearData: () => void;
}
```

**Usage:**

```typescript
import { useGHLDataStore } from '@/store/useGHLDataStore';

export function EventsList() {
  const events = useGHLDataStore((state) => state.events);
  const fetchEvents = useGHLDataStore((state) => state.fetchEvents);

  useEffect(() => {
    if (!events) {
      fetchEvents();
    }
  }, [events, fetchEvents]);

  return (
    <div>
      {events?.map((event) => (
        <EventItem key={event.id} event={event} />
      ))}
    </div>
  );
}
```

**Persistence:** Enabled (localStorage key: `ghl-data-store`)

---

### 3. useSyncStore

**Purpose:** Tracks synchronization status for real-time progress updates.

**File:** `store/useSyncStore.ts:1`

**State Variables:**

```typescript
interface SyncState {
  syncStatus: {
    status: string;              // 'Idle', 'Syncing Orders', 'Delay', etc.
    syncInProgress: boolean;     // Is sync currently running
    totalOrders?: number;        // Total orders to sync
    syncedOrders?: number;       // Orders synced so far
  };
  isDialogOpen: boolean;         // Sync progress dialog open state
}
```

**Actions:**

```typescript
{
  fetchSyncStatus: () => Promise<void>;
  updateSyncStatus: (status: Partial<SyncStatus>) => void;
  setIsDialogOpen: (isOpen: boolean) => void;
}
```

**Usage with Socket.IO:**

```typescript
import { useSyncStore } from '@/store/useSyncStore';
import { io } from 'socket.io-client';

export function SyncButton() {
  const { syncStatus, updateSyncStatus, setIsDialogOpen } = useSyncStore();

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

    // Listen for sync events
    socket.on('sync_progress', (data) => {
      updateSyncStatus(data);
    });

    socket.on('sync_complete', () => {
      updateSyncStatus({ syncInProgress: false, status: 'Delay' });
    });

    return () => socket.disconnect();
  }, []);

  const handleSync = async () => {
    setIsDialogOpen(true);
    await fetch('/api/ghl/orders/sync');
  };

  return (
    <>
      <Button onClick={handleSync} disabled={syncStatus.syncInProgress}>
        Sync Orders
      </Button>

      {syncStatus.syncInProgress && (
        <div>
          Synced {syncStatus.syncedOrders} / {syncStatus.totalOrders}
        </div>
      )}
    </>
  );
}
```

**Persistence:** Disabled (real-time data, no need to persist)

---

### 4. usePostStore

**Purpose:** Manages blog posts state.

**File:** `store/usePostStore.ts:1`

**State Variables:**

```typescript
interface PostState {
  posts: Post[] | null;
  isLoading: boolean;
}
```

**Actions:**

```typescript
{
  fetchPosts: () => Promise<void>;
  setPosts: (posts: Post[]) => void;
}
```

**Persistence:** Enabled (localStorage key: `post-store`)

---

### 5. useJsonsrvPostStore

**Purpose:** Manages JSON server posts (alternative blog implementation).

**File:** `store/useJsonsrvPostStore.ts:1`

**Similar structure to `usePostStore`**

**Persistence:** Enabled (localStorage key: `jsonsrv-post-store`)

---

## State Access Patterns

### 1. Selective Subscription (Recommended)

Only subscribe to the state you need. Component re-renders only when that specific state changes.

```typescript
// ✅ Good - Only re-renders when user changes
const user = useAuthStore((state) => state.user);

// ❌ Bad - Re-renders on ANY auth store change
const authStore = useAuthStore();
const user = authStore.user;
```

### 2. Multiple Selectors

```typescript
const user = useAuthStore((state) => state.user);
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
const login = useAuthStore((state) => state.login);
```

### 3. Derived State with Selectors

```typescript
const isAdmin = useAuthStore(
  (state) => state.isAuthenticated && state.roles.is_qr_admin === 1
);
```

### 4. Actions Only

```typescript
const login = useAuthStore((state) => state.login);
const logout = useAuthStore((state) => state.logout);
```

---

## Persistence Strategy

### Enabled Persistence

Stores with persistence save to localStorage:

```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Store implementation
    }),
    {
      name: 'auth-store', // localStorage key
    }
  )
);
```

**What Gets Persisted:**
- All state variables in the store
- Automatically rehydrated on page load
- Synced across browser tabs

**Example localStorage:**

```json
{
  "auth-store": {
    "state": {
      "user": { "id": "123", "email": "user@example.com" },
      "isAuthenticated": true,
      "roles": { "is_qr_admin": 1, "is_qr_superadmin": 0 }
    },
    "version": 0
  }
}
```

### Disabled Persistence

Stores without persistence (like `useSyncStore`) are reset on page reload.

```typescript
export const useSyncStore = create<SyncState>((set) => ({
  // No persist wrapper
  syncStatus: {
    status: 'Idle',
    syncInProgress: false,
  },
  // ...
}));
```

---

## Async Actions Pattern

### Fetching Data

```typescript
export const useMyStore = create<MyState>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,

  fetchData: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      set({ data, isLoading: false });
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },
}));
```

### Usage in Component

```typescript
export function MyComponent() {
  const { data, isLoading, error, fetchData } = useMyStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) return <Spinner />;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return <div>{/* Render data */}</div>;
}
```

---

## Store Composition

### Accessing Other Stores

Stores can access each other:

```typescript
export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  checkout: async () => {
    // Access auth store
    const { user } = useAuthStore.getState();

    if (!user) {
      throw new Error('Not authenticated');
    }

    // Proceed with checkout
  },
}));
```

### Combined State

```typescript
export function useUserWithRole() {
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);

  return {
    user,
    roles,
    isAdmin: roles.is_qr_admin === 1,
    isSuperAdmin: roles.is_qr_superadmin === 1,
  };
}
```

---

## DevTools Integration

### Enable DevTools

Install the Zustand DevTools middleware:

```bash
npm install zustand@devtools
```

Wrap store with devtools:

```typescript
import { devtools } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Store implementation
      }),
      { name: 'auth-store' }
    ),
    { name: 'Auth Store' } // DevTools name
  )
);
```

### Using DevTools

1. Open Redux DevTools in browser
2. Select "Zustand" tab
3. See state changes in real-time
4. Time-travel debugging

---

## Best Practices

### 1. Keep Stores Focused

Each store should manage a single domain:

```typescript
// ✅ Good - Single responsibility
useAuthStore     // Authentication
useOrdersStore   // Orders
useSyncStore     // Sync status

// ❌ Bad - Mixed concerns
useGlobalStore   // Everything
```

### 2. Use TypeScript

Always define interfaces for type safety:

```typescript
interface MyState {
  data: DataType | null;
  isLoading: boolean;
  fetchData: () => Promise<void>;
}

export const useMyStore = create<MyState>()(...);
```

### 3. Initialize with Safe Defaults

```typescript
export const useStore = create<State>((set) => ({
  data: null,           // Not undefined
  isLoading: false,     // Clear state
  error: null,          // No error initially
}));
```

### 4. Avoid Over-Persistence

Don't persist everything:

```typescript
// ✅ Good - Persist user data
useAuthStore → persist

// ❌ Bad - Don't persist loading states
isLoading → should NOT persist
syncInProgress → should NOT persist
```

### 5. Use Getters for Computed State

```typescript
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  roles: { ... },

  // Computed getter
  isAdmin: () => {
    const { roles, isAuthenticated } = get();
    return isAuthenticated && roles.is_qr_admin === 1;
  },
}));
```

### 6. Clean Up on Logout

```typescript
logout: async () => {
  // Clear all stores
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    roles: { is_qr_admin: 0, is_qr_superadmin: 0, is_qr_member: 0 },
  });

  useGHLDataStore.getState().clearData();
  // etc.
}
```

---

## Form State Management

For form state, use **React Hook Form** instead of Zustand:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    // Handle submit
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

**Why not Zustand for forms?**
- React Hook Form is optimized for form validation
- Better performance (fewer re-renders)
- Built-in validation with Zod
- Handles complex form scenarios

---

## Local State vs Global State

### Use Local State (useState) For:
- Form inputs
- UI state (modals, dropdowns, toggles)
- Component-specific data
- Temporary state

```typescript
const [isOpen, setIsOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);
```

### Use Global State (Zustand) For:
- Authentication state
- User preferences
- Cached API data
- Shared application state
- Data needed across multiple routes

```typescript
const user = useAuthStore((state) => state.user);
const events = useGHLDataStore((state) => state.events);
```

---

## Testing Zustand Stores

### Unit Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/store/useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
    });
  });

  it('should login user', async () => {
    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login('user@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeTruthy();
  });
});
```

---

## Quick Reference

### Store Files

| Store | File | Persistence | Purpose |
|-------|------|-------------|---------|
| Auth | `store/useAuthStore.ts:1` | ✅ Yes | Authentication state |
| GHL Data | `store/useGHLDataStore.ts:1` | ✅ Yes | GHL data caching |
| Sync | `store/useSyncStore.ts:1` | ❌ No | Real-time sync status |
| Posts | `store/usePostStore.ts:1` | ✅ Yes | Blog posts |
| JSON Posts | `store/useJsonsrvPostStore.ts:1` | ✅ Yes | JSON server posts |

### Common Patterns

```typescript
// Get state
const data = useStore((state) => state.data);

// Get action
const action = useStore((state) => state.action);

// Get computed value
const isValid = useStore((state) => state.value > 0);

// Get entire store (not recommended)
const store = useStore();

// Get state outside component
const data = useStore.getState().data;

// Set state outside component
useStore.setState({ data: newData });
```

---

## Related Documentation

- [System Overview](/docs/architecture/overview.md)
- [Authentication](/docs/architecture/authentication.md)
- [Data Flow](/docs/architecture/data-flow.md)
- [Zustand Stores Reference](/docs/state/zustand-stores.md)

---

**Last Updated:** December 31, 2025
