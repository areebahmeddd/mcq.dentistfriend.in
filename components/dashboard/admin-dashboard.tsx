"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User } from "@/lib/firebase-auth";
import AdminFileManager from "./admin-file-manager";
import FileUploadSection from "./file-upload-section";

interface AdminDashboardProps {
  user: User;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Manage quiz files and questions
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList>
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="manage">Manage Files</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <FileUploadSection adminId={user.id} />
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <AdminFileManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
