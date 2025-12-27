import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAtCrXU97dt0uaFnyPsQXXeC4BmCosNuug",
  authDomain: "vitflow-8f127.firebaseapp.com",
  projectId: "vitflow-8f127",
  storageBucket: "vitflow-8f127.firebasestorage.app",
  messagingSenderId: "597897251274",
  appId: "1:597897251274:web:c6c5b34bff716845db2733",
  measurementId: "G-P49GQH28PL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
