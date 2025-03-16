import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyC3jiPEpuhS-ICUfNV7xpZ6r0DdlpAn9FE",
  authDomain: "hackathon2025-1cf3f.firebaseapp.com",
  projectId: "hackathon2025-1cf3f",
  storageBucket: "hackathon2025-1cf3f.firebasestorage.app",
  messagingSenderId: "1064213088987",
  appId: "1:1064213088987:web:b1a26566fbfea953965afe",
  measurementId: "G-NTH4D108P2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings
const db = getFirestore(app);

// Enable offline persistence (optional)
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });

// Initialize Analytics
const analytics = getAnalytics(app);

export { db, analytics }; 
