import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  setIsLoading: (isLoading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: any) => void;
  setRoles: (roles: any) => void;
  setLogoutInProgress: (inProgress: boolean) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  shouldStoreRedirectURL: boolean; // New flag to control writing to localStorage
  setShouldStoreRedirectURL: (shouldStore: boolean) => void; // Function to update the flag
}

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
      setIsLoading: (isLoading) => set({ isLoading }),
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setRoles: (roles) => {
        console.log("[useAuthStore] Setting roles:", roles);
        set({ roles });
      },
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLogoutInProgress: (inProgress) =>
        set({ logoutInProgress: inProgress }),
      login: async (email, password) => {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            Pragma: "no-cache",
            Expires: "0",
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
      shouldStoreRedirectURL: true, // Default is true (we want to store URLs when logged in)

      // Set function for shouldStoreRedirectURL
      setShouldStoreRedirectURL: (shouldStore) =>
        set({ shouldStoreRedirectURL: shouldStore }),

      logout: async () => {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            Pragma: "no-cache",
            Expires: "0",
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
      name: "auth-store", // name of the item in the storage (localStorage)
      onRehydrateStorage: () => (state) => {
        state?.setIsLoading(false);
      },
    }
  )
);
