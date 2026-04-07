import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCVkF4lHq1YsWDVXU7eozDdYaQSUfpHbXs",
  authDomain: "resume-match-nlp.firebaseapp.com",
  projectId: "resume-match-nlp",
  storageBucket: "resume-match-nlp.firebasestorage.app",
  messagingSenderId: "920396550940",
  appId: "1:920396550940:web:7f3627074cfacd9d78e0d9",
  measurementId: "G-4BSXXVQPKV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
