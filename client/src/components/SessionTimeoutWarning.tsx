import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface SessionTimeoutWarningProps {
  isOpen: boolean;
  onExtend: () => void;
  onLogout: () => void;
}

export function SessionTimeoutWarning({ isOpen, onExtend, onLogout }: SessionTimeoutWarningProps) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md border-0 shadow-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <DialogTitle>Session Timeout Warning</DialogTitle>
          </div>
          <DialogDescription className="mt-2">
            Your session will expire in <strong>{minutes}:{seconds.toString().padStart(2, "0")}</strong> due to inactivity.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <p className="text-sm text-slate-600">
            Click "Continue Session" to stay logged in, or you'll be automatically logged out.
          </p>

          <div className="flex gap-3">
            <Button
              onClick={onLogout}
              variant="outline"
              className="flex-1"
            >
              Logout Now
            </Button>
            <Button
              onClick={onExtend}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Continue Session
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
