import { auth, db } from "../firebase.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFunctions,
  httpsCallable,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";
import { enableFunctionsEmulator } from "../firebase.js";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { showMessage } from "../utils/notification.js";

const usersTable = document.getElementById("usersTable").querySelector("tbody");
const appointmentsTable = document
  .getElementById("appointmentsTable")
  .querySelector("tbody");

const totalStudentsEl = document.getElementById("totalStudents");
const totalTeachersEl = document.getElementById("totalTeachers");
const pendingApprovalsEl = document.getElementById("pendingApprovals");
const totalAppointmentsEl = document.getElementById("totalAppointments");

// Load Appointments Table (safe DOM updates)
async function loadAppointments() {
  appointmentsTable.innerHTML = "";
  const appointmentsSnap = await getDocs(collection(db, "appointments"));
  const usersSnap = await getDocs(collection(db, "users"));
  const usersMap = {};
  usersSnap.forEach((u) => (usersMap[u.id] = u.data()));

  appointmentsSnap.forEach((docSnap) => {
    const appt = docSnap.data();

    const student = usersMap[appt.studentId] || { name: "Unknown" };
    const teacher = usersMap[appt.teacherId] || { name: "Unknown" };

    const row = document.createElement("tr");

    const tdStudent = document.createElement("td");
    tdStudent.textContent = student.name;
    row.appendChild(tdStudent);

    const tdTeacher = document.createElement("td");
    tdTeacher.textContent = teacher.name;
    row.appendChild(tdTeacher);

    const dateTimeStr =
      appt.date && appt.time ? `${appt.date} ${appt.time}` : "-";
    const tdDate = document.createElement("td");
    tdDate.textContent = dateTimeStr;
    row.appendChild(tdDate);

    const tdSubject = document.createElement("td");
    tdSubject.textContent = appt.subject || "-";
    row.appendChild(tdSubject);

    const tdStatus = document.createElement("td");
    tdStatus.textContent = appt.status || "-";
    row.appendChild(tdStatus);

    const tdAction = document.createElement("td");
    // Buttons
    if (appt.status === "pending") {
      const acceptBtn = document.createElement("button");
      acceptBtn.textContent = "Accept";
      acceptBtn.addEventListener("click", () => acceptAppointment(docSnap.id));
      tdAction.appendChild(acceptBtn);

      const rejectBtn = document.createElement("button");
      rejectBtn.className = "delete";
      rejectBtn.textContent = "Reject";
      rejectBtn.addEventListener("click", () => rejectAppointment(docSnap.id));
      tdAction.appendChild(rejectBtn);
    } else if (appt.status === "accepted") {
      const rejectBtn = document.createElement("button");
      rejectBtn.className = "delete";
      rejectBtn.textContent = "Reject";
      rejectBtn.addEventListener("click", () => rejectAppointment(docSnap.id));
      tdAction.appendChild(rejectBtn);
    }

    row.appendChild(tdAction);
    appointmentsTable.appendChild(row);
  });
}

// Accept Appointment
window.acceptAppointment = async (id) => {
  await updateDoc(doc(db, "appointments", id), { status: "accepted" });
  await loadAppointments();
  await loadStats();
};

// Reject Appointment
window.rejectAppointment = async (id) => {
  await updateDoc(doc(db, "appointments", id), { status: "rejected" });
  await loadAppointments();
  await loadStats();
};

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

// Load Users Table (safe DOM updates)
async function loadUsers() {
  console.log("Fetching users...");
  const snapshot = await getDocs(collection(db, "users"));
  console.log("Snapshot size:", snapshot.size);
  usersTable.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const user = docSnap.data();

    const row = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.textContent = user.name || "-";
    row.appendChild(tdName);

    const tdEmail = document.createElement("td");
    tdEmail.textContent = user.email || "-";
    row.appendChild(tdEmail);

    const tdRole = document.createElement("td");
    tdRole.textContent = user.role || "-";
    row.appendChild(tdRole);

    const tdApproved = document.createElement("td");
    let approvedCol = "-";
    if (user.role === "student") {
      approvedCol = user.approved ? "\u2705" : "\u274c";
    } else if (user.role === "teacher") {
      approvedCol = "\u2705";
    }
    tdApproved.textContent = approvedCol;
    row.appendChild(tdApproved);

    const tdBlock = document.createElement("td");
    if (user.role !== "admin") {
      const btn = document.createElement("button");
      if (user.blocked) {
        btn.className = "unblock";
        btn.textContent = "Unblock";
        btn.addEventListener("click", () => toggleBlock(docSnap.id, true));
      } else {
        btn.className = "block";
        btn.textContent = "Block";
        btn.addEventListener("click", () => toggleBlock(docSnap.id, false));
      }
      tdBlock.appendChild(btn);
    } else {
      tdBlock.textContent = "-";
    }
    row.appendChild(tdBlock);

    const tdActions = document.createElement("td");
    if (user.role === "student" && !user.approved) {
      const approveBtn = document.createElement("button");
      approveBtn.textContent = "Approve";
      approveBtn.addEventListener("click", () => approveUser(docSnap.id));
      tdActions.appendChild(approveBtn);
    }
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteUser(docSnap.id));
    tdActions.appendChild(deleteBtn);

    row.appendChild(tdActions);

    usersTable.appendChild(row);
  });
}

// Approve User
window.approveUser = async (uid) => {
  try {
    // Ensure functions emulator is connected in dev if available
    const functions = getFunctions();
    try {
      // attempt to enable functions emulator (no-op in prod)
      await enableFunctionsEmulator(functions).catch(() => {});
    } catch (e) {
      // ignore
    }
    const approveCallable = httpsCallable(functions, "approveUser");
    const resp = await approveCallable({ uid });
    if (resp && resp.data && resp.data.success) {
      showMessage("✅ User approved", "success");
    }
    await loadUsers();
    await loadStats();
    await loadAppointments();
  } catch (err) {
    console.error("approveUser failed:", err);
    showMessage("❌ Failed to approve user", "error");
  }
};

// Delete User
window.deleteUser = async (uid) => {
  const confirmDel = confirm("Are you sure you want to delete this user?");
  if (!confirmDel) return;

  try {
    const functions = getFunctions();
    try {
      await enableFunctionsEmulator(functions).catch(() => {});
    } catch (e) {}
    const deleteUserCallable = httpsCallable(functions, "deleteUserAndData");
    const resp = await deleteUserCallable({ uid });
    if (resp && resp.data && resp.data.success) {
      showMessage("✅ User deleted successfully", "success");
    } else {
      showMessage("⚠️ Deletion completed with unexpected response", "info");
    }
    await loadUsers();
    await loadStats();
    await loadAppointments();
  } catch (err) {
    console.error("deleteUser failed:", err);
    showMessage("❌ Failed to delete user. See console for details.", "error");
  }
};

// Toggle Block/Unblock
window.toggleBlock = async (uid, currentStatus) => {
  try {
    const functions = getFunctions();
    try {
      await enableFunctionsEmulator(functions).catch(() => {});
    } catch (e) {}
    const toggleCallable = httpsCallable(functions, "toggleBlockUser");
    const resp = await toggleCallable({ uid, block: !currentStatus });
    if (resp && resp.data && resp.data.success) {
      showMessage("✅ User block status updated", "success");
    }
    await loadUsers();
    await loadStats();
    await loadAppointments();
  } catch (err) {
    console.error("toggleBlock failed:", err);
    showMessage("❌ Failed to update block status", "error");
  }
};

// Auth check
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists() && userDoc.data().role === "admin") {
      await loadUsers();
      await loadStats(); // Sync stats on dashboard load
      await loadAppointments();
    } else {
      alert("Access denied!");
      window.location.href = "../auth/login.html";
    }
  } else {
    window.location.href = "../auth/login.html";
  }
});

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
