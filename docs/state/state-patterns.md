# State Management Patterns

This document describes advanced state management patterns, best practices, and architectural decisions for using Zustand in the QR Project V3.

---

## Overview

This document covers:
- State organization strategies
- Common patterns used across stores
- Performance optimization techniques
- Testing strategies
- Migration patterns

---

## State Organization

### Store Structure Pattern

All stores follow a consistent structure:

```typescript
interface StoreState {
  // 1. Data State
  data: DataType | null;
  list: DataType[];

  // 2. UI State
  isLoading: boolean;
  isModalOpen: boolean;
  selectedId: string | null;

  // 3. Computed State (if needed)
  totalItems: number;

  // 4. Synchronous Actions
  setData: (data: DataType) => void;
  setLoading: (loading: boolean) => void;

  // 5. Asynchronous Actions
  fetchData: () => Promise<void>;
  createData: (data: DataType) => Promise<void>;
  updateData: (id: string, data: Partial<DataType>) => Promise<void>;
  deleteData: (id: string) => Promise<void>;

  // 6. UI Actions
  openModal: (id: string) => void;
  closeModal: () => void;
}
```

### Example: Complete Store Structure

```typescript
import { create } from "zustand";

interface Order {
  order_id: string;
  total_paid: number;
  event_name: string;
}

interface OrderStoreState {
  // Data State
  orders: Order[];
  currentOrder: Order | null;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Computed State
  totalOrders: number;

  // Synchronous Actions
  setOrders: (orders: Order[]) => void;
  setCurrentOrder: (order: Order | null) => void;
  setError: (error: string | null) => void;

  // Asynchronous Actions
  fetchOrders: () => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;

  // Computed Actions
  calculateTotal: () => void;
}

export const useOrderStore = create<OrderStoreState>((set, get) => ({
  // Initial State
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  totalOrders: 0,

  // Synchronous Actions
  setOrders: (orders) => set({ orders }),

  setCurrentOrder: (order) => set({ currentOrder: order }),

  setError: (error) => set({ error }),

  // Asynchronous Actions
  fetchOrders: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/qrapp/orders");
      const { orders } = await response.json();

      set({ orders, isLoading: false });
      get().calculateTotal();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchOrderById: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/qrapp/orders/${id}`);
      const { order } = await response.json();

      set({ currentOrder: order, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Computed Actions
  calculateTotal: () => {
    set((state) => ({
      totalOrders: state.orders.length,
    }));
  },
}));
```

---

## Persistence Pattern

### Using persist Middleware

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        // Login logic
        set({ user, isAuthenticated: true });
      },

      logout: async () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-store", // localStorage key
      partialize: (state) => ({
        // Only persist specific fields
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Called after rehydration
        console.log("Auth store rehydrated");
        state?.setIsLoading(false);
      },
    }
  )
);
```

### Partial Persistence

```typescript
persist(
  (set) => ({
    // State and actions
  }),
  {
    name: "my-store",
    partialize: (state) => ({
      // Only persist these fields
      user: state.user,
      settings: state.settings,
      // Don't persist: isLoading, error, etc.
    }),
  }
)
```

---

## Async Action Pattern

### Standard Async Pattern

```typescript
fetchData: async () => {
  set({ isLoading: true, error: null });

  try {
    const response = await fetch("/api/data");

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    set({ data, isLoading: false });
  } catch (error: any) {
    set({ error: error.message, isLoading: false });
  }
},
```

### Async with Optimistic Updates

```typescript
addPost: async (post: Post) => {
  // Optimistic update
  const tempId = Date.now();
  const optimisticPost = { ...post, id: tempId };

  set((state) => ({
    posts: [...state.posts, optimisticPost],
  }));

  try {
    const { data: newPost } = await createPost(post);

    // Replace optimistic post with real post
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === tempId ? newPost : p
      ),
    }));
  } catch (error) {
    // Rollback on error
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== tempId),
    }));

    throw error;
  }
},
```

---

## Computed State Pattern

### Method 1: Computed in Store

```typescript
export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  totalPosts: 0,

  addPost: async (post: Post) => {
    const { data: newPost } = await createPost(post);

    set((state) => ({
      posts: [...state.posts, newPost],
    }));

    // Trigger computed update
    get().calculateTotal();
  },

  calculateTotal: () => {
    set((state) => ({
      totalPosts: state.posts.length,
    }));
  },
}));
```

### Method 2: Computed via Selector

```typescript
// In component
const totalPosts = usePostStore((state) => state.posts.length);
const publishedCount = usePostStore((state) =>
  state.posts.filter((post) => post.published).length
);
```

### Method 3: Custom Hook

```typescript
// Custom hook for computed value
export function usePublishedPostCount() {
  return usePostStore((state) =>
    state.posts.filter((post) => post.published).length
  );
}

// Usage in component
const publishedCount = usePublishedPostCount();
```

---

## Selective Subscription Pattern

### Anti-Pattern: Subscribe to Entire Store

```typescript
// ❌ Bad: Re-renders on ANY state change
const authStore = useAuthStore();

return (
  <div>
    {authStore.isAuthenticated && <Dashboard />}
  </div>
);
```

### Pattern: Selective Subscription

```typescript
// ✅ Good: Only re-renders when isAuthenticated changes
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

return (
  <div>
    {isAuthenticated && <Dashboard />}
  </div>
);
```

### Pattern: Multiple Selectors

```typescript
// ✅ Good: Separate selectors for different values
const user = useAuthStore((state) => state.user);
const roles = useAuthStore((state) => state.roles);
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
```

### Pattern: Object Destructuring with Selector

```typescript
// ✅ Good: Selective multi-value subscription
const { user, isAuthenticated } = useAuthStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
}));
```

---

## Modal State Pattern

### Store-Based Modal State

```typescript
interface PostStoreState {
  isModalOpen: boolean;
  selectedPostId: number | null;

  openModal: (id: number) => void;
  closeModal: () => void;
}

export const usePostStore = create<PostStoreState>((set) => ({
  isModalOpen: false,
  selectedPostId: null,

  openModal: (id: number) => {
    set({ isModalOpen: true, selectedPostId: id });
  },

  closeModal: () => {
    set({ isModalOpen: false, selectedPostId: null });
  },
}));
```

### Usage in Component

```typescript
"use client";

import { usePostStore } from "@/store/usePostStore";

export default function PostList() {
  const { posts, openModal } = usePostStore();

  return (
    <>
      {posts.map((post) => (
        <div key={post.id} onClick={() => openModal(post.id)}>
          {post.title}
        </div>
      ))}

      <PostModal />
    </>
  );
}

function PostModal() {
  const { isModalOpen, selectedPostId, closeModal } = usePostStore();

  if (!isModalOpen) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent>
        <h2>Post ID: {selectedPostId}</h2>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Error Handling Pattern

### Store with Error State

```typescript
interface DataStoreState {
  data: Data | null;
  isLoading: boolean;
  error: string | null;

  fetchData: () => Promise<void>;
  clearError: () => void;
}

export const useDataStore = create<DataStoreState>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  fetchData: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/data");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      set({ data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "An error occurred",
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
```

### Usage with Error Display

```typescript
"use client";

import { useEffect } from "react";
import { useDataStore } from "@/store/useDataStore";

export default function DataDisplay() {
  const { data, isLoading, error, fetchData, clearError } = useDataStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) return <div>Loading...</div>;

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={clearError}>Dismiss</button>
        <button onClick={fetchData}>Retry</button>
      </div>
    );
  }

  return <div>{data && JSON.stringify(data)}</div>;
}
```

---

## Server State Synchronization Pattern

### Sync Store with Server

```typescript
interface SyncStoreState {
  syncStatus: SyncStatus | null;
  isLoading: boolean;

  fetchSyncStatus: () => Promise<void>;
  updateSyncStatus: (status: SyncStatus) => Promise<void>;
}

export const useSyncStore = create<SyncStoreState>((set) => ({
  syncStatus: null,
  isLoading: true,

  fetchSyncStatus: async () => {
    set({ isLoading: true });

    const response = await fetch("/api/qrapp/sync-status");
    const status = await response.json();

    set({ syncStatus: status, isLoading: false });
  },

  updateSyncStatus: async (status: SyncStatus) => {
    // Update server
    await fetch("/api/qrapp/sync-status", {
      method: "POST",
      body: JSON.stringify(status),
    });

    // Update local state
    set({ syncStatus: status });
  },
}));
```

---

## Real-Time Updates Pattern

### Socket.IO Integration

```typescript
"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { useSyncStore } from "@/store/useSyncStore";

export default function SyncMonitor() {
  const { syncStatus, updateSyncStatus } = useSyncStore();

  useEffect(() => {
    const socket = io();

    // Listen for sync updates
    socket.on("sync_status", (status) => {
      updateSyncStatus(status);
    });

    socket.on("sync_progress", (progress) => {
      updateSyncStatus(progress);
    });

    return () => {
      socket.disconnect();
    };
  }, [updateSyncStatus]);

  return (
    <div>
      <p>Status: {syncStatus?.status}</p>
      <p>Progress: {syncStatus?.syncedOrders} / {syncStatus?.totalOrders}</p>
    </div>
  );
}
```

---

## Testing Patterns

### Testing Store Actions

```typescript
import { renderHook, act } from "@testing-library/react";
import { usePostStore } from "@/store/usePostStore";

describe("usePostStore", () => {
  beforeEach(() => {
    // Reset store before each test
    usePostStore.setState({ posts: [], totalPosts: 0 });
  });

  it("should add a post", async () => {
    const { result } = renderHook(() => usePostStore());

    await act(async () => {
      await result.current.addPost({
        title: "Test Post",
        content: "Test Content",
      });
    });

    expect(result.current.posts).toHaveLength(1);
    expect(result.current.posts[0].title).toBe("Test Post");
  });

  it("should calculate total posts", () => {
    const { result } = renderHook(() => usePostStore());

    act(() => {
      result.current.setPosts([
        { id: 1, title: "Post 1" },
        { id: 2, title: "Post 2" },
      ]);
      result.current.getTotalPosts();
    });

    expect(result.current.totalPosts).toBe(2);
  });
});
```

---

## Migration Patterns

### Adding New State

```typescript
// Before
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// After: Add new field with default value
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  lastLoginTime: string | null;  // New field
}

// Store
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      lastLoginTime: null,  // Default value

      login: async (email, password) => {
        // ...
        set({
          user,
          isAuthenticated: true,
          lastLoginTime: new Date().toISOString(),  // Set on login
        });
      },
    }),
    { name: "auth-store" }
  )
);
```

### Renaming State Fields

```typescript
// Migration: Rename 'admin' to 'roles'
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // ...state
    }),
    {
      name: "auth-store",
      migrate: (persistedState: any, version: number) => {
        // Migrate from old structure
        if (persistedState.admin) {
          return {
            ...persistedState,
            roles: persistedState.admin,
            admin: undefined,  // Remove old field
          };
        }
        return persistedState;
      },
    }
  )
);
```

---

## Performance Best Practices

### 1. Avoid Unnecessary Re-renders

```typescript
// ❌ Bad: Creates new object on every render
const data = useDataStore((state) => ({ value: state.value }));

// ✅ Good: Use shallow equality
import { shallow } from "zustand/shallow";

const { value, count } = useDataStore(
  (state) => ({ value: state.value, count: state.count }),
  shallow
);
```

### 2. Separate UI State from Data State

```typescript
// ✅ Good: Separate stores for different concerns
export const useDataStore = create((set) => ({
  data: [],
  fetchData: async () => { /* ... */ },
}));

export const useUIStore = create((set) => ({
  isModalOpen: false,
  selectedId: null,
  openModal: (id) => set({ isModalOpen: true, selectedId: id }),
}));
```

### 3. Memoize Expensive Selectors

```typescript
import { useMemo } from "react";

function MyComponent() {
  const posts = usePostStore((state) => state.posts);

  // Memoize expensive computation
  const sortedPosts = useMemo(() => {
    return posts.sort((a, b) => b.date - a.date);
  }, [posts]);

  return <div>{/* render sortedPosts */}</div>;
}
```

---

## Related Documentation

- [Zustand Stores](/docs/state/zustand-stores.md) - Complete store reference
- [State Management Architecture](/docs/architecture/state-management.md) - Overall strategy
- [Authentication](/docs/architecture/authentication.md) - Auth store usage
- [Data Synchronization](/docs/features/data-synchronization.md) - Sync store usage

---

**Last Updated:** December 31, 2025
