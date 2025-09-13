console.log("Teacher dashboard loaded");

import { auth, db } from "../firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const appointmentsTable = document
  .getElementById("appointmentsTable")
  .querySelector("tbody");
let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists() || userDoc.data().role !== "teacher") {
      alert("Access denied!");
      window.location.href = "../auth/login.html";
      return;
    }
    const userData = userDoc.data();
    if (userData.blocked) {
      document.getElementById("appointmentsTable").parentElement.style.display =
        "none";
      document.getElementById("messageContainer").textContent =
        "🚫 Your account has been blocked by the admin. You cannot manage appointments.";
      return;
    }
    currentUser = user;
    await loadAppointments(user.uid);
  } else {
    window.location.href = "../auth/login.html";
  }
});

async function loadAppointments(teacherId) {
  const q = query(
    collection(db, "appointments"),
    where("teacherId", "==", teacherId),
    // 💡 Order by timestamp to show newest requests first
    orderBy("timestamp", "desc")
  );
  const snapshot = await getDocs(q);

  appointmentsTable.innerHTML = "";

  for (const docSnap of snapshot.docs) {
    const appointment = docSnap.data();
    const studentDoc = await getDoc(doc(db, "users", appointment.studentId));
    const studentName = studentDoc.exists()
      ? studentDoc.data().name
      : "Unknown";

    const row = document.createElement("tr");
    let statusDisplay =
      appointment.status === "pending"
        ? "🟡 Pending"
        : appointment.status === "accepted"
        ? "🟢 Accepted"
        : "🔴 Rejected";
    let actionsDisplay = "-";
    if (appointment.status === "pending") {
      actionsDisplay = `<button class='accept' onclick=\"updateStatus('${docSnap.id}', 'accepted')\">✅ Accept</button>
           <button class='reject' onclick=\"updateStatus('${docSnap.id}', 'rejected')\">❌ Reject</button>`;
    } else if (appointment.status === "accepted") {
      actionsDisplay = `<button class='reject' onclick=\"updateStatus('${docSnap.id}', 'rejected')\">❌ Reject</button>
           <button class='schedule' onclick=\"scheduleLater('${docSnap.id}')\">⏳ Schedule Later</button>`;
    } else if (appointment.status === "rejected") {
      actionsDisplay = `<button class='approve' onclick=\"updateStatus('${docSnap.id}', 'accepted')\">✅ Approve</button>
           <button class='schedule' onclick=\"scheduleLater('${docSnap.id}')\">⏳ Schedule Later</button>`;
    }
    // Format appointment date/time and subject for display
    let dateTimeStr =
      appointment.date && appointment.time
        ? `${appointment.date} ${appointment.time}`
        : "-";
    let subjectStr = appointment.subject || "-";
    row.innerHTML = `
      <td>${studentName}</td>
      <td>${dateTimeStr}</td>
      <td>${subjectStr}</td>
      <td>${statusDisplay}</td>
      <td>${actionsDisplay}</td>
    `;
    appointmentsTable.appendChild(row);
  }
}

window.updateStatus = async (appointmentId, status) => {
  await updateDoc(doc(db, "appointments", appointmentId), { status });
  // 💡 Reload appointments for the current user after updating
  loadAppointments(currentUser.uid);
};

// Schedule Later handler (placeholder)
window.scheduleLater = async (appointmentId) => {
  // You can implement a reschedule dialog/modal here
  alert("Feature coming soon: Schedule Later for appointment " + appointmentId);
};

import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    alert("Logged out successfully!");
    window.location.href = "../auth/login.html";
  } catch (error) {
    console.error("Logout failed:", error);
  }
});
