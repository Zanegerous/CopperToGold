import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseconfig/firebase";

export const registerWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};
