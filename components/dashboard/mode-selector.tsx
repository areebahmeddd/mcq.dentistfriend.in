"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ModeSelectorProps {
  onSelectMode: (mode: "study" | "quiz") => void
  onBack: () => void
}

export default function ModeSelector({ onSelectMode, onBack }: ModeSelectorProps) {
  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack}>
        Back to Dashboard
      </Button>

      <div>
        <h2 className="text-3xl font-bold tracking-tight">Select Mode</h2>
        <p className="text-muted-foreground mt-2">Choose how you want to practice</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Study Mode Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelectMode("study")}>
          <CardHeader>
            <CardTitle>Study Mode</CardTitle>
            <CardDescription>Learn at your own pace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Get immediate feedback after each question</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>See correct answers and explanations instantly</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>Learn from mistakes as you go</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>No time pressure</span>
              </p>
            </div>
            <Button className="w-full" onClick={() => onSelectMode("study")}>
              Start Study Mode
            </Button>
          </CardContent>
        </Card>

        {/* Quiz Mode Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelectMode("quiz")}>
          <CardHeader>
            <CardTitle>Quiz Mode</CardTitle>
            <CardDescription>Test your knowledge</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Answer all questions before seeing results</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Get comprehensive score and performance analysis</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Review all answers with explanations at the end</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Track your progress and performance</span>
              </p>
            </div>
            <Button className="w-full" onClick={() => onSelectMode("quiz")}>
              Start Quiz Mode
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
