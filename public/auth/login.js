import { auth, db, firebaseAvailable } from "../../src/firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { showMessage } from "../utils/notification.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    showMessage("❌ Invalid email format.", "error");
    return;
  }

  try {
    if (!firebaseAvailable) {
      showMessage(
        "⚠️ Firebase is not configured. See src/firebase.example.js and create src/firebase.config.js",
        "error"
      );
      return;
    }
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const role = docSnap.data().role;

      if (role === "admin") {
        window.location.href = "/admin/dashboard.html";
      } else if (role === "teacher") {
        window.location.href = "/teacher/dashboard.html";
      } else {
        window.location.href = "/student/dashboard.html";
      }
    } else {
      alert("No role assigned to this account.");
    }
  } catch (error) {
    console.error(error);
    const code = error && error.code ? `(${error.code}) ` : "";
    if (error && error.code === "auth/network-request-failed") {
      showMessage(
        `❌ ${code}Network error contacting Firebase Auth. If you are using the local emulator, start it first: firebase emulators:start --only auth,firestore,functions`,
        "error"
      );
    } else {
      showMessage(`❌ ${code}${error.message}`, "error");
    }
  }
});
