// firebaseConfig.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBmTJDTPudznZzLd6pBuBjNT75vhZEhQCg",
    authDomain: "api-chat-94d88.firebaseapp.com",
    projectId: "api-chat-94d88",
    storageBucket: "api-chat-94d88.firebasestorage.app",
    messagingSenderId: "359276858965",
    appId: "1:359276858965:web:37f25bc69d3a3579a98edc",
    measurementId: "G-8TTPCWP7SX"
};

// Only initialize the app if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { db };
