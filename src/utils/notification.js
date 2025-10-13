export function showMessage(message, type = "info") {
  let container = document.getElementById("messageContainer");

  // If container does not exist, create one at the top of <body>
  if (!container) {
    container = document.createElement("div");
    container.id = "messageContainer";
    container.style.position = "fixed";
    container.style.top = "20px";
    container.style.right = "20px";
    container.style.zIndex = "1000";
    document.body.appendChild(container);
  }

  container.innerHTML = `
    <div class="message ${type}" 
         style="padding: 10px; border-radius: 5px; margin-bottom: 10px; background: ${
           type === "success"
             ? "#4CAF50"
             : type === "error"
             ? "#f44336"
             : "#2196F3"
         }; color: white; font-weight: bold;">
      ${message}
    </div>
  `;

  // Create message element safely
  const msgEl = document.createElement("div");
  msgEl.className = `message ${type}`;
  msgEl.style.padding = "10px";
  msgEl.style.borderRadius = "5px";
  msgEl.style.marginBottom = "10px";
  msgEl.style.background =
    type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#2196F3";
  msgEl.style.color = "white";
  msgEl.style.fontWeight = "bold";
  msgEl.textContent = message;

  // Clear previous and show new
  container.innerHTML = "";
  container.appendChild(msgEl);

  // Auto hide after 3 seconds
  setTimeout(() => {
    if (container.contains(msgEl)) container.removeChild(msgEl);
  }, 3000);
}
