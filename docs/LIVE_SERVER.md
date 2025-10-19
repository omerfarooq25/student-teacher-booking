# Preview with VS Code Live Server

Quick steps to preview the site inside VS Code using Live Server (or Live Preview):

1. Install the recommended extension(s) by opening the Extensions view (⇧⌘X / Ctrl+Shift+X) and installing "Live Server" (ritwickdey.LiveServer) or "Live Server Preview".
2. Open this repository folder in VS Code.
3. Open the `public/index.html` file in the editor.
4. Click "Go Live" in the bottom-right (Live Server) or use the Live Preview command.

Notes & troubleshooting:

- The workspace is configured to serve the `public/` folder as the site root (see `.vscode/settings.json`). If CSS doesn't load, make sure your HTML links are root-aware (for example `styles.css` when opening `public/index.html` or `/styles.css` when running from server root).
- If Live Server uses a different port, check the server URL printed in the VS Code output and open it in your browser.
- If you still see unstyled pages, ensure you opened the page via the http:// URL (Live Server) rather than file://
