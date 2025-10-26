"use client";

import { useState } from "react";
import type { User } from "@/lib/firebase-auth";
import { logout } from "@/lib/firebase-auth";
import { Button } from "@/components/ui/button";
import AdminDashboard from "./admin-dashboard";
import UserDashboard from "./user-dashboard";

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [currentUser, setCurrentUser] = useState(user);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.reload();
    } catch (error) {
      // Handle logout error silently
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">MCQ Practice App</h1>
            <p className="text-sm text-muted-foreground">
              {currentUser.isAdmin ? "Admin Dashboard" : "User Dashboard"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{currentUser.email}</p>
              <p className="text-xs text-muted-foreground">
                {currentUser.isAdmin ? "Admin" : "User"}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentUser.isAdmin ? (
          <AdminDashboard user={currentUser} />
        ) : (
          <UserDashboard user={currentUser} />
        )}
      </main>
    </div>
  );
}
