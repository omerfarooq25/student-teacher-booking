// Load Appointments Table
async function loadAppointments() {
  const appointmentsTable = document
    .getElementById("appointmentsTable")
    .querySelector("tbody");
  appointmentsTable.innerHTML = "";
  const appointmentsSnap = await getDocs(collection(db, "appointments"));
  const usersSnap = await getDocs(collection(db, "users"));
  const usersMap = {};
  usersSnap.forEach((doc) => {
    usersMap[doc.id] = doc.data();
  });
  appointmentsSnap.forEach((docSnap) => {
    const appt = docSnap.data();
    const student = usersMap[appt.studentId] || { name: "Unknown" };
    const teacher = usersMap[appt.teacherId] || { name: "Unknown" };
    let actionBtns = "";
    if (appt.status === "pending") {
      actionBtns = `
        <button onclick="acceptAppointment('${docSnap.id}')">Accept</button>
        <button class='delete' onclick="rejectAppointment('${docSnap.id}')">Reject</button>
      `;
    } else if (appt.status === "accepted") {
      actionBtns = `
        <button class='delete' onclick="rejectAppointment('${docSnap.id}')">Reject</button>
      `;
    }
    const dateTimeStr =
      appt.date && appt.time ? `${appt.date} ${appt.time}` : "-";
    const subjectStr = appt.subject || "-";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.name}</td>
      <td>${teacher.name}</td>
      <td>${dateTimeStr}</td>
      <td>${subjectStr}</td>
      <td>${appt.status || "-"}</td>
      <td>${actionBtns}</td>
    `;
    appointmentsTable.appendChild(row);
  });
}

// Accept Appointment
window.acceptAppointment = async (id) => {
  await updateDoc(doc(db, "appointments", id), { status: "accepted" });
  loadAppointments();
  loadStats();
};

// Reject Appointment
window.rejectAppointment = async (id) => {
  await updateDoc(doc(db, "appointments", id), { status: "rejected" });
  loadAppointments();
  loadStats();
};
import { auth, db } from "../firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const usersTable = document.getElementById("usersTable").querySelector("tbody");

const totalStudentsEl = document.getElementById("totalStudents");
const totalTeachersEl = document.getElementById("totalTeachers");
const pendingApprovalsEl = document.getElementById("pendingApprovals");
const totalAppointmentsEl = document.getElementById("totalAppointments");

// Auth check
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists() && userDoc.data().role === "admin") {
      loadUsers();
      loadStats(); // Sync stats on dashboard load
      loadAppointments();
    } else {
      alert("Access denied!");
      window.location.href = "../auth/login.html";
    }
  } else {
    window.location.href = "../auth/login.html";
  }
});

// Load Statistics
async function loadStats() {
  const usersRef = collection(db, "users");

  const totalStudentsQuery = query(usersRef, where("role", "==", "student"));
  const totalTeachersQuery = query(usersRef, where("role", "==", "teacher"));
  const pendingApprovalsQuery = query(usersRef, where("approved", "==", false));
  const appointmentsSnap = await getDocs(collection(db, "appointments"));

  const [studentsSnap, teachersSnap, pendingSnap] = await Promise.all([
    getDocs(totalStudentsQuery),
    getDocs(totalTeachersQuery),
    getDocs(pendingApprovalsQuery),
  ]);

  totalStudentsEl.textContent = studentsSnap.size;
  totalTeachersEl.textContent = teachersSnap.size;
  pendingApprovalsEl.textContent = pendingSnap.size;
  totalAppointmentsEl.textContent = appointmentsSnap.size;
}

// Load Users Table
async function loadUsers() {
  console.log("Fetching users...");
  const snapshot = await getDocs(collection(db, "users"));
  console.log("Snapshot size:", snapshot.size);
  usersTable.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const user = docSnap.data();
    console.log("User found:", user);

    const row = document.createElement("tr");
    // Block/Unblock button logic: only for non-admins
    let blockBtn = "-";
    if (user.role !== "admin") {
      if (user.blocked) {
        blockBtn = `<button class="unblock" onclick="toggleBlock('${docSnap.id}', true)">Unblock</button>`;
      } else {
        blockBtn = `<button class="block" onclick="toggleBlock('${docSnap.id}', false)">Block</button>`;
      }
    }

    // Approved column logic
    let approvedCol = "-";
    if (user.role === "student") {
      approvedCol = user.approved ? "✅" : "❌";
    } else if (user.role === "teacher") {
      approvedCol = "✅";
    }

    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>${approvedCol}</td>
      <td>${blockBtn}</td>
      <td>
        ${
          user.role === "student" && !user.approved
            ? `<button onclick=\"approveUser('${docSnap.id}')\">Approve</button>`
            : ""
        }
        <button class="delete" onclick="deleteUser('${
          docSnap.id
        }')">Delete</button>
      </td>
    `;
    usersTable.appendChild(row);
  });
}

// Approve User
window.approveUser = async (uid) => {
  await updateDoc(doc(db, "users", uid), { approved: true });
  loadUsers();
  loadStats(); // Sync stats after approval
  loadAppointments();
};

// Delete User
window.deleteUser = async (uid) => {
  const confirmDel = confirm("Are you sure you want to delete this user?");
  if (confirmDel) {
    await deleteDoc(doc(db, "users", uid));
    loadUsers();
    loadStats(); // Sync stats after deletion
    loadAppointments();
  }
};

// Toggle Block/Unblock
window.toggleBlock = async (uid, currentStatus) => {
  await updateDoc(doc(db, "users", uid), { blocked: !currentStatus });
  loadUsers();
  loadStats(); // Sync stats after block/unblock
  loadAppointments();
};

// Ensure logout only happens on button click
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    alert("Logged out successfully!");
    window.location.href = "../auth/login.html";
  } catch (error) {
    console.error("Logout failed:", error);
  }
});
