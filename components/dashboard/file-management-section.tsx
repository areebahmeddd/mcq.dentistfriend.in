"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteQuizFile, getQuizFiles, type QuizFile } from "@/lib/firestore";
import { useEffect, useState } from "react";

export default function FileManagementSection() {
  const [files, setFiles] = useState<QuizFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const filesData = await getQuizFiles();
        setFiles(filesData);
      } catch (error) {
        // Silent error handling
      }
    };
    loadFiles();
  }, []);

  const handleDelete = async (fileId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this file? All associated questions will be deleted.",
      )
    ) {
      setLoading(true);
      try {
        await deleteQuizFile(fileId);
        const updatedFiles = await getQuizFiles();
        setFiles(updatedFiles);
      } catch (error) {
        // Silent error handling
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Files</CardTitle>
        <CardDescription>View and delete uploaded quiz files</CardDescription>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <Alert>
            <AlertDescription>No files uploaded yet</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-semibold">
                    {file.subject} - {file.topic}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {file.questionCount} questions • Uploaded{" "}
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(file.id)}
                  disabled={loading}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
