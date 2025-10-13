# Server-side: Firestore rules & Cloud Functions

This repository includes a starting point for server-side security and admin-only operations.

Files added:

- `firestore.rules` — Suggested Firestore security rules. They enforce role-based access:

  - Students can create and read their own appointments (if approved and not blocked).
  - Teachers can read and update their own appointments.
  - Admins can read/update/delete users and all appointments.

- `functions/` — Firebase Functions scaffold (Node 18) containing a callable function `deleteUserAndData`:
  - Verifies the caller's role via the Firestore `users/{uid}` document.
  - Deletes the target user's Firestore document and related appointments.
  - Deletes the target user from Firebase Authentication using the Admin SDK.

## Local testing & deployment

1. Install dependencies for functions:

```bash
cd functions
npm install
```

2. If you haven't initialized Firebase in this project, run:

```bash
firebase login
firebase init functions
```

3. Start the Firebase emulator for functions (recommended for local testing):

```bash
npm run serve
```

4. Deploy functions to your Firebase project when ready:

```bash
npm run deploy
```

## How to use the callable function from the client

Client-side example (JavaScript):

```javascript
import {
  getFunctions,
  httpsCallable,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";
const functions = getFunctions();
const deleteUser = httpsCallable(functions, "deleteUserAndData");
try {
  const resp = await deleteUser({ uid: "USER_TO_DELETE_UID" });
  console.log(resp.data);
} catch (err) {
  console.error(err);
}
```

## Security notes

- Always validate admin roles server-side in functions — do not trust client data.
- Review and tailor `firestore.rules` to your exact data model before deploying.
- Rotate API keys and review Firebase project access if configuration was previously committed publicly.
