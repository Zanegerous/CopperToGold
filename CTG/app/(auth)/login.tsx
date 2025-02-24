import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "../firebaseconfig/firebase";

// Login function with error handling and email verification check
export const loginWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if the user's email is verified
    if (!user.emailVerified) {
      // Sign out the user if not verified
      await auth.signOut();
      throw new Error("Please verify your email before logging in.");
    }
    return { user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

// Centralized function to handle login logic remains the same
export const handleLogin = async (email: string, password: string) => {
  const { user, error } = await loginWithEmailAndPassword(email, password);

  if (error) {
    const firebaseError = error as FirebaseError;
    if (firebaseError.code === "auth/invalid-email") {
      return { success: false, message: "Invalid email format." };
    }
    if (firebaseError.code === "auth/wrong-password") {
      return { success: false, message: "Incorrect password." };
    }
    if (firebaseError.code === "auth/user-not-found") {
      return { success: false, message: "No account found with this email." };
    }
    // Catch our manual error as well
    if (error instanceof Error && error.message === "Please verify your email before logging in.") {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred." };
  }

  return { success: true, user };
};
