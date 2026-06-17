import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function VerifyEmail() {
  const [location, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const verifyEmailMutation = trpc.auth.verifyEmail.useMutation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    // Verify email
    verifyEmailMutation.mutate(
      { token },
      {
        onSuccess: () => {
          setStatus("success");
          setMessage("Email verified successfully! Redirecting to login...");
          setTimeout(() => setLocation("/login"), 2000);
        },
        onError: (error: any) => {
          setStatus("error");
          setMessage(error.message || "Failed to verify email");
        },
      }
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-20">
      <Card className="w-full max-w-md p-8 border-0 shadow-lg">
        <div className="text-center">
          {status === "loading" && (
            <>
              <Loader className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Verifying Email</h2>
              <p className="text-slate-600">Please wait while we verify your email address...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h2>
              <p className="text-slate-600 mb-6">{message}</p>
              <Button
                onClick={() => setLocation("/login")}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                Go to Login
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h2>
              <p className="text-slate-600 mb-6">{message}</p>
              <Button
                onClick={() => setLocation("/login")}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                Back to Login
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
