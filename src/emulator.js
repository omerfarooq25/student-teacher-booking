// Lightweight helper to connect Firebase SDKs to local emulators during development.
// Usage patterns (pick one):
// 1) Set `window.USE_FIREBASE_EMULATOR = true` before importing `src/firebase.js`.
// 2) Append `?useFirebaseEmulator=1` to the URL while developing.
// 3) Call `enableEmulators()` exported from `src/firebase.js` at runtime.

export async function connectEmulators({
  auth,
  db,
  host = "localhost",
  authPort = 9099,
  firestorePort = 8080,
} = {}) {
  if (!auth || !db) {
    throw new Error("connectEmulators requires { auth, db } instances");
  }

  // Import emulator connectors from the CDN-compatible SDK entrypoints.
  const [{ connectAuthEmulator }, { connectFirestoreEmulator }] =
    await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"),
    ]);

  // Connect auth emulator
  const authUrl = `http://${host}:${authPort}`;
  connectAuthEmulator(auth, authUrl);

  // Connect firestore emulator
  connectFirestoreEmulator(db, host, firestorePort);

  console.info(
    `Connected Auth emulator at ${authUrl} and Firestore emulator at ${host}:${firestorePort}`
  );
  return { authUrl, firestoreHost: host, firestorePort };
}

// Helper to connect a functions instance (call from modules that create a functions instance)
export async function connectFunctionsEmulatorFor(
  functionsInstance,
  host = "localhost",
  port = 5001
) {
  if (!functionsInstance) throw new Error("functionsInstance required");
  const { connectFunctionsEmulator } = await import(
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js"
  );
  connectFunctionsEmulator(functionsInstance, host, port);
  console.info(`Connected Functions emulator at ${host}:${port}`);
}

// Convenience: detect whether emulators should be used based on environment
export function shouldUseEmulator() {
  try {
    if (typeof window === "undefined") return false;
    if (
      window.USE_FIREBASE_EMULATOR === true ||
      window.USE_FIREBASE_EMULATOR === "true"
    )
      return true;
    const params = new URLSearchParams(window.location.search);
    if (params.get("useFirebaseEmulator") === "1") return true;
    // Default to true on localhost to make local dev easier (but require explicit opt-in above if you prefer)
    if (
      window.location &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
    )
      return true;
    return false;
  } catch (e) {
    return false;
  }
}
