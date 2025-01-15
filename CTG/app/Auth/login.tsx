// Auth/login.tsx
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseconfig/firebase";

export const loginWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};
