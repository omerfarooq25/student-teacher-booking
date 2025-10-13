const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize admin SDK - when deployed this will use the service account
admin.initializeApp();
const db = admin.firestore();

/**
 * Callable function to delete a user and their related data.
 * Only callable by admins. The caller must be authenticated and have role 'admin' in Firestore users collection.
 * Request data: { uid: string }
 */
exports.deleteUserAndData = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Request has no authentication."
    );
  }

  const callerUid = context.auth.uid;
  const callerDoc = await db.collection("users").doc(callerUid).get();
  if (!callerDoc.exists || callerDoc.data().role !== "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Caller is not an admin."
    );
  }

  const targetUid = data.uid;
  if (!targetUid) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing target UID."
    );
  }

  try {
    // Delete Firestore user doc
    await db.collection("users").doc(targetUid).delete();

    // Delete appointments where studentId or teacherId equals targetUid
    const apptQuery = db
      .collection("appointments")
      .where("studentId", "==", targetUid);
    const apptSnap = await apptQuery.get();
    const batch = db.batch();
    apptSnap.forEach((doc) => batch.delete(doc.ref));

    const apptQuery2 = db
      .collection("appointments")
      .where("teacherId", "==", targetUid);
    const apptSnap2 = await apptQuery2.get();
    apptSnap2.forEach((doc) => batch.delete(doc.ref));

    await batch.commit();

    // Delete the user from Firebase Authentication
    await admin.auth().deleteUser(targetUid);

    return { success: true };
  } catch (err) {
    console.error("Error deleting user and related data:", err);
    throw new functions.https.HttpsError("internal", "Failed to delete user.");
  }
});
