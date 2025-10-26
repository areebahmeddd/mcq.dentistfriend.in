"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  getQuestionsByFileId,
  getQuizFileById,
  saveQuizResult,
  type Question,
  type QuizFile,
} from "@/lib/firestore";
import QuizResults from "./quiz-results";

interface QuizInterfaceProps {
  userId: string;
  quizFileId: string;
  onBack: () => void;
}

export default function QuizInterface({
  userId,
  quizFileId,
  onBack,
}: QuizInterfaceProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [quizFile, setQuizFile] = useState<QuizFile | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        setLoading(true);
        const [loadedQuestions, file] = await Promise.all([
          getQuestionsByFileId(quizFileId),
          getQuizFileById(quizFileId),
        ]);

        setQuestions(loadedQuestions);
        setQuizFile(file);
      } catch (error) {
        alert("Failed to load quiz data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadQuizData();
  }, [quizFileId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={onBack}>
          Back to Dashboard
        </Button>
        <Alert variant="destructive">
          <AlertDescription>No questions found for this quiz.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <QuizResults
        result={result}
        questions={questions}
        answers={answers}
        onBack={onBack}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const selectedAnswer = answers[currentQuestion.id] || "";

  const handleAnswerChange = (option: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: option,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (
      confirm(
        "Are you sure you want to submit the quiz? You cannot change your answers after submission."
      )
    ) {
      try {
        // Calculate score
        let score = 0;
        questions.forEach((question) => {
          const userAnswer = (answers[question.id] || "").toUpperCase();
          const correctAnswer = (question.correctAnswer || "").toUpperCase();

          if (userAnswer === correctAnswer) {
            score++;
          }
        });

        const percentage = (score / questions.length) * 100;

        // Create result object
        const newResult = {
          userId,
          fileId: quizFileId,
          answers,
          score,
          totalQuestions: questions.length,
          percentage,
          completedAt: new Date().toISOString(),
        };

        // Save result to Firestore
        await saveQuizResult(newResult);

        setResult({ ...newResult, id: "temp" });
        setSubmitted(true);
      } catch (error) {
        alert("Failed to submit quiz. Please try again.");
      }
    }
  };

  const allAnswered = questions.every((q) => answers[q.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{quizFile?.subject}</h2>
          <p className="text-muted-foreground">{quizFile?.topic}</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Exit Quiz
        </Button>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <p className="text-sm text-muted-foreground">
            Answered: {Object.keys(answers).length}/{questions.length}
          </p>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Options */}
          <div className="space-y-3">
            {["A", "B", "C", "D"].map((option) => {
              const optionKey = `option${option}` as keyof Question;
              const optionText = currentQuestion[optionKey];

              return (
                <label
                  key={option}
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={() => handleAnswerChange(option)}
                    className="mr-3"
                  />
                  <span className="font-medium mr-2">{option}.</span>
                  <span>{optionText}</span>
                </label>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Quiz
            </Button>
          )}
        </div>
      </div>

      {/* Unanswered Warning */}
      {!allAnswered && currentQuestionIndex === questions.length - 1 && (
        <Alert>
          <AlertDescription>
            Please answer all questions before submitting.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
