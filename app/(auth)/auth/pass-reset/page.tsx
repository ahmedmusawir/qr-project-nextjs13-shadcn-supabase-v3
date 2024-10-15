"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import ResetPassForm from "./reset-pass-form";
import Spinner from "@/components/common/Spinner";
import { Button } from "@/components/ui/button";
import { Session } from "@supabase/supabase-js";

const PasswordResetPage = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Check if the user is already logged in after the redirect
    const checkSession = async () => {
      const { data: sessionData, error } = await supabase.auth.getSession();
      console.log("sessionData: /auth/pass-reset", sessionData);

      if (error || !sessionData.session) {
        setErrorMessage("Session not found. Please log in.");
      } else {
        setSession(sessionData.session); // Set session if found
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-red-500">{errorMessage}</p>
        <Button
          className="bg-slate-600 text-white"
          onClick={() => router.push("/auth")}
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
