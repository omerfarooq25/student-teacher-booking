Firebase Functions for student-teacher-booking

Files:

- `index.js` - contains a callable function `deleteUserAndData` for admin-only deletion of users and related appointments.
- `package.json` - dependencies and convenient scripts.

Usage:

1. Install dependencies: `npm install` inside the `functions` directory.
2. Login and initialize Firebase in your project if you haven't: `firebase login` and `firebase init functions`.
3. Use the emulator for local testing: `npm run serve` (requires Firebase CLI).
4. Deploy functions: `npm run deploy` (requires Firebase project setup and credentials).

Security:

- The callable function verifies the caller's role by reading the callers' `users/{uid}` document. Ensure Firestore rules allow this read for authenticated users.
- Only admins (role === 'admin') are allowed to call the function.
