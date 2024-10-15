"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

// Define form validation schema
const schema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
});

const ResetPasswordForm = () => {
  // Use react-hook-form with Zod validation
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      newPassword: "",
    },
  });

  const [message, setMessage] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async () => {
    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword, // Only pass the new password
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Password has been reset successfully!");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleResetPassword)}
        className="space-y-6"
      >
        <FormItem>
          <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
            New Password
          </FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder="Enter your new password"
              {...form.register("newPassword")}
              className="w-full p-3 bg-slate-100 dark:bg-slate-700 dark:text-white"
            />
          </FormControl>
          <FormMessage>
            {form.formState.errors.newPassword?.message && (
              <span className="text-red-500">
                {form.formState.errors.newPassword.message}
              </span>
            )}
          </FormMessage>
        </FormItem>

        <Button
          type="submit"
          className="w-full bg-slate-700 text-white dark:bg-slate-600 hover:bg-slate-800"
        >
          Reset Password
        </Button>

        {message && (
          <div className="text-green-500 dark:text-green-300 mt-3">
            {message}
          </div>
        )}
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
