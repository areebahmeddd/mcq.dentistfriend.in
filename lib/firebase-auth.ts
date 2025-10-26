import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

export function convertFirebaseUser(
  firebaseUser: FirebaseUser,
  userData?: any
): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || "",
    isAdmin: userData?.isAdmin || false,
    createdAt: userData?.createdAt || new Date().toISOString(),
  };
}

export async function createUserDocument(user: User) {
  try {
    await setDoc(doc(db, "users", user.id), {
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    });
  } catch (error) {
    throw error;
  }
}

export async function getUserDocument(userId: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        id: userId,
        email: userData.email,
        isAdmin: userData.isAdmin || false,
        createdAt: userData.createdAt,
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function signUp(
  email: string,
  password: string,
  isAdmin: boolean = false
): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      isAdmin,
      createdAt: new Date().toISOString(),
    };

    await createUserDocument(user);
    return user;
  } catch (error) {
    throw error;
  }
}

export async function signIn(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    const userData = await getUserDocument(firebaseUser.uid);
    if (!userData) {
      throw new Error("User document not found");
    }

    return userData;
  } catch (error) {
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userData = await getUserDocument(firebaseUser.uid);
      callback(userData);
    } else {
      callback(null);
    }
  });
}

export function getCurrentUser(): User | null {
  return auth.currentUser
    ? {
        id: auth.currentUser.uid,
        email: auth.currentUser.email || "",
        isAdmin: false,
        createdAt: new Date().toISOString(),
      }
    : null;
}
