import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { updatePassword } from "@/services/userServices";
import Spinner from "@/components/common/Spinner";

// Define the schema using Zod
const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Confirm Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const PasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const {
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Call service function to update password
      const error = await updatePassword(data.newPassword);

      if (error) {
        // Display the error message returned from Supabase
        setErrorMessage(error.message || "An error occurred");
      } else {
        setSuccessMessage("Password updated successfully!");
      }
    } catch (error) {
      setErrorMessage("Error updating password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-10 !bg-white">
      <CardHeader className="items-center pt-10 mb-[-2rem]">
        <CardTitle className="">Update Password</CardTitle>
        <CardDescription>Change your password below</CardDescription>
      </CardHeader>
      <CardContent className="bg-white">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      className="p-4 bg-slate-100 dark:bg-slate-600 dark:text-white"
                      {...field}
                    />
                  </FormControl>
                  {errors.newPassword && (
                    <FormMessage className="text-red-500 dark:text-red-300">
                      {errors.newPassword.message?.toString() ?? "Error"}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      className="p-4 bg-slate-100 dark:bg-slate-600 dark:text-white"
                      {...field}
                    />
                  </FormControl>
                  {errors.confirmPassword && (
                    <FormMessage className="text-red-500 dark:text-red-300">
                      {errors.confirmPassword.message?.toString() ?? "Error"}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />
            {/* Success and Error Messages */}
            {successMessage && (
              <p className="text-green-500 dark:text-green-300">
                {successMessage}
              </p>
            )}
            {errorMessage && (
              <p className="text-red-500 dark:text-red-300">{errorMessage}</p>
            )}

            {/* Button with Spinner */}
            <Button
              type="submit"
              className="w-full bg-slate-700 text-white dark:bg-slate-600 hover:bg-slate-800"
              disabled={isLoading}
            >
              {isLoading ? <Spinner /> : "Update Password"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PasswordForm;
