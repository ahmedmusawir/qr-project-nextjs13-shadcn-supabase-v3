"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

const formSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: "Email is required",
    })
    .email({
      message: "Please enter a valid email",
    }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

const LoginForm = () => {
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setError(null); // Reset error state before submission
    console.log("[Login Form] Attempting login...");

    try {
      console.log("[useAuthStore] Starting login process...");
      await login(data.email, data.password);

      // Ensure the state is updated before accessing roles
      const roles = useAuthStore.getState().roles;
      const isAuthenticated = useAuthStore.getState().isAuthenticated;
      const redirectURL = localStorage.getItem("redirectAfterLogin");

      console.log(
        "[Login Form] Login successful. isAuthenticated:",
        isAuthenticated
      );
      console.log("[Login Form] Roles:", roles);

      // Only proceed with redirection if the user is authenticated
      if (isAuthenticated) {
        console.log("[Login Form] Redirecting based on roles...");
        if (redirectURL) {
          // Clear the stored URL after using it
          console.log("[Login Form] Redirecting to stored URL:", redirectURL);
          localStorage.removeItem("redirectAfterLogin");
          router.push(redirectURL);
          console.log("[Login Form] Redirection to stored URL complete.");
        } else {
          // Default role-based redirection
          if (roles.is_qr_superadmin === 1) {
            console.log("[Login Form] Redirecting to /superadmin-portal");
            router.push("/superadmin-portal");
            console.log(
              "[Login Form] Redirection to /superadmin-portal complete."
            );
          } else if (roles.is_qr_admin === 1) {
            console.log("[Login Form] Redirecting to /admin-portal");
            router.push("/admin-portal");
            console.log("[Login Form] Redirection to /admin-portal complete.");
          } else if (roles.is_qr_member === 1) {
            console.log("[Login Form] Redirecting to /members-portal");
            router.push("/members-portal");
            console.log(
              "[Login Form] Redirection to /members-portal complete."
            );
          } else {
            console.log(
              "[Login Form] No matching roles found. Redirecting to /"
            );
            router.push("/"); // Fallback in case no roles match
            console.log("[Login Form] Redirection to / complete.");
          }
        }
      } else {
        setError("Authentication failed. Please try again."); // Set an appropriate error message
      }
    } catch (error: any) {
      console.error("Login error:", error.message);
      setError(error.message); // Set the error state
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Log into your account with your credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text.white">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        className="p-6 bg-slate-100 dark:bg-slate-500 dark:text-white"
                        placeholder="Please Enter Email"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage className="dark:text-red-300" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text.white">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="p-6 bg-slate-100 dark:bg-slate-500 dark:text-white"
                        placeholder="Please Enter password"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage className="dark:text-red-300" />
                  </FormItem>
                )}
              />
              {error && (
                <div className="text-red-500 dark:text-red-300 text-sm mt-2">
                  {error}
                </div>
              )}
              <Button className="w-full bg-slate-700 text-white dark:bg-slate-600 dark:text-white hover:bg-gray-900">
                Login
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export default LoginForm;
