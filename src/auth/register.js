import { auth, db } from "../firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  setDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { showMessage } from "../utils/notification.js";

document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Registration form submitted");

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value; // CHANGED: Get selected role from dropdown

    // ✅ Basic input validation
    if (!name) {
      showMessage("⚠️ Name is required", "error");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      showMessage("⚠️ Please enter a valid email address", "error");
      return;
    }
    if (password.length < 6) {
      showMessage("⚠️ Password should be at least 6 characters long", "error");
      return;
    }

    try {
      // ✅ Register user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // ✅ Save user info in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role, // CHANGED: Use selected role from dropdown
        approved: false, // All roles need admin approval
      });
      console.log("✅ Firestore document created for :", user.uid); // CHANGED: fixed log to use user.uid

      showMessage(
        "🎉 Registration successful! Please wait for admin approval.",
        "success"
      );
      setTimeout(() => {
        window.location.href = "login.html"; // redirect to login after 2s
      }, 2000);
    } catch (error) {
      // CHANGED: fixed variable name to 'error' for catch block
      console.error("Firestore write failed :", error);
      showMessage("❌ Failed to save user profile. Contact admin.", "error");

      if (error.code === "auth/email-already-in-use") {
        showMessage("❌ This email is already registered", "error");
      } else if (error.code === "auth/invalid-email") {
        showMessage("❌ Invalid email format", "error");
      } else if (error.code === "auth/weak-password") {
        showMessage("❌ Password should be at least 6 characters", "error");
      } else {
        showMessage("❌ " + error.message, "error");
      }
    }
  });
