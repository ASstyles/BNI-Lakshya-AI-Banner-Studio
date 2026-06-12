const admin = require("firebase-admin");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", err);
  }
}

if (!serviceAccount) {
  try {
    serviceAccount = require("./firebase-service-account.json");
  } catch (err) {
    console.warn("Could not load firebase-service-account.json. Ensure credentials are set up.");
  }
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  console.error("Firebase admin was not initialized: no service account credentials found.");
}

const db = admin.apps.length > 0 ? admin.firestore() : null;

module.exports = db;