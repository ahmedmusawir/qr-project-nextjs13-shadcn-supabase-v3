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
import { updatePassword } from "@/services/userServices";
import RedirectButton from "./redirect-button";

// Define form validation schema
const schema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter") // Example of adding more complexity rules
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/\d/, "Password must include at least one number"),
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
  const [error, setError] = useState<string | null>(null);
  const [showRedirectButton, setShowRedirectButton] = useState(false);

  const handleResetPassword = async (data: { newPassword: string }) => {
    setMessage(null); // Reset previous success message
    setError(null); // Reset previous error message

    try {
      const resetError = await updatePassword(data.newPassword);

      if (resetError) {
        setError(
          resetError.message ||
            "An error occurred while resetting the password."
        );
        console.error("Reset password error:", resetError);
      } else {
        setMessage("Password has been reset successfully!");
        setShowRedirectButton(true);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
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

        {error && (
          <div className="text-red-500 dark:text-red-300 mt-3">{error}</div>
        )}
        {showRedirectButton && <RedirectButton />}
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
