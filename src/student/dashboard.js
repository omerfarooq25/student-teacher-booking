console.log("Student dashboard loaded");

import { auth, db } from "../firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const teachersTable = document
  .getElementById("teachersTable")
  .querySelector("tbody");
const appointmentsTable = document
  .getElementById("appointmentsTable")
  .querySelector("tbody");

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await loadTeachers();
    await loadAppointments();
  } else {
    window.location.href = "../auth/login.html";
  }
});

async function loadTeachers() {
  const q = query(collection(db, "users"), where("role", "==", "teacher"));
  const snapshot = await getDocs(q);

  teachersTable.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const teacher = docSnap.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${teacher.name}</td>
      <td>${teacher.email}</td>
      <td><button onclick="bookAppointment('${docSnap.id}', '${teacher.name}')">Book</button></td>
    `;
    teachersTable.appendChild(row);
  });
}

window.bookAppointment = async (teacherId, teacherName) => {
  if (!confirm(`Book appointment with ${teacherName}?`)) return;

  await addDoc(collection(db, "appointments"), {
    studentId: currentUser.uid,
    teacherId,
    status: "pending",
    timestamp: Timestamp.now(),
  });

  alert("Appointment requested!");
  loadAppointments();
};

async function loadAppointments() {
  const q = query(
    collection(db, "appointments"),
    where("studentId", "==", currentUser.uid)
  );
  const snapshot = await getDocs(q);

  appointmentsTable.innerHTML = "";

  for (const docSnap of snapshot.docs) {
    const appointment = docSnap.data();

    // Get teacher info
    const teacherDoc = await getDocs(
      query(
        collection(db, "users"),
        where("__name__", "==", appointment.teacherId)
      )
    );
    let teacherName = "Unknown";
    teacherDoc.forEach((t) => {
      teacherName = t.data().name;
    });

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${teacherName}</td>
      <td>${appointment.status}</td>
      <td>${appointment.timestamp.toDate().toLocaleString()}</td>
    `;
    appointmentsTable.appendChild(row);
  }
}
