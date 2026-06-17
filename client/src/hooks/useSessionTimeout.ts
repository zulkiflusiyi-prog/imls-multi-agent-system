import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

export function useSessionTimeout() {
  const [, setLocation] = useLocation();
  const [showWarning, setShowWarning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    setShowWarning(false);

    // Set warning timeout
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
    }, SESSION_TIMEOUT - WARNING_TIME);

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      // Clear session data
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("rememberEmail");
      // Redirect to login
      setLocation("/login");
    }, SESSION_TIMEOUT);
  };

  useEffect(() => {
    // Reset timeout on user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];

    const handleActivity = () => {
      resetTimeout();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Initial timeout setup
    resetTimeout();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [setLocation]);

  const handleExtendSession = () => {
    setShowWarning(false);
    resetTimeout();
  };

  const handleLogout = () => {
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("rememberEmail");
    setLocation("/login");
  };

  return {
    showWarning,
    handleExtendSession,
    handleLogout,
  };
}
