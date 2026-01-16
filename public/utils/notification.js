export function showMessage(message, type = "info") {
  let container = document.getElementById("messageContainer");

  if (!container) {
    container = document.createElement("div");
    container.id = "messageContainer";
    container.style.position = "fixed";
    container.style.top = "20px";
    container.style.right = "20px";
    container.style.zIndex = "1000";
    document.body.appendChild(container);
  }

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

  container.innerHTML = "";
  container.appendChild(msgEl);

  setTimeout(() => {
    if (container.contains(msgEl)) container.removeChild(msgEl);
  }, 3000);
}
