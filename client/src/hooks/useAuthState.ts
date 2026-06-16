import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

export function useAuthState() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user has a session token
    const sessionToken = localStorage.getItem("sessionToken");
    
    if (sessionToken) {
      // User has a session token, they're logged in
      setIsLoggedIn(true);
      // In a real app, you'd fetch user data from the server
      // For now, we'll assume they're authenticated
    }
    
    setIsLoading(false);
  }, []);

  const login = (userData: AuthUser, sessionToken: string) => {
    localStorage.setItem("sessionToken", sessionToken);
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("rememberEmail");
    setUser(null);
    setIsLoggedIn(false);
  };

  return {
    user,
    isLoading,
    isLoggedIn,
    login,
    logout,
  };
}
