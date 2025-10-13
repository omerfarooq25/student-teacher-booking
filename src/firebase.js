import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Try to import developer-provided config from src/firebase.config.js
let firebaseConfig;
try {
  // This import will only succeed if the developer copies the example to src/firebase.config.js
  // and fills in their project config. The real config file should be in .gitignore.
  // Use dynamic import so that missing file results in a catchable error.
  const mod = await import("./firebase.config.js");
  firebaseConfig = mod.firebaseConfig;
} catch (err) {
  console.error(
    "Missing Firebase config. Create `src/firebase.config.js` by copying `src/firebase.example.js` and filling in your Firebase project values.\nError:",
    err
  );
  throw new Error(
    "Firebase configuration missing. See src/firebase.example.js for instructions."
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
