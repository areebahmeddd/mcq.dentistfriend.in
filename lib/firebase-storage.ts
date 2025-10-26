import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./firebase";

export async function uploadExcelFile(
  file: File,
  userId: string,
  fileId: string
): Promise<string> {
  try {
    const storageRef = ref(
      storage,
      `users/${userId}/quiz-files/${fileId}/original.xlsx`
    );

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    throw error;
  }
}

export async function getFileDownloadURL(
  userId: string,
  fileId: string
): Promise<string> {
  try {
    const storageRef = ref(
      storage,
      `users/${userId}/quiz-files/${fileId}/original.xlsx`
    );
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    throw error;
  }
}

export async function deleteExcelFile(
  userId: string,
  fileId: string
): Promise<void> {
  try {
    const storageRef = ref(
      storage,
      `users/${userId}/quiz-files/${fileId}/original.xlsx`
    );
    await deleteObject(storageRef);
  } catch (error) {
    throw error;
  }
}

export function generateFileId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
