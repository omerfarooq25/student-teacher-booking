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

const usersTable = document.getElementById("usersTable").querySelector("tbody");

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

async function loadUsers() {
  console.log("Fetching users...");
  const snapshot = await getDocs(collection(db, "users"));
  console.log("Snapshot size:", snapshot.size);
  usersTable.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const user = docSnap.data();
    console.log("User found:", user);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>${user.role === "student" ? (user.approved ? "✅" : "❌") : "-"}</td>
      <td>
        ${
          user.role === "student" && !user.approved
            ? `<button onclick="approveUser('${docSnap.id}')">Approve</button>`
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

window.approveUser = async (uid) => {
  await updateDoc(doc(db, "users", uid), { approved: true });
  loadUsers();
};

window.deleteUser = async (uid) => {
  const confirmDel = confirm("Are you sure you want to delete this user?");
  if (confirmDel) {
    await deleteDoc(doc(db, "users", uid));
    loadUsers();
  }
};
