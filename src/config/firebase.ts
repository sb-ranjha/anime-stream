import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

// Enable offline persistence
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn('Multiple tabs open, persistence disabled');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.warn('Browser does not support persistence');
    }
  });
} catch (err) {
  console.warn('Error enabling persistence:', err);
}

// Initialize Auth
const auth = getAuth(app);

export { db, auth }; 
