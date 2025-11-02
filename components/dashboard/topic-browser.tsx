"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { QuizFile, QuizResult } from "@/lib/firestore";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  FolderOpen,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useState } from "react";

interface TopicBrowserProps {
  quizFiles: QuizFile[];
  results: QuizResult[];
  onSelectQuiz: (quizId: string) => void;
}

interface TopicGroup {
  subject: string;
  topics: {
    topic: string;
    files: QuizFile[];
  }[];
}

export default function TopicBrowser({
  quizFiles,
  results,
  onSelectQuiz,
}: TopicBrowserProps) {
  // Auto-expand the first subject by default for better UX
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(() => {
    if (quizFiles.length > 0) {
      return new Set([quizFiles[0].subject]);
    }
    return new Set();
  });

  // Group files by subject and topic
  const groupedTopics: TopicGroup[] = quizFiles.reduce((acc, file) => {
    let subjectGroup = acc.find((g) => g.subject === file.subject);

    if (!subjectGroup) {
      subjectGroup = { subject: file.subject, topics: [] };
      acc.push(subjectGroup);
    }

    let topicGroup = subjectGroup.topics.find((t) => t.topic === file.topic);

    if (!topicGroup) {
      topicGroup = { topic: file.topic, files: [] };
      subjectGroup.topics.push(topicGroup);
    }

    topicGroup.files.push(file);
    return acc;
  }, [] as TopicGroup[]);

  // Sort subjects alphabetically
  groupedTopics.sort((a, b) => a.subject.localeCompare(b.subject));

  // Sort topics within each subject
  groupedTopics.forEach((group) => {
    group.topics.sort((a, b) => a.topic.localeCompare(b.topic));
  });

  const toggleSubject = (subject: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subject)) {
      newExpanded.delete(subject);
    } else {
      newExpanded.add(subject);
    }
    setExpandedSubjects(newExpanded);
  };

  const getTotalQuestionsForSubject = (subjectGroup: TopicGroup) => {
    return subjectGroup.topics.reduce(
      (sum, topic) =>
        sum +
        topic.files.reduce((fileSum, file) => fileSum + file.questionCount, 0),
      0,
    );
  };

  const getBestScoreForFile = (fileId: string) => {
    const fileResults = results.filter((r) => r.fileId === fileId);
    if (fileResults.length === 0) return null;
    return Math.max(...fileResults.map((r) => r.percentage));
  };

  const getAttemptsForFile = (fileId: string) => {
    return results.filter((r) => r.fileId === fileId).length;
  };

  const expandAll = () => {
    setExpandedSubjects(new Set(groupedTopics.map((g) => g.subject)));
  };

  const collapseAll = () => {
    setExpandedSubjects(new Set());
  };

  if (quizFiles.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No quiz files available yet. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Control buttons - only show if there are multiple subjects */}
      {groupedTopics.length > 1 && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={expandAll}
            className="text-xs"
          >
            <Maximize2 className="h-3 w-3 mr-1" />
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAll}
            className="text-xs"
          >
            <Minimize2 className="h-3 w-3 mr-1" />
            Collapse All
          </Button>
        </div>
      )}

      {groupedTopics.map((subjectGroup) => {
        const isExpanded = expandedSubjects.has(subjectGroup.subject);
        const totalQuestions = getTotalQuestionsForSubject(subjectGroup);
        const topicCount = subjectGroup.topics.length;

        return (
          <Card key={subjectGroup.subject} className="overflow-hidden">
            {/* Subject Header - Clickable Folder */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors border-b"
              onClick={() => toggleSubject(subjectGroup.subject)}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform" />
                  )}
                  <FolderOpen className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {subjectGroup.subject}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {topicCount} topic{topicCount !== 1 ? "s" : ""} •{" "}
                    {totalQuestions} total questions
                  </p>
                </div>
              </div>
            </div>

            {/* Topics List - Collapsible */}
            {isExpanded && (
              <div className="p-4 bg-accent/20 space-y-2">
                {subjectGroup.topics.map((topicGroup) => (
                  <div key={topicGroup.topic} className="space-y-2">
                    {/* Topic Name */}
                    <div className="flex items-center gap-2 px-2 py-1">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm">
                        {topicGroup.topic}
                      </span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {topicGroup.files.reduce(
                          (sum, f) => sum + f.questionCount,
                          0,
                        )}{" "}
                        questions
                      </Badge>
                    </div>

                    {/* Files under this topic */}
                    <div className="ml-8 space-y-2">
                      {topicGroup.files.map((file) => {
                        const bestScore = getBestScoreForFile(file.id);
                        const attempts = getAttemptsForFile(file.id);

                        return (
                          <Card
                            key={file.id}
                            className="hover:shadow-md transition-shadow border-l-4 border-l-primary/50"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-base">
                                    {file.fileName.replace(".xlsx", "")}
                                  </CardTitle>
                                  <CardDescription className="text-xs mt-1">
                                    {file.questionCount} questions
                                  </CardDescription>
                                </div>
                                {bestScore !== null && (
                                  <Badge
                                    variant={
                                      bestScore >= 70
                                        ? "default"
                                        : "destructive"
                                    }
                                    className="ml-2"
                                  >
                                    {bestScore.toFixed(1)}%
                                  </Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-3">
                              {attempts > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  📊 Attempts: {attempts}
                                </p>
                              )}
                              <Button
                                className="w-full"
                                size="sm"
                                onClick={() => onSelectQuiz(file.id)}
                              >
                                {attempts > 0
                                  ? "Practice Again"
                                  : "Start Practice"}
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
