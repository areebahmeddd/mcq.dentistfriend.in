"use client";

import type React from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseExcelFile } from "@/lib/excel-parser";
import { generateFileId } from "@/lib/firebase-storage";
import {
  getQuizFiles,
  saveQuestions,
  saveQuizFile,
  type Question,
  type QuizFile,
} from "@/lib/firestore";
import { useEffect, useState } from "react";

interface FileUploadSectionProps {
  adminId: string;
}

export default function FileUploadSection({ adminId }: FileUploadSectionProps) {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<QuizFile[]>([]);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const files = await getQuizFiles();
        setUploadedFiles(files);
      } catch (error) {
        // Silent error handling
      }
    };
    loadFiles();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (!subject.trim()) {
        setError("Please enter subject");
        return;
      }
      if (!topic.trim()) {
        setError("Please enter topic");
        return;
      }
      if (!file) {
        setError("Please select a file");
        return;
      }

      const questions = await parseExcelFile(file);

      const quizFileId = generateFileId();

      const quizFile: Omit<QuizFile, "id"> = {
        userId: adminId,
        fileName: file.name,
        subject: subject.trim(),
        topic: topic.trim(),
        fileUrl: "",
        questionCount: questions.length,
        uploadedAt: new Date().toISOString(),
      };

      const savedFileId = await saveQuizFile(quizFile);

      const questionsWithFileId: Omit<Question, "id">[] = questions.map(
        (q) => ({
          fileId: savedFileId,
          questionNumber: q.questionNumber,
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer.toUpperCase(),
          explanation: q.explanation,
        }),
      );

      await saveQuestions(questionsWithFileId);

      const updatedFiles = await getQuizFiles();
      setUploadedFiles(updatedFiles);
      setMessage(
        `Successfully uploaded "${file.name}" with ${questions.length} questions!`,
      );

      setSubject("");
      setTopic("");
      setFile(null);
      if (document.getElementById("file")) {
        (document.getElementById("file") as HTMLInputElement).value = "";
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to parse Excel file. Please check the format.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Quiz File</CardTitle>
          <CardDescription>
            Upload an Excel file with questions, options, and answers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics, Science, History"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Algebra, Biology, World War II"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Excel File (.xlsx)</Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                File should have columns: Question Number, Question, Option A,
                Option B, Option C, Option D, Correct Answer, Explanation
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Uploading..." : "Upload File"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.slice(-5).map((f: any) => (
                <div key={f.id} className="p-3 border rounded-lg">
                  <p className="font-medium">
                    {f.subject} - {f.topic}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {f.questionCount} questions
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
