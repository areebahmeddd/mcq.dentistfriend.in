"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type User } from "@/lib/firebase-auth";
import {
  getQuizFiles,
  getResultsByUserId,
  type QuizFile,
  type QuizResult,
} from "@/lib/firestore";
import { useEffect, useState } from "react";
import ModeSelector from "./mode-selector";
import QuizInterface from "./quiz-interface";
import StudyMode from "./study-mode";
import TopicBrowser from "./topic-browser";
import UserStatistics from "./user-statistics";

interface UserDashboardProps {
  user: User;
}

export default function UserDashboard({ user }: UserDashboardProps) {
  const [quizFiles, setQuizFiles] = useState<QuizFile[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<"study" | "quiz" | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [files, userResults] = await Promise.all([
          getQuizFiles(),
          getResultsByUserId(user.id),
        ]);

        setQuizFiles(files);
        setResults(userResults);
      } catch (error) {
        alert("Failed to load dashboard data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.id]);

  if (selectedQuizId && !selectedMode) {
    return (
      <ModeSelector
        onSelectMode={(mode) => setSelectedMode(mode)}
        onBack={() => {
          setSelectedQuizId(null);
          setSelectedMode(null);
        }}
      />
    );
  }

  if (selectedQuizId && selectedMode === "study") {
    return (
      <StudyMode
        userId={user.id}
        quizFileId={selectedQuizId}
        onBack={() => {
          setSelectedQuizId(null);
          setSelectedMode(null);
          getResultsByUserId(user.id).then(setResults);
        }}
      />
    );
  }

  if (selectedQuizId && selectedMode === "quiz") {
    return (
      <QuizInterface
        userId={user.id}
        quizFileId={selectedQuizId}
        onBack={() => {
          setSelectedQuizId(null);
          setSelectedMode(null);
          getResultsByUserId(user.id).then(setResults);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome, {user.email}!
        </h2>
        <p className="text-muted-foreground mt-2">
          Practice MCQs and track your progress
        </p>
      </div>

      <Tabs defaultValue="practice" className="w-full">
        <TabsList>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Practice Tab */}
        <TabsContent value="practice" className="space-y-4">
          <TopicBrowser
            quizFiles={quizFiles}
            results={results}
            onSelectQuiz={(quizId) => setSelectedQuizId(quizId)}
          />
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-4">
          <UserStatistics results={results} quizFiles={quizFiles} />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {results.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No quiz attempts yet. Start practicing!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {results
                .sort(
                  (a: any, b: any) =>
                    new Date(b.completedAt).getTime() -
                    new Date(a.completedAt).getTime(),
                )
                .map((result: any) => {
                  const quizFile = quizFiles.find(
                    (f: any) => f.id === result.fileId,
                  );
                  const resultDate = new Date(result.completedAt);

                  return (
                    <Card
                      key={result.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {quizFile?.subject} - {quizFile?.topic}
                            </CardTitle>
                            <CardDescription>
                              {resultDate.toLocaleDateString()} at{" "}
                              {resultDate.toLocaleTimeString()}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              {result.percentage.toFixed(1)}%
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {result.score}/{result.totalQuestions}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Correct
                            </p>
                            <p className="text-lg font-semibold text-green-600">
                              {result.score}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Incorrect
                            </p>
                            <p className="text-lg font-semibold text-red-600">
                              {result.totalQuestions - result.score}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Accuracy
                            </p>
                            <p className="text-lg font-semibold">
                              {result.percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
