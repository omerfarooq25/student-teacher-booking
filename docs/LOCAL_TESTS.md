# Local testing (functions)

## Prerequisites

- Node.js 18+
- Firebase CLI (for emulator testing): `npm install -g firebase-tools`

## Run unit tests (Mocha)

```bash
cd functions
npm ci
npm test
```

## Run functions emulator

```bash
cd functions
npm ci
firebase emulators:start --only functions
```

## Call functions from client during local testing

If running the emulator, configure the client to point to the emulator for functions, e.g. in your browser console:

```js
import {
  getFunctions,
  connectFunctionsEmulator,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";
const functions = getFunctions();
connectFunctionsEmulator(functions, "localhost", 5001);
```

Replace `localhost:5001` with your emulator host/port as shown by the emulator output.
