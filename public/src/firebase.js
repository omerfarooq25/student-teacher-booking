import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// Emulators removed — this app will use live Firebase by default.

// Try to import developer-provided config from src/firebase.config.js
let firebaseConfig = null;
let app = null;
let _auth = null;
let _db = null;
let firebaseAvailable = false;

try {
  // Prefer a developer-provided config at `src/firebase.config.js` (one level above public)
  // so developers can keep their working config outside the public folder.
  (async () => {
    try {
      const local = await import("../../src/firebase.config.js");
      firebaseConfig = local.firebaseConfig;
    } catch (e) {
      // If not present, fall back to the public placeholder `public/src/firebase.config.js`
      const pub = await import("./firebase.config.js");
      firebaseConfig = pub.firebaseConfig;
    }

    if (firebaseConfig) {
      app = initializeApp(firebaseConfig);
      _auth = getAuth(app);
      _db = getFirestore(app);
      firebaseAvailable = true;
    }
  })();
} catch (err) {
  // Don't throw. Allow the app to load so pages render — but mark Firebase unavailable.
  console.warn(
    "Firebase config not found. Create `src/firebase.config.js` by copying `src/firebase.example.js` and filling in your Firebase project values.",
    err,
  );
}

export const auth = _auth;
export const db = _db;
export { firebaseAvailable };

// Helper to check if emulator should be used
function shouldUseEmulator() {
  return false; // Disabled by default; use live Firebase
}

// Helper to connect to emulators
async function connectEmulators({ auth, db, ...options } = {}) {
  // Emulator connection disabled for production use
  console.info("Emulator connection disabled");
}

// Helper to connect functions emulator
async function connectFunctionsEmulatorFor(functionsInstance, host, port) {
  // Emulator connection disabled for production use
  console.info("Functions emulator connection disabled");
}

// Optional exported helper to enable local emulators programmatically.
export async function enableEmulators(options = {}) {
  try {
    // Only connect emulators when the developer explicitly opts in (avoid accidental emulator usage).
    if (firebaseAvailable && shouldUseEmulator()) {
      await connectEmulators({ auth, db, ...options });
    } else {
      console.info("Emulator connection skipped; not opted-in.");
    }
  } catch (err) {
    console.warn("Failed to connect emulators:", err);
  }
}

// Small helper used by modules that create a functions instance to connect to the functions emulator.
export async function enableFunctionsEmulator(
  functionsInstance,
  host = "localhost",
  port = 5001,
) {
  try {
    // Only connect functions emulator when explicitly opted-in.
    if (firebaseAvailable && shouldUseEmulator()) {
      await connectFunctionsEmulatorFor(functionsInstance, host, port);
    } else {
      console.info("Functions emulator connection skipped; not opted-in.");
    }
  } catch (err) {
    console.warn("Failed to connect functions emulator:", err);
  }
}
