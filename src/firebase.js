import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Production Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB31LFBAHo3Br3Hvih-8xmH7jMnr6BP2WQ",
  authDomain: "scraplink-e4121.firebaseapp.com",
  projectId: "scraplink-e4121",
  storageBucket: "scraplink-e4121.firebasestorage.app",
  messagingSenderId: "416158070492",
  appId: "1:416158070492:web:6052f93175428bacbea619",
  measurementId: "G-KXWBN0C74T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Analytics & Messaging initialized safely (may fail in SSR/Environment-less mode)
let analytics, messaging;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
  try {
    messaging = getMessaging(app);
  } catch (e) {
    console.warn("Messaging failed to init:", e);
  }
}

export { db, messaging, analytics, app, auth, googleProvider };
