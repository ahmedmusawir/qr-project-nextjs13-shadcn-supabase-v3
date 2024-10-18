import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";

const RedirectButton = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user) as User | null;

  const handleRedirect = () => {
    if (!user) {
      console.log("no user found - redirect button");
      return; // No user, no redirect
    }

    // Access user metadata
    const userMetadata = user.user_metadata;

    if (userMetadata.is_qr_superadmin === 1) {
      router.push("/superadmin-portal");
    } else if (userMetadata.is_qr_admin === 1) {
      router.push("/admin-portal");
    } else if (userMetadata.is_qr_member === 1) {
      router.push("/members-portal");
    } else {
      router.push("/"); // Fallback URL
    }
  };

  return (
    <Button
      className="mt-4 bg-slate-700 text-white dark:bg-slate-600 hover:bg-slate-800"
      onClick={handleRedirect}
    >
      Go to Portal
    </Button>
  );
};

export default RedirectButton;
