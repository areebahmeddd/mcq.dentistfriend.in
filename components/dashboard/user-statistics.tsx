"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { QuizFile, QuizResult } from "@/lib/firestore";

interface UserStatisticsProps {
  results: QuizResult[];
  quizFiles: QuizFile[];
}

export default function UserStatistics({
  results,
  quizFiles,
}: UserStatisticsProps) {
  if (results.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No statistics available yet. Complete some quizzes to see your
          performance data.
        </AlertDescription>
      </Alert>
    );
  }

  const totalAttempts = results.length;
  const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0);
  const totalCorrect = results.reduce((sum, r) => sum + r.score, 0);
  const overallPercentage = (totalCorrect / totalQuestions) * 100;
  const averagePercentage =
    results.reduce((sum, r) => sum + r.percentage, 0) / results.length;

  const bestPerformance = Math.max(...results.map((r) => r.percentage));
  const worstPerformance = Math.min(...results.map((r) => r.percentage));

  const performanceBySubject: Record<
    string,
    { total: number; correct: number; attempts: number }
  > = {};
  results.forEach((result) => {
    const file = quizFiles.find((f: any) => f.id === result.fileId);
    if (file) {
      if (!performanceBySubject[file.subject]) {
        performanceBySubject[file.subject] = {
          total: 0,
          correct: 0,
          attempts: 0,
        };
      }
      performanceBySubject[file.subject].total += result.totalQuestions;
      performanceBySubject[file.subject].correct += result.score;
      performanceBySubject[file.subject].attempts += 1;
    }
  });

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalAttempts}</p>
            <p className="text-xs text-muted-foreground mt-1">
              quizzes completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {overallPercentage.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalCorrect}/{totalQuestions} correct
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {averagePercentage.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              across all quizzes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Best Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {bestPerformance.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">highest score</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Range */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Range</CardTitle>
          <CardDescription>
            Your best and worst quiz performances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Best Score</p>
                <p className="text-lg font-bold text-green-600">
                  {bestPerformance.toFixed(1)}%
                </p>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${bestPerformance}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Average Score</p>
                <p className="text-lg font-bold text-primary">
                  {averagePercentage.toFixed(1)}%
                </p>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${averagePercentage}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Worst Score</p>
                <p className="text-lg font-bold text-red-600">
                  {worstPerformance.toFixed(1)}%
                </p>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{ width: `${worstPerformance}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance by Subject */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Subject</CardTitle>
          <CardDescription>Your accuracy in each subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(performanceBySubject).map(([subject, stats]) => {
              const percentage = (stats.correct / stats.total) * 100;
              const performanceColor =
                percentage >= 80
                  ? "bg-green-600"
                  : percentage >= 60
                    ? "bg-yellow-600"
                    : "bg-red-600";

              return (
                <div key={subject}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{subject}</p>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {percentage.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stats.correct}/{stats.total} • {stats.attempts} attempt
                        {stats.attempts > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`${performanceColor} h-2 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📊</div>
            <div>
              <p className="font-semibold text-sm">Total Questions Answered</p>
              <p className="text-sm text-muted-foreground">
                {totalQuestions} questions across all quizzes
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-2xl">✓</div>
            <div>
              <p className="font-semibold text-sm">Correct Answers</p>
              <p className="text-sm text-muted-foreground">
                {totalCorrect} correct answers ({overallPercentage.toFixed(1)}%
                accuracy)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-2xl">🎯</div>
            <div>
              <p className="font-semibold text-sm">Improvement Opportunity</p>
              <p className="text-sm text-muted-foreground">
                {totalQuestions - totalCorrect} questions to review and improve
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
