# 📚 Student–Teacher Booking Appointment

A web-based booking system that allows students to schedule appointments with teachers, while administrators manage teachers, approve student accounts, and oversee the booking system.

---

## 🚀 Features (In Progress)
- ✅ Firebase Authentication (Email/Password)
- ✅ Role-based login & redirection (Admin, Teacher, Student)
- ✅ Registration with Firestore role storage
- ✅ Admin dashboard for managing users
- ✅ Teacher dashboard for managing bookings
- ✅ Student dashboard for making bookings
- ✅ Real-time updates for teacher & student dashboards
- ✅ CRUD operations for appointments (add, update, fetch)
- ✅ Appointment accept/reject functionality for teachers
- ✅ Null checks & error handling for authentication
- 🔄 Slot conflict detection (planned)
- 🔄 Live chat & notifications (planned)
- 🔄 Firebase Hosting (planned)

---

## 🛠 Tech Stack
**Frontend:** HTML, CSS, JavaScript  
**Backend:** Firebase Authentication, Firebase Firestore  
**Hosting:** Firebase Hosting (planned)  
**Version Control:** GitHub  

---
```bash
## 📂 Folder Structure
student-teacher-booking/
├── public/
│ ├── index.html
│ ├── styles.css
├── src/
│ ├── auth/
│ │ ├── login.html
│ │ ├── login.js
│ │ ├── register.html
│ │ ├── register.js
│ ├── admin/
│ │ ├── dashboard.html
│ │ ├── dashboard.js
│ │ ├── admin.css
│ ├── teacher/
│ │ ├── dashboard.html
│ │ ├── dashboard.js
│ │ ├── teacher.css
│ ├── student/
│ │ ├── dashboard.html
│ │ ├── dashboard.js
│ │ ├── student.css
│ ├── utils/
│ │ ├── logger.js
│ │ ├── notification.js
│ │ ├── validation.js
│ ├── firebase.js
│ └── main.js
├── .gitignore
├── README.md
└── package.json

```
---

## ⚙️ Installation & Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/student-teacher-booking.git
   cd student-teacher-booking
2. **Install dependencies (if using npm)**

`npm install`

• Set up Firebase

• Go to Firebase Console

• Create a new project

• Enable Authentication (Email/Password)

• Enable Firestore Database

• Add your Firebase config to `src/firebase.js`

• Run locally using VS Code Live Server

• Right-click on `index.html` → Open with Live Server

• Deploy (planned for later)

`firebase deploy`
## 📅 Project Progress

Day 1 → Firebase Auth, Registration, Login, Role-based redirection ✅

Day 2 → Admin dashboard development 

Day 3 → Student & Teacher dashboard connected to Firestore, booking system implemented with real-time sync ✅

Day 4 → Restricted unapproved students, teacher-specific appointments, status controls ✅

Day 5+ →

• Added null checks in auth to prevent dashboard errors✅

• Teacher & Student dashboards improved with real-time updates✅

• CRUD operations for appointments added (add, update, fetch)✅

• Sorted teacher appointments by date✅

• Appointment accept/reject functionality implemented for teachers ✅

• Error handling and debugging improvements✅

• Exposed auth/db for console debugging✅

🔜 Upcoming → Slot conflict check, live chat system, Firebase hosting 🔜

## 📜 License
This project is open-source under the MIT License.
2. Commit & push:
```bash
git add README.md
git commit -m "Added initial README with current project progress"
git push
