import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Config publica de Firebase (no es secreta; la seguridad la dan las rules).
export const firebaseConfig = {
  apiKey: 'AIzaSyC7IlQtpkgsvCowI7MqhZf7WL4HwM-F11s',
  authDomain: 'elcontainer-ve.firebaseapp.com',
  projectId: 'elcontainer-ve',
  storageBucket: 'elcontainer-ve.firebasestorage.app',
  messagingSenderId: '1049217888117',
  appId: '1:1049217888117:web:9f46b9e805b33923666d3c',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
