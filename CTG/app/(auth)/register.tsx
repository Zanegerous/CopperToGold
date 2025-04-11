import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebaseconfig/firebase";
import { ref as dbRef, getDatabase, remove, set } from 'firebase/database'
import { useState } from "react";


// Sets up basic user info on account creation
export const userSetup = async (user: any, userLevel: string) => {
  const database = getDatabase();
  const userUID = user.uid;
  const saveRef = `users/${userUID}/Account/`
  const itemRef = dbRef(database, saveRef);
  try {
    await set(itemRef, {
      securityLevel: userLevel,
      allowedQuery: 20,
      allowedTextSearch: 20
    });
  } catch (error: any) {
    console.error("Account Setup Error: ", error);
  }
}


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
    // Send verification email
    await sendEmailVerification(userCredential.user);

    userSetup(userCredential.user, 'user');
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};
