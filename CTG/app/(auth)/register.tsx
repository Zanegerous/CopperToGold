import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseconfig/firebase";

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation regex
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const registerWithEmailAndPassword = async (email: string, password: string, sec_question: string, sec_answer: string) => {
  // Validate email and password
  if (!emailRegex.test(email)) {
    return { user: null, error: "Invalid email format." };
  }

  if (!passwordRegex.test(password)) {
    return {
      user: null,
      error: "Password must be at least 8 characters long, include at least one uppercase letter, one number, and one special character.",
    };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};
