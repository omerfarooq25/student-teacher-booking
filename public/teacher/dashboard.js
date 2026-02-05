console.log("Teacher dashboard loaded");

import { auth, db } from "../src/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc
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

    const tdStudent = document.createElement("td");
    tdStudent.textContent = studentName;
    row.appendChild(tdStudent);

    const dateTimeStr =
      appointment.date && appointment.time
        ? `${appointment.date} ${appointment.time}`
        : "-";
    const tdDate = document.createElement("td");
    tdDate.textContent = dateTimeStr;
    row.appendChild(tdDate);

    const tdSubject = document.createElement("td");
    tdSubject.textContent = appointment.subject || "-";
    row.appendChild(tdSubject);

    const tdStatus = document.createElement("td");
    tdStatus.textContent =
      appointment.status === "pending"
        ? "🟡 Pending"
        : appointment.status === "accepted"
          ? "🟢 Accepted"
          : "🔴 Rejected";
    row.appendChild(tdStatus);

    const tdActions = document.createElement("td");
    if (appointment.status === "pending") {
      const acceptBtn = document.createElement("button");
      acceptBtn.className = "accept";
      acceptBtn.textContent = "✅ Accept";
      acceptBtn.addEventListener("click", () =>
        updateStatus(docSnap.id, "accepted")
      );
      tdActions.appendChild(acceptBtn);

      const rejectBtn = document.createElement("button");
      rejectBtn.className = "reject";
      rejectBtn.textContent = "❌ Reject";
      rejectBtn.addEventListener("click", () =>
        updateStatus(docSnap.id, "rejected")
      );
      tdActions.appendChild(rejectBtn);
    } else if (appointment.status === "accepted") {
      const rejectBtn = document.createElement("button");
      rejectBtn.className = "reject";
      rejectBtn.textContent = "❌ Reject";
      rejectBtn.addEventListener("click", () =>
        updateStatus(docSnap.id, "rejected")
      );
      tdActions.appendChild(rejectBtn);

      const scheduleBtn = document.createElement("button");
      scheduleBtn.className = "schedule";
      scheduleBtn.textContent = "⏳ Schedule Later";
      scheduleBtn.addEventListener("click", () => scheduleLater(docSnap.id));
      tdActions.appendChild(scheduleBtn);
    } else if (appointment.status === "rejected") {
      const approveBtn = document.createElement("button");
      approveBtn.className = "approve";
      approveBtn.textContent = "✅ Approve";
      approveBtn.addEventListener("click", () =>
        updateStatus(docSnap.id, "accepted")
      );
      tdActions.appendChild(approveBtn);

      const scheduleBtn = document.createElement("button");
      scheduleBtn.className = "schedule";
      scheduleBtn.textContent = "⏳ Schedule Later";
      scheduleBtn.addEventListener("click", () => scheduleLater(docSnap.id));
      tdActions.appendChild(scheduleBtn);
    }

    row.appendChild(tdActions);
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
