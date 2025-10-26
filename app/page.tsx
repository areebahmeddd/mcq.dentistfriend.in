"use client";

import { useEffect, useState } from "react";
import { onAuthStateChange, type User } from "@/lib/firebase-auth";
import LoginPage from "@/components/auth/login-page";
import Dashboard from "@/components/dashboard/dashboard";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? (
    <Dashboard user={user} />
  ) : (
    <LoginPage onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />
  );
}
