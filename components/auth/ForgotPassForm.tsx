import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";

interface Props {
  setShowForgotPassword: (isVisible: boolean) => void;
}

const ForgotPassForm = ({ setShowForgotPassword }: Props) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleForgotPassword = async () => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        // Pass Reset Redirect URL where the pass reset form should be
        // redirectTo: `${window.location.origin}/superadmin-portal`,
        redirectTo: `${window.location.origin}/auth/pass-reset`,
      });

      if (error) throw new Error(error.message);

      setMessage("Password reset email sent. Check your inbox!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot Password?</CardTitle>
        <CardDescription>
          Enter your email to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
        />
        {message && <p className="text-green-500">{message}</p>}
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex justify-between">
          <Button
            className="bg-green-700 hover:bg-green-600 text-white"
            onClick={handleForgotPassword}
          >
            Send Reset Link
          </Button>
          <Button
            variant="link"
            onClick={() => setShowForgotPassword(false)}
            className="bg-slate-600 hover:bg-slate-500 text-white"
          >
            Back to Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForgotPassForm;
