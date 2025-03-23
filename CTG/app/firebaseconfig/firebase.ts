import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyApm46rGVqpdxHSBuDYNecvsKm0si62UJE",
  authDomain: "c2gapp2.firebaseapp.com",
  databaseURL: "https://c2gapp2-default-rtdb.firebaseio.com",
  projectId: "c2gapp2",
  storageBucket: "c2gapp2.firebasestorage.app",
  messagingSenderId: "603103989154",
  appId: "1:603103989154:web:47000a29aa40d25752f6fb",
  measurementId: "G-P0JM3FQR5B"
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);
export const auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
export default app;
export { functions, httpsCallable };