console.log("Student dashboard loaded");

import { auth, db } from "../firebase.js";
// expose auth for debugging in console
window.auth = auth;

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  doc,
  getDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { showMessage } from "../utils/notification.js";

// 🔹 Table references
const teachersTable = document
  .getElementById("teachersTable")
  .querySelector("tbody");
const appointmentsTable = document
  .getElementById("appointmentsTable")
  .querySelector("tbody");

// 🔹 Section references (used for show/hide instead of overwriting HTML)
const teachersSection = document.getElementById("teachersSection");
const appointmentsSection = document.getElementById("appointmentsSection");

// 🔹 Track current student UID
let currentStudentUid = null;

// 🔹 Auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("DEBUG: Logged-in user object:", user);
    console.log("DEBUG: UID:", user.uid);

    currentStudentUid = user.uid;
    const userRef = doc(db, "users", user.uid);

    // Real-time listener for approval updates
    onSnapshot(userRef, (userSnap) => {
      console.log("DEBUG: userSnap.exists:", userSnap.exists());
      console.log("DEBUG: userSnap.id:", userSnap.id);
      console.log("DEBUG: userSnap.data():", userSnap.data());

      if (!userSnap.exists() || !userSnap.data().approved) {
        // ❌ Not approved yet → hide sections
        teachersSection.style.display = "none";
        appointmentsSection.style.display = "none";
        showMessage("⏳ Your account is awaiting admin approval.", "info");
      } else {
        // ✅ Approved → show dashboard
        teachersSection.style.display = "block";
        appointmentsSection.style.display = "block";

        console.log("✅ Student approved in real time:", userSnap.data());

        loadTeachers(user.uid);
        loadAppointments(user.uid);
      }
    });
  } else {
    window.location.href = "../auth/login.html";
  }
});

// 🔹 Load teachers list
async function loadTeachers(studentUid) {
  const q = query(collection(db, "users"), where("role", "==", "teacher"));
  const snapshot = await getDocs(q);

  teachersTable.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const teacher = docSnap.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${teacher.name}</td>
      <td>${teacher.email}</td>
      <td>
        <button onclick="bookAppointment('${docSnap.id}', '${teacher.name}', '${studentUid}')">
          Book
        </button>
      </td>
    `;
    teachersTable.appendChild(row);
  });
}

// 🔹 Book appointment
window.bookAppointment = async (teacherId, teacherName, studentUid) => {
  if (!confirm(`Book appointment with ${teacherName}?`)) return;

  // Prevent duplicate bookings
  const q = query(
    collection(db, "appointments"),
    where("studentId", "==", studentUid),
    where("teacherId", "==", teacherId),
    where("status", "in", ["pending", "accepted"])
  );
  const existing = await getDocs(q);

  if (!existing.empty) {
    showMessage(
      "❌ You already have a pending/approved appointment with this teacher!",
      "error"
    );
    return;
  }

  // Create new appointment
  await addDoc(collection(db, "appointments"), {
    studentId: studentUid,
    teacherId,
    status: "pending",
    timestamp: Timestamp.now(),
  });

  showMessage("✅ Appointment requested!", "success");
  loadAppointments(studentUid);
};

// 🔹 Load appointments
async function loadAppointments(studentUid) {
  const q = query(
    collection(db, "appointments"),
    where("studentId", "==", studentUid)
  );
  const snapshot = await getDocs(q);

  appointmentsTable.innerHTML = "";

  for (const docSnap of snapshot.docs) {
    const appointment = docSnap.data();

    // Get teacher info
    const teacherDoc = await getDoc(doc(db, "users", appointment.teacherId));
    const teacherName = teacherDoc.exists()
      ? teacherDoc.data().name
      : "Unknown";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${teacherName}</td>
      <td>
        ${
          appointment.status === "pending"
            ? "🟡 Pending"
            : appointment.status === "accepted"
            ? "🟢 Accepted"
            : "🔴 Rejected"
        }
      </td>
      <td>${appointment.timestamp.toDate().toLocaleString()}</td>
    `;
    appointmentsTable.appendChild(row);
  }
}

// 🔹 Logout button
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    showMessage("👋 Logged out successfully!", "success");
    setTimeout(() => (window.location.href = "../auth/login.html"), 1000);
  } catch (error) {
    console.error("Logout failed:", error);
    showMessage("❌ Logout failed", "error");
  }
});
