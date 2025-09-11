import { auth, db } from "../firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
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
      blockBtn = `<button onclick="toggleBlock('${
        docSnap.id
      }', ${!!user.blocked})">${user.blocked ? "Unblock" : "Block"}</button>`;
    }

    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>${user.role === "student" ? (user.approved ? "✅" : "❌") : "-"}</td>
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
};

// Delete User
window.deleteUser = async (uid) => {
  const confirmDel = confirm("Are you sure you want to delete this user?");
  if (confirmDel) {
    await deleteDoc(doc(db, "users", uid));
    loadUsers();
  }
};

// Toggle Block/Unblock
window.toggleBlock = async (uid, currentStatus) => {
  await updateDoc(doc(db, "users", uid), { blocked: !currentStatus });
  loadUsers();
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
