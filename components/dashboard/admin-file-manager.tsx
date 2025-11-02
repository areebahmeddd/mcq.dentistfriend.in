"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteQuizFile, getQuizFiles, type QuizFile } from "@/lib/firestore";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronRight,
  FileText,
  FolderOpen,
  Maximize2,
  Minimize2,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface TopicGroup {
  subject: string;
  topics: {
    topic: string;
    files: QuizFile[];
  }[];
}

export default function AdminFileManager() {
  const [files, setFiles] = useState<QuizFile[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: "file" | "topic" | "subject";
    id?: string;
    name: string;
    fileIds: string[];
  } | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const filesData = await getQuizFiles();
      setFiles(filesData);
      // Auto-expand first subject
      if (filesData.length > 0 && expandedSubjects.size === 0) {
        setExpandedSubjects(new Set([filesData[0].subject]));
      }
    } catch (error) {
      console.error("Failed to load files:", error);
    }
  };

  // Group files by subject and topic
  const groupedTopics: TopicGroup[] = files.reduce((acc, file) => {
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

  // Sort subjects and topics alphabetically
  groupedTopics.sort((a, b) => a.subject.localeCompare(b.subject));
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

  const expandAll = () => {
    setExpandedSubjects(new Set(groupedTopics.map((g) => g.subject)));
  };

  const collapseAll = () => {
    setExpandedSubjects(new Set());
  };

  const getTotalQuestionsForSubject = (subjectGroup: TopicGroup) => {
    return subjectGroup.topics.reduce(
      (sum, topic) =>
        sum +
        topic.files.reduce((fileSum, file) => fileSum + file.questionCount, 0),
      0,
    );
  };

  const handleDeleteFile = (file: QuizFile) => {
    setItemToDelete({
      type: "file",
      id: file.id,
      name: `${file.fileName}`,
      fileIds: [file.id],
    });
    setDeleteDialogOpen(true);
  };

  const handleDeleteTopic = (
    subject: string,
    topic: string,
    files: QuizFile[],
  ) => {
    setItemToDelete({
      type: "topic",
      name: `${subject} - ${topic}`,
      fileIds: files.map((f) => f.id),
    });
    setBulkDeleteDialogOpen(true);
  };

  const handleDeleteSubject = (subjectGroup: TopicGroup) => {
    const allFiles = subjectGroup.topics.flatMap((t) => t.files);
    setItemToDelete({
      type: "subject",
      name: subjectGroup.subject,
      fileIds: allFiles.map((f) => f.id),
    });
    setBulkDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setLoading(true);
    try {
      // Delete all files
      await Promise.all(itemToDelete.fileIds.map((id) => deleteQuizFile(id)));
      await loadFiles();
      setDeleteDialogOpen(false);
      setBulkDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No files uploaded yet. Upload some files to get started!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Summary Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Total Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{groupedTopics.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Total Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {groupedTopics.reduce((sum, g) => sum + g.topics.length, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Total Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {files.reduce((sum, f) => sum + f.questionCount, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Control buttons */}
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

        {/* Hierarchical File List */}
        <div className="space-y-3">
          {groupedTopics.map((subjectGroup) => {
            const isExpanded = expandedSubjects.has(subjectGroup.subject);
            const totalQuestions = getTotalQuestionsForSubject(subjectGroup);
            const topicCount = subjectGroup.topics.length;
            const fileCount = subjectGroup.topics.reduce(
              (sum, t) => sum + t.files.length,
              0,
            );

            return (
              <Card key={subjectGroup.subject} className="overflow-hidden">
                {/* Subject Header */}
                <div className="border-b">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => toggleSubject(subjectGroup.subject)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <FolderOpen className="h-5 w-5 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">
                          {subjectGroup.subject}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {topicCount} topic{topicCount !== 1 ? "s" : ""} •{" "}
                          {fileCount} file{fileCount !== 1 ? "s" : ""} •{" "}
                          {totalQuestions} questions
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubject(subjectGroup);
                      }}
                      disabled={loading}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Topics and Files */}
                {isExpanded && (
                  <div className="p-4 bg-accent/20 space-y-3">
                    {subjectGroup.topics.map((topicGroup) => (
                      <div
                        key={topicGroup.topic}
                        className="space-y-2 p-3 bg-background rounded-lg border"
                      >
                        {/* Topic Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-sm">
                              {topicGroup.topic}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {topicGroup.files.length} file
                              {topicGroup.files.length !== 1 ? "s" : ""}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {topicGroup.files.reduce(
                                (sum, f) => sum + f.questionCount,
                                0,
                              )}{" "}
                              questions
                            </Badge>
                          </div>
                          {topicGroup.files.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteTopic(
                                  subjectGroup.subject,
                                  topicGroup.topic,
                                  topicGroup.files,
                                )
                              }
                              disabled={loading}
                              className="text-destructive hover:text-destructive text-xs"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete All
                            </Button>
                          )}
                        </div>

                        {/* Files under this topic */}
                        <div className="ml-6 space-y-2">
                          {topicGroup.files.map((file) => (
                            <Card
                              key={file.id}
                              className="border-l-4 border-l-primary/50"
                            >
                              <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <CardTitle className="text-sm">
                                      {file.fileName}
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-1 flex items-center gap-3">
                                      <span className="flex items-center gap-1">
                                        <BarChart3 className="h-3 w-3" />
                                        {file.questionCount} questions
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(
                                          file.uploadedAt,
                                        ).toLocaleDateString()}
                                      </span>
                                    </CardDescription>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteFile(file)}
                                    disabled={loading}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Delete Single File Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{itemToDelete?.name}</strong>? All associated questions
              will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete {itemToDelete?.type === "subject" ? "Subject" : "Topic"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-2">
                You are about to delete <strong>{itemToDelete?.name}</strong>{" "}
                which contains:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>{itemToDelete?.fileIds.length}</strong> file
                  {itemToDelete?.fileIds.length !== 1 ? "s" : ""}
                </li>
                <li>All associated questions and data</li>
              </ul>
              <p className="mt-3 text-destructive font-semibold">
                This action cannot be undone!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Deleting..." : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
