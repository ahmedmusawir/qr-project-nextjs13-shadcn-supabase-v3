import { createClient } from "@/utils/supabase/client";

export const updatePassword = async (newPassword: string) => {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return error; // Return the error object
  }

  return null; // Return null if there is no error
};
