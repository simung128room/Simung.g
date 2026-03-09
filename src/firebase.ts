import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCDqVHDvDUS3ggVScKCKvzswr8mNPl_BLo",
  authDomain: "hausu-7b3b9.firebaseapp.com",
  projectId: "hausu-7b3b9",
  storageBucket: "hausu-7b3b9.firebasestorage.app",
  messagingSenderId: "616000563064",
  appId: "1:616000563064:web:3e2c4679d19ef4645e4a8d",
  measurementId: "G-YL5TNJ3DLN"
};

export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
