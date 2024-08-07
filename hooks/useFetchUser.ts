import { useAuthStore } from "@/store/useAuthStore";

export const useFetchUser = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setRoles = useAuthStore((state) => state.setRoles);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

  const fetchUser = async () => {
    const response = await fetch("/api/auth/getUser", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Auth session missing!");
    }

    const result = await response.json();
    const user = result.data.user;

    setUser(user);
    setRoles(
      user?.user_metadata || {
        is_qr_superadmin: 0,
        is_qr_admin: 0,
        is_qr_member: 0,
      }
    );
    setIsAuthenticated(true);
  };

  return fetchUser;
};
