// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
const firebaseConfig = {
  apiKey: "AIzaSyD8AxTCtMVN9hnq__xIpgSzCwc1oLm-nec",
  authDomain: "autoreviow.firebaseapp.com",
  databaseURL: "https://autoreviow-default-rtdb.firebaseio.com",
  projectId: "autoreviow",
  storageBucket: "autoreviow.firebasestorage.app",
  messagingSenderId: "895797362011",
  appId: "1:895797362011:web:95b938b39e12833c926e7e",
  measurementId: "G-JG8NESPYTV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { database, auth };