import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    projectId: "previous-question-paper-75870",
    appId: "1:747745533667:web:50f91c8bd649c40b006fd6",
    storageBucket: "previous-question-paper-75870.firebasestorage.app",
    apiKey: "AIzaSyB_ay6RzpkMJVYEIX8uAxPqRibFvWu7BVk",
    authDomain: "previous-question-paper-75870.firebaseapp.com",
    messagingSenderId: "747745533667",
    measurementId: "G-L9EDHZG0MK"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };
