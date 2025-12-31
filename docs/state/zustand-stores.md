# Zustand Stores

This document provides a complete reference for all Zustand stores in the QR Project V3, including their state structure, actions, and usage patterns.

---

## Overview

The application uses **Zustand** as its state management library. Zustand provides a minimal, hook-based API for managing global state without the boilerplate of Redux.

**Package Version:** `zustand@4.5.4`

### Store List

1. **useAuthStore** - Authentication and user session management
2. **useGHLDataStore** - GoHighLevel data caching (events, fields)
3. **useSyncStore** - Synchronization status monitoring
4. **usePostStore** - Blog post management (Supabase)
5. **useJsonsrvPostStore** - Blog post management (JSON Server)

---

## 1. useAuthStore

**File Location:** `store/useAuthStore.ts:25`

**Purpose:** Manages user authentication state, login/logout actions, and role-based access control.

### State Interface

```typescript
interface AuthState {
  user: any | null;
  roles: {
    is_qr_superadmin: number;
    is_qr_admin: number;
    is_qr_member: number;
  };
  isAuthenticated: boolean;
  isLoading: boolean;
  logoutInProgress: boolean;
  shouldStoreRedirectURL: boolean;

  // Actions
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

### Implementation

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      roles: {
        is_qr_superadmin: 0,
        is_qr_admin: 0,
        is_qr_member: 0,
      },
      isAuthenticated: false,
      isLoading: true,
      logoutInProgress: false,
      shouldStoreRedirectURL: true,

      setIsLoading: (isLoading) => set({ isLoading }),

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setRoles: (roles) => set({ roles }),

      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      setLogoutInProgress: (inProgress) => set({ logoutInProgress: inProgress }),

      setShouldStoreRedirectURL: (shouldStore) =>
        set({ shouldStoreRedirectURL: shouldStore }),

      login: async (email, password) => {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, no-cache, must-revalidate",
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
      },

      logout: async () => {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error);
        }

        // Clear redirect URL
        localStorage.removeItem("redirectAfterLogin");

        set({
          user: null,
          roles: {
            is_qr_superadmin: 0,
            is_qr_admin: 0,
            is_qr_member: 0,
          },
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-store", // localStorage key
      onRehydrateStorage: () => (state) => {
        state?.setIsLoading(false);
      },
    }
  )
);
```

### Usage Examples

**Login:**
```typescript
"use client";

import { useAuthStore } from "@/store/useAuthStore";

export default function LoginForm() {
  const { login, isLoading } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      // Redirect after successful login
      router.push("/admin-portal");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return <form onSubmit={handleLogin}>...</form>;
}
```

**Check Authentication:**
```typescript
"use client";

import { useAuthStore } from "@/store/useAuthStore";

export default function ProtectedPage() {
  const { isAuthenticated, roles, isLoading } = useAuthStore();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || roles.is_qr_admin !== 1) {
    return <div>Access Denied</div>;
  }

  return <div>Protected Content</div>;
}
```

**Logout:**
```typescript
const { logout } = useAuthStore();

const handleLogout = async () => {
  await logout();
  router.push("/auth");
};
```

### Persistence

The `persist` middleware saves the auth state to `localStorage` with the key `"auth-store"`. On page refresh, the state is automatically rehydrated.

---

## 2. useGHLDataStore

**File Location:** `store/useGHLDataStore.ts:12`

**Purpose:** Caches GoHighLevel data (events and custom fields) to reduce API calls.

### State Interface

```typescript
interface AdminState {
  events: GHLEvent[];
  fields: GHLCustomField[];

  // Actions
  setEvents: (events: GHLEvent[]) => void;
  setFields: (fields: GHLCustomField[]) => void;
}
```

### Implementation

```typescript
import { create } from "zustand";
import { GHLEvent } from "@/types/events";
import { GHLCustomField } from "@/types/fields";

export const useGHLDataStore = create<AdminState>((set) => ({
  events: [],
  fields: [],

  setEvents: (events) => set({ events }),
  setFields: (fields) => set({ fields }),
}));
```

### Usage Examples

**Fetch and Cache Events:**
```typescript
"use client";

import { useEffect } from "react";
import { useGHLDataStore } from "@/store/useGHLDataStore";

export default function EventsPage() {
  const { events, setEvents } = useGHLDataStore();

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch("/api/ghl/events");
      const { productIds } = await response.json();
      setEvents(productIds);
    };

    if (events.length === 0) {
      fetchEvents();
    }
  }, [events, setEvents]);

  return (
    <div>
      {events.map((eventId) => (
        <div key={eventId}>{eventId}</div>
      ))}
    </div>
  );
}
```

**Access Cached Data:**
```typescript
const { events, fields } = useGHLDataStore();

// Use cached events
console.log("Cached events:", events);
```

---

## 3. useSyncStore

**File Location:** `store/useSyncStore.ts:14`

**Purpose:** Manages synchronization status and dialog state for the manual sync feature.

### State Interface

```typescript
interface SyncStoreState {
  syncStatus: SyncStatus | null;
  isLoading: boolean;
  isDialogOpen: boolean;

  // Actions
  setIsDialogOpen: (open: boolean) => void;
  fetchSyncStatus: () => Promise<void>;
  updateSyncStatus: (status: SyncStatus) => Promise<void>;
}

interface SyncStatus {
  syncInProgress: boolean;
  startTime: string | null;
  endTime: string | null;
  totalOrders: number;
  syncedOrders: number;
  status: "Syncing" | "Delay" | "Completed" | "Error";
  delay_in_sec: number;
}
```

### Implementation

```typescript
import { create } from "zustand";
import { SyncStatus } from "@/types/sync";
import { getSyncStatus, updateSyncStatus } from "@/services/syncStatusService";

export const useSyncStore = create<SyncStoreState>((set, get) => ({
  syncStatus: null,
  isLoading: true,
  isDialogOpen: false,

  setIsDialogOpen: (open: boolean) => {
    set({ isDialogOpen: open });
  },

  // Fetches sync status from JSON file
  fetchSyncStatus: async () => {
    set({ isLoading: true });
    const status = await getSyncStatus();
    set({ syncStatus: status, isLoading: false });
  },

  // Updates sync status and writes to JSON file
  updateSyncStatus: async (status: SyncStatus) => {
    await updateSyncStatus(status);
    set({ syncStatus: status });
  },
}));
```

### Usage Examples

**Fetch Sync Status:**
```typescript
"use client";

import { useEffect } from "react";
import { useSyncStore } from "@/store/useSyncStore";

export default function SyncDashboard() {
  const { syncStatus, isLoading, fetchSyncStatus } = useSyncStore();

  useEffect(() => {
    fetchSyncStatus();
  }, [fetchSyncStatus]);

  if (isLoading) {
    return <div>Loading sync status...</div>;
  }

  return (
    <div>
      <h2>Sync Status: {syncStatus?.status}</h2>
      <p>Orders: {syncStatus?.syncedOrders} / {syncStatus?.totalOrders}</p>
    </div>
  );
}
```

**Open Sync Dialog:**
```typescript
const { setIsDialogOpen } = useSyncStore();

const handleOpenDialog = () => {
  setIsDialogOpen(true);
};
```

---

## 4. usePostStore

**File Location:** `store/usePostStore.ts:28`

**Purpose:** Manages blog posts from Supabase database with CRUD operations.

### State Interface

```typescript
interface PostState {
  post: Post | null;
  posts: Post[];
  totalPosts: number;
  isModalOpen: boolean;
  selectedPostId: number | null;

  // Actions
  fetchPosts: () => Promise<void>;
  fetchSinglePost: (id: number) => Promise<void>;
  addPost: (post: Post) => Promise<void>;
  editPost: (updatedPost: Post) => Promise<void>;
  removePost: (id: number) => Promise<void>;
  getTotalPosts: () => void;
  openModal: (id: number) => void;
  closeModal: () => void;
  setPosts: (posts: Post[]) => void;
}
```

### Implementation

```typescript
import { create } from "zustand";
import {
  getPosts,
  createPost,
  editPost,
  deletePost,
  getSingle,
} from "@/services/postServices";
import { Post } from "@/types/posts";

export const usePostStore = create<PostState>((set, get) => ({
  post: null,
  posts: [],
  totalPosts: 0,
  isModalOpen: false,
  selectedPostId: null,

  getTotalPosts: () => {
    set((state) => ({
      totalPosts: state.posts.length,
    }));
  },

  fetchPosts: async () => {
    const { posts, totalPosts } = await getPosts();
    set({ posts, totalPosts });
  },

  fetchSinglePost: async (id: number) => {
    const result = await getSingle(id);
    const post = result?.data ?? null;
    set({ post });
  },

  addPost: async (post: Post) => {
    const { data: newPost } = await createPost(post);
    set((state) => ({
      posts: [...state.posts, newPost],
    }));
    get().getTotalPosts();
  },

  editPost: async (updatedPost: Post) => {
    const { data: editedPost } = await editPost(updatedPost.id, updatedPost);
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === editedPost.id ? editedPost : post
      ),
    }));
    get().getTotalPosts();
  },

  removePost: async (id: number) => {
    await deletePost(id);
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== id),
    }));
    get().getTotalPosts();
  },

  openModal: (id: number) => {
    set({ isModalOpen: true, selectedPostId: id });
  },

  closeModal: () => {
    set({ isModalOpen: false, selectedPostId: null });
  },

  setPosts: (posts: Post[]) => {
    set({ posts });
  },
}));
```

### Usage Examples

**Fetch Posts:**
```typescript
const { posts, fetchPosts } = usePostStore();

useEffect(() => {
  fetchPosts();
}, [fetchPosts]);
```

**Add Post:**
```typescript
const { addPost } = usePostStore();

const handleAddPost = async () => {
  await addPost({
    title: "New Post",
    content: "Post content",
  });
};
```

**Edit Post:**
```typescript
const { editPost } = usePostStore();

const handleEditPost = async (post: Post) => {
  await editPost({ ...post, title: "Updated Title" });
};
```

**Delete Post:**
```typescript
const { removePost } = usePostStore();

const handleDeletePost = async (id: number) => {
  await removePost(id);
};
```

---

## 5. useJsonsrvPostStore

**File Location:** `store/useJsonsrvPostStore.ts:23`

**Purpose:** Manages blog posts from a JSON Server (testing/demo purposes).

### State Interface

```typescript
interface PostState {
  posts: Post[];
  totalPosts: number;
  isModalOpen: boolean;
  selectedPostId: string | null;

  // Actions
  fetchPosts: () => Promise<void>;
  addPost: (post: Post) => Promise<void>;
  removePost: (id: string) => Promise<void>;
  getTotalPosts: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
}
```

### Implementation

```typescript
import { create } from "zustand";
import {
  getPosts,
  createPost,
  deletePost,
} from "@/services/jsonsrvPostServices";
import { Post } from "@/types/posts";

export const useJsonsrvPostStore = create<PostState>((set, get) => ({
  posts: [],
  totalPosts: 0,
  isModalOpen: false,
  selectedPostId: null,

  getTotalPosts: () => {
    set((state) => ({
      totalPosts: state.posts.length,
    }));
  },

  fetchPosts: async () => {
    const response = await getPosts();
    set({ posts: response.data, totalPosts: response.totalPosts });
  },

  addPost: async (post: Post) => {
    const newPost = await createPost(post);
    set((state) => ({
      posts: [...state.posts, newPost],
    }));
    get().getTotalPosts();
  },

  removePost: async (id: string) => {
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== id),
    }));
    get().getTotalPosts();
  },

  openModal: (id: string) => {
    set({ isModalOpen: true, selectedPostId: id });
  },

  closeModal: () => {
    set({ isModalOpen: false, selectedPostId: null });
  },
}));
```

---

## Store Comparison

| Feature | useAuthStore | useGHLDataStore | useSyncStore | usePostStore | useJsonsrvPostStore |
|---------|-------------|----------------|--------------|--------------|-------------------|
| **Persistence** | ✅ localStorage | ❌ | ❌ | ❌ | ❌ |
| **Async Actions** | ✅ login/logout | ❌ | ✅ fetch/update | ✅ CRUD | ✅ CRUD |
| **Middleware** | persist | - | - | - | - |
| **Data Source** | Supabase Auth | GHL API | JSON file | Supabase | JSON Server |

---

## Best Practices

### 1. Selective Subscription

Only subscribe to the state you need:

```typescript
// ❌ Bad: Re-renders on any auth state change
const authStore = useAuthStore();

// ✅ Good: Only re-renders when isAuthenticated changes
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
```

### 2. Async Actions Pattern

Always use try-catch for async actions:

```typescript
const { login } = useAuthStore();

try {
  await login(email, password);
  router.push("/dashboard");
} catch (error) {
  console.error("Login failed:", error);
  setError(error.message);
}
```

### 3. Accessing Multiple Values

Use object destructuring for multiple values:

```typescript
const { user, roles, isAuthenticated } = useAuthStore();
```

### 4. Using get() for Internal Updates

Use `get()` to access current state inside actions:

```typescript
addPost: async (post: Post) => {
  const { data: newPost } = await createPost(post);
  set((state) => ({
    posts: [...state.posts, newPost],
  }));
  get().getTotalPosts(); // Call another action
},
```

---

## DevTools Integration

### Install Zustand DevTools

```bash
npm install @redux-devtools/extension
```

### Enable DevTools

```typescript
import { devtools } from "zustand/middleware";

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        // ... state
      }),
      { name: "auth-store" }
    ),
    { name: "AuthStore" } // DevTools name
  )
);
```

---

## Related Documentation

- [State Patterns](/docs/state/state-patterns.md) - Advanced Zustand patterns
- [State Management Architecture](/docs/architecture/state-management.md) - Overall state strategy
- [Authentication](/docs/architecture/authentication.md) - Auth state usage
- [Data Synchronization](/docs/features/data-synchronization.md) - Sync state usage

---

**Last Updated:** December 31, 2025
