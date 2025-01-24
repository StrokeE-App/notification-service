import admin from "firebase-admin";

import dotenv from "dotenv";

dotenv.config();


const credentials = process.env.CREEDENTIALSDK!

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(credentials)),
});

console.log("Connected to Firebase")
export const firebaseAdmin = admin.auth();
