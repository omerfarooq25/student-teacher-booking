import { auth, db, firebaseAvailable } from "../../src/firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  setDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { showMessage } from "../utils/notification.js";

document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;

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
      if (!firebaseAvailable) {
        showMessage(
          "⚠️ Firebase is not configured. Create src/firebase.config.js from the example.",
          "error"
        );
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role,
        approved: false
      });

      showMessage(
        "🎉 Registration successful! Please wait for admin approval.",
        "success"
      );
      setTimeout(() => {
        window.location.href = "/auth/login.html";
      }, 2000);
    } catch (error) {
      console.error("Firestore write failed :", error);
      const code = error && error.code ? `(${error.code}) ` : "";
      showMessage(
        `❌ ${code}${
          error.message || "Failed to save user profile. Contact admin."
        }`,
        "error"
      );
      // Additional helpful messages for common auth errors
      if (error && error.code === "auth/email-already-in-use") {
        showMessage(
          "❌ (auth/email-already-in-use) This email is already registered",
          "error"
        );
      } else if (error && error.code === "auth/invalid-email") {
        showMessage("❌ (auth/invalid-email) Invalid email format", "error");
      } else if (error && error.code === "auth/weak-password") {
        showMessage(
          "❌ (auth/weak-password) Password should be at least 6 characters",
          "error"
        );
      } else if (error && error.code === "auth/network-request-failed") {
        showMessage(
          "❌ (auth/network-request-failed) Network error contacting Firebase. If you are using the local emulator, start it: `firebase emulators:start --only auth,firestore,functions`.",
          "error"
        );
      }
    }
  });
