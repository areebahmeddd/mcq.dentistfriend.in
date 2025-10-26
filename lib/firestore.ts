import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Question {
  id: string;
  fileId: string;
  questionNumber: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
}

export interface QuizFile {
  id: string;
  userId: string;
  fileName: string;
  subject: string;
  topic: string;
  fileUrl: string;
  questionCount: number;
  uploadedAt: string;
}

export interface QuizResult {
  id: string;
  userId: string;
  fileId: string;
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
}

export async function saveQuestions(
  questions: Omit<Question, "id">[],
): Promise<string[]> {
  try {
    const questionIds: string[] = [];

    for (const question of questions) {
      const docRef = await addDoc(collection(db, "questions"), {
        ...question,
        createdAt: Timestamp.now(),
      });
      questionIds.push(docRef.id);
    }

    return questionIds;
  } catch (error) {
    throw error;
  }
}

export async function getQuestionsByFileId(
  fileId: string,
): Promise<Question[]> {
  try {
    const q = query(collection(db, "questions"), where("fileId", "==", fileId));

    const querySnapshot = await getDocs(q);
    const questions = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Question,
    );

    return questions.sort((a, b) => a.questionNumber - b.questionNumber);
  } catch (error) {
    return [];
  }
}

export async function deleteQuestionsByFileId(fileId: string): Promise<void> {
  try {
    const q = query(collection(db, "questions"), where("fileId", "==", fileId));

    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    throw error;
  }
}

export async function saveQuizFile(
  quizFile: Omit<QuizFile, "id">,
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "quizFiles"), {
      ...quizFile,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
}

export async function getQuizFiles(): Promise<QuizFile[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "quizFiles"));
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as QuizFile,
    );
  } catch (error) {
    return [];
  }
}

export async function getQuizFilesByUserId(
  userId: string,
): Promise<QuizFile[]> {
  try {
    const q = query(collection(db, "quizFiles"), where("userId", "==", userId));

    const querySnapshot = await getDocs(q);
    const files = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as QuizFile,
    );

    return files.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    );
  } catch (error) {
    return [];
  }
}

export async function getQuizFileById(
  fileId: string,
): Promise<QuizFile | null> {
  try {
    const docRef = doc(db, "quizFiles", fileId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as QuizFile;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function deleteQuizFile(fileId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "quizFiles", fileId));
    await deleteQuestionsByFileId(fileId);
  } catch (error) {
    throw error;
  }
}

export async function saveQuizResult(
  result: Omit<QuizResult, "id">,
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "results"), {
      ...result,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
}

export async function getResultsByUserId(
  userId: string,
): Promise<QuizResult[]> {
  try {
    const q = query(collection(db, "results"), where("userId", "==", userId));

    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as QuizResult,
    );

    return results.sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );
  } catch (error) {
    return [];
  }
}

export async function getResultsByFileId(
  fileId: string,
): Promise<QuizResult[]> {
  try {
    const q = query(collection(db, "results"), where("fileId", "==", fileId));

    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as QuizResult,
    );

    return results.sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );
  } catch (error) {
    return [];
  }
}
