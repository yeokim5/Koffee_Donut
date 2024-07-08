// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "koffee-donut.firebaseapp.com",
  projectId: "koffee-donut",
  storageBucket: "koffee-donut.appspot.com",
  messagingSenderId: "201076039752",
  appId: "1:201076039752:web:51a9ba04df957e9899f87d",
  measurementId: "G-13Q5NJLTF7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { app, auth };
