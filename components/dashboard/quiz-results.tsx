"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Question, QuizResult } from "@/lib/firestore";

interface QuizResultsProps {
  result: QuizResult;
  questions: Question[];
  answers: Record<string, string>;
  onBack: () => void;
}

export default function QuizResults({
  result,
  questions,
  answers,
  onBack,
}: QuizResultsProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceLabel = (percentage: number) => {
    if (percentage >= 80) return "Excellent";
    if (percentage >= 60) return "Good";
    if (percentage >= 40) return "Fair";
    return "Needs Improvement";
  };

  const correctAnswers = questions.filter((q) => {
    const userAnswer = (answers[q.id] || "").toUpperCase();
    const correctAnswer = (q.correctAnswer || "").toUpperCase();
    return userAnswer === correctAnswer;
  });
  const incorrectAnswers = questions.filter((q) => {
    const userAnswer = (answers[q.id] || "").toUpperCase();
    const correctAnswer = (q.correctAnswer || "").toUpperCase();
    return userAnswer !== correctAnswer;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quiz Results</h2>
        <Button variant="outline" onClick={onBack}>
          Back to Dashboard
        </Button>
      </div>

      {/* Score Summary */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Your Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Score */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Total Score</p>
              <p className="text-4xl font-bold">
                {result.score}/{result.totalQuestions}
              </p>
            </div>

            {/* Percentage */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Percentage</p>
              <p
                className={`text-4xl font-bold ${getPerformanceColor(
                  result.percentage
                )}`}
              >
                {result.percentage.toFixed(1)}%
              </p>
            </div>

            {/* Performance Label */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Performance</p>
              <p
                className={`text-2xl font-bold ${getPerformanceColor(
                  result.percentage
                )}`}
              >
                {getPerformanceLabel(result.percentage)}
              </p>
            </div>

            {/* Date */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Completed</p>
              <p className="text-lg font-semibold">
                {new Date(result.completedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answer Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Correct Answers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {correctAnswers.length}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {((correctAnswers.length / result.totalQuestions) * 100).toFixed(
                1
              )}
              % of questions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Incorrect Answers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {incorrectAnswers.length}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {(
                (incorrectAnswers.length / result.totalQuestions) *
                100
              ).toFixed(1)}
              % of questions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Review */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All Questions ({questions.length})
          </TabsTrigger>
          <TabsTrigger value="correct">
            Correct ({correctAnswers.length})
          </TabsTrigger>
          <TabsTrigger value="incorrect">
            Incorrect ({incorrectAnswers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {questions.map((question, index) => {
            const userAnswer = answers[question.id];
            const isCorrect =
              (userAnswer || "").toUpperCase() ===
              (question.correctAnswer || "").toUpperCase();
            const isExpanded = expandedQuestion === question.id;

            return (
              <Card
                key={question.id}
                className={isCorrect ? "border-green-200" : "border-red-200"}
              >
                <CardHeader
                  className="cursor-pointer hover:bg-muted transition-colors"
                  onClick={() =>
                    setExpandedQuestion(isExpanded ? null : question.id)
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-muted-foreground">
                          Q{index + 1}.
                        </span>
                        <span
                          className={
                            isCorrect
                              ? "text-green-600 text-sm font-semibold"
                              : "text-red-600 text-sm font-semibold"
                          }
                        >
                          {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                        </span>
                      </div>
                      <CardTitle className="text-base">
                        {question.question}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4 border-t pt-4">
                    {/* User's Answer */}
                    <div>
                      <p className="text-sm font-semibold mb-2">Your Answer:</p>
                      <div
                        className={`p-3 rounded-lg ${
                          isCorrect
                            ? "bg-green-50 border border-green-200"
                            : "bg-red-50 border border-red-200"
                        }`}
                      >
                        <p className="font-medium">
                          {userAnswer}.{" "}
                          {question[`option${userAnswer}` as keyof Question]}
                        </p>
                      </div>
                    </div>

                    {/* Correct Answer */}
                    {!isCorrect && (
                      <div>
                        <p className="text-sm font-semibold mb-2">
                          Correct Answer:
                        </p>
                        <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                          <p className="font-medium">
                            {question.correctAnswer}.{" "}
                            {
                              question[
                                `option${question.correctAnswer}` as keyof Question
                              ]
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    {question.explanation && (
                      <div>
                        <p className="text-sm font-semibold mb-2">
                          Explanation:
                        </p>
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <p className="text-sm">{question.explanation}</p>
                        </div>
                      </div>
                    )}

                    {/* All Options */}
                    <div>
                      <p className="text-sm font-semibold mb-2">All Options:</p>
                      <div className="space-y-2">
                        {["A", "B", "C", "D"].map((option) => {
                          const optionText =
                            question[`option${option}` as keyof Question];
                          const isCorrectOption =
                            option === question.correctAnswer;
                          const isUserAnswer = option === userAnswer;

                          return (
                            <div
                              key={option}
                              className={`p-2 rounded text-sm ${
                                isCorrectOption
                                  ? "bg-green-100 border border-green-300"
                                  : isUserAnswer && !isCorrect
                                  ? "bg-red-100 border border-red-300"
                                  : "bg-muted"
                              }`}
                            >
                              <span className="font-semibold">{option}.</span>{" "}
                              {optionText}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="correct" className="space-y-4">
          {correctAnswers.length === 0 ? (
            <Alert>
              <AlertDescription>
                No correct answers to display.
              </AlertDescription>
            </Alert>
          ) : (
            correctAnswers.map((question, index) => (
              <Card key={question.id} className="border-green-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-600 text-sm font-semibold">
                          ✓ Correct
                        </span>
                      </div>
                      <CardTitle className="text-base">
                        {question.question}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    <span className="font-semibold">Your Answer:</span>{" "}
                    {answers[question.id]}.{" "}
                    {
                      question[
                        `option${answers[question.id]}` as keyof Question
                      ]
                    }
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="incorrect" className="space-y-4">
          {incorrectAnswers.length === 0 ? (
            <Alert>
              <AlertDescription>
                No incorrect answers to display.
              </AlertDescription>
            </Alert>
          ) : (
            incorrectAnswers.map((question, index) => {
              const userAnswer = answers[question.id];

              return (
                <Card key={question.id} className="border-red-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-red-600 text-sm font-semibold">
                            ✗ Incorrect
                          </span>
                        </div>
                        <CardTitle className="text-base">
                          {question.question}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold mb-1">Your Answer:</p>
                      <p className="text-sm text-red-600">
                        {userAnswer}.{" "}
                        {question[`option${userAnswer}` as keyof Question]}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1">
                        Correct Answer:
                      </p>
                      <p className="text-sm text-green-600">
                        {question.correctAnswer}.{" "}
                        {
                          question[
                            `option${question.correctAnswer}` as keyof Question
                          ]
                        }
                      </p>
                    </div>
                    {question.explanation && (
                      <div>
                        <p className="text-sm font-semibold mb-1">
                          Explanation:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={onBack} className="flex-1">
          Back to Dashboard
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          Retake Quiz
        </Button>
      </div>
    </div>
  );
}
