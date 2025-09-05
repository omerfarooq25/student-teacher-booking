import { auth, db } from "../firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  getDoc,
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
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Get user role from Firestore
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const role = docSnap.data().role;

      if (role === "admin") {
        window.location.href = "../admin/dashboard.html";
      } else if (role === "teacher") {
        window.location.href = "../teacher/dashboard.html";
      } else {
        window.location.href = "../student/dashboard.html";
      }
    } else {
      alert("No role assigned to this account.");
    }
  } catch (error) {
    showMessage(` ❌ ${error.message}`, "error");
    console.error(error);
  }
});
