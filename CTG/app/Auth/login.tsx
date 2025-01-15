import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app"; // Import FirebaseError
import { auth } from "../firebaseconfig/firebase";

// Login function with error handling and user response
export const loginWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

// Centralized function to handle login logic
export const handleLogin = async (email: string, password: string) => {
  const { user, error } = await loginWithEmailAndPassword(email, password);

  if (error) {
    const firebaseError = error as FirebaseError; // Explicitly cast the error
    if (firebaseError.code === "auth/invalid-email") {
      return { success: false, message: "Invalid email format." };
    }
    if (firebaseError.code === "auth/wrong-password") {
      return { success: false, message: "Incorrect password." };
    }
    if (firebaseError.code === "auth/user-not-found") {
      return { success: false, message: "No account found with this email." };
    }
    return { success: false, message: "An unknown error occurred." };
  }

  return { success: true, user };
};
