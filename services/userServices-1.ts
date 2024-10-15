import { createClient } from "@/utils/supabase/client";

export const updatePassword = async (newPassword: string) => {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error("Error updating password");
  }
};
