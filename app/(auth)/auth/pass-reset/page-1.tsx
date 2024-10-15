"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ResetPassForm from "./reset-pass-form";
import Spinner from "@/components/common/Spinner";
import { Button } from "@/components/ui/button";

const PasswordResetPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const resetPassword = async () => {
      const supabase = createClient();
      const code = searchParams.get("code");

      if (code) {
        try {
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            code
          );

          if (error) {
            setErrorMessage("Invalid or expired reset code.");
            setIsAuthenticated(false);
          } else {
            setIsAuthenticated(true); // User authenticated, show the reset form
          }
        } catch (err) {
          setErrorMessage("There was an error processing the reset request.");
        } finally {
          setIsLoading(false); // Stop loading spinner once auth check is done
        }
      } else {
        setErrorMessage("No reset code found in URL.");
        setIsLoading(false);
      }
    };

    resetPassword();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-red-500">{errorMessage}</p>
        <Button
          className="bg-slate-600 text-white"
          onClick={() => router.push("/login")}
        >
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <ResetPassForm />
    </div>
  );
};

export default PasswordResetPage;
