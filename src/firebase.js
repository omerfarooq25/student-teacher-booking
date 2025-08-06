import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDjNKXxv39YqpO2WLiVCJC13n_dFLbgkQs",
  authDomain: "student-teacher-booking-1c493.firebaseapp.com",
  projectId: "student-teacher-booking-1c493",
  storageBucket: "student-teacher-booking-1c493.firebasestorage.app",
  messagingSenderId: "805435012135",
  appId: "1:805435012135:web:5fa2807f4b7228bb748a02",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
