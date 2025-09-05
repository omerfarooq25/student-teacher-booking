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

    if (userDoc.exists() && userDoc.data().role === "teacher") {
      currentUser = user;
      await loadAppointments(user.uid);
    } else {
      alert("Access denied!");
      window.location.href = "../auth/login.html";
    }
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
    row.innerHTML = `
      <td>${studentName}</td>
      <td>${appointment.timestamp.toDate().toLocaleString()}</td>
      <td>${appointment.status}</td>
      <td>
        ${
          appointment.status === "pending"
            ? "🟡 Pending"
            : appointment.status === "accepted"
            ? "🟢 Accepted"
            : "🔴 Rejected"
        }
      </td>
      <td>
        ${
          appointment.status === "pending"
            ? `
            <button onclick="updateStatus('${docSnap.id}', 'accepted')">✅ Accept</button>
            <button onclick="updateStatus('${docSnap.id}', 'rejected')">❌ Reject</button>`
            : "-"
        }
      </td>
    `;
    appointmentsTable.appendChild(row);
  }
}

window.updateStatus = async (appointmentId, status) => {
  await updateDoc(doc(db, "appointments", appointmentId), { status });
  // 💡 Reload appointments for the current user after updating
  loadAppointments(currentUser.uid);
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
