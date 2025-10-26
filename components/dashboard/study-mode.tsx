"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  getQuestionsByFileId,
  getQuizFileById,
  type Question,
  type QuizFile,
} from "@/lib/firestore";
import { useEffect, useState } from "react";

interface StudyModeProps {
  userId: string;
  quizFileId: string;
  onBack: () => void;
}

export default function StudyMode({
  userId,
  quizFileId,
  onBack,
}: StudyModeProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quizFile, setQuizFile] = useState<QuizFile | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const loadStudyData = async () => {
      try {
        setLoading(true);
        const [loadedQuestions, file] = await Promise.all([
          getQuestionsByFileId(quizFileId),
          getQuizFileById(quizFileId),
        ]);

        setQuestions(loadedQuestions);
        setQuizFile(file);
      } catch (error) {
        alert("Failed to load study data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadStudyData();
  }, [quizFileId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading study materials...</p>
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

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isAnswered = selectedAnswer !== null;
  const isCorrect =
    selectedAnswer === currentQuestion.correctAnswer.toUpperCase();

  const handleAnswerSelect = (option: string) => {
    if (!submitted) {
      setSelectedAnswer(option);
    }
  };

  const handleSubmitAnswer = () => {
    if (isCorrect) {
      setScore(score + 1);
    }
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
      setSubmitted(false);
    }
  };

  const handleFinish = () => {
    const percentage = (score / questions.length) * 100;
    alert(
      `Study Session Complete!\n\nScore: ${score}/${
        questions.length
      }\nPercentage: ${percentage.toFixed(1)}%\n\nGreat job studying!`,
    );
    onBack();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{quizFile?.subject}</h2>
          <p className="text-muted-foreground">
            {quizFile?.topic} - Study Mode
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Exit Study
        </Button>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <p className="text-sm text-muted-foreground">
            Score: {score}/{currentQuestionIndex + (submitted ? 1 : 0)}
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
              const isSelected = selectedAnswer === option;
              const isCorrectOption =
                option === currentQuestion.correctAnswer.toUpperCase();

              let borderColor = "border-gray-200";
              let bgColor = "hover:bg-muted";

              if (submitted) {
                if (isCorrectOption) {
                  borderColor = "border-green-500 bg-green-50";
                  bgColor = "";
                } else if (isSelected && !isCorrect) {
                  borderColor = "border-red-500 bg-red-50";
                  bgColor = "";
                }
              } else if (isSelected) {
                borderColor = "border-blue-500 bg-blue-50";
                bgColor = "";
              }

              return (
                <label
                  key={option}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${borderColor} ${bgColor}`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={isSelected}
                    onChange={() => handleAnswerSelect(option)}
                    disabled={submitted}
                    className="mr-3"
                  />
                  <span className="font-medium mr-2">{option}.</span>
                  <span>{optionText}</span>
                </label>
              );
            })}
          </div>

          {/* Feedback */}
          {submitted && (
            <div className="space-y-3 mt-6 pt-6 border-t">
              <div
                className={`p-4 rounded-lg ${
                  isCorrect
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <p
                  className={`font-semibold ${
                    isCorrect ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-semibold">Correct Answer:</span>{" "}
                  {currentQuestion.correctAnswer}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="font-semibold text-blue-700 mb-2">Explanation:</p>
                <p className="text-sm text-blue-900">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          )}
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
          {!submitted ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={!isAnswered}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Answer
            </Button>
          ) : currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={handleNext}>Next Question</Button>
          ) : (
            <Button
              onClick={handleFinish}
              className="bg-green-600 hover:bg-green-700"
            >
              Finish Study Session
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
