import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCIrdqD6-x4gaUYYQ1T1EZYiwooe10tIvw",
  authDomain: "copper2gold-4f2b4.firebaseapp.com",
  projectId: "copper2gold-4f2b4",
  storageBucket: "copper2gold-4f2b4.firebasestorage.app",
  messagingSenderId: "311709210202",
  appId: "1:311709210202:web:994f7984859c76e81d6a63"
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, { persistence : getReactNativePersistence(AsyncStorage) });
export const db = getFirestore(app);
export default app;
