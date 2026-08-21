import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  query,
  orderBy
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';

// Standard Firebase Configuration pointing directly to the real thanh-s-business production cloud
const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const isPlaceholderKey = !rawApiKey || rawApiKey.includes('your_') || rawApiKey.includes('Demo');

const firebaseConfig = {
  apiKey: !isPlaceholderKey ? rawApiKey : 'AIzaSyCqKTsiwpdF2LUnr49_-ApdtR0Rtd12Noo',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN && !import.meta.env.VITE_FIREBASE_AUTH_DOMAIN.includes('your_')
    ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
    : 'thanh-s-business.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID && !import.meta.env.VITE_FIREBASE_PROJECT_ID.includes('your_')
    ? import.meta.env.VITE_FIREBASE_PROJECT_ID
    : 'thanh-s-business',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET && !import.meta.env.VITE_FIREBASE_STORAGE_BUCKET.includes('your_')
    ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
    : 'thanh-s-business.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID && !import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID.includes('your_')
    ? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
    : '477515647869',
  appId: import.meta.env.VITE_FIREBASE_APP_ID && !import.meta.env.VITE_FIREBASE_APP_ID.includes('your_')
    ? import.meta.env.VITE_FIREBASE_APP_ID
    : '1:477515647869:web:f1e4fac9945ba3059e9a14'
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);

// BroadcastChannel for instant local cross-tab sync fallback
const syncChannel =
  typeof window !== 'undefined' && window.BroadcastChannel
    ? new BroadcastChannel('thanh_management_realtime_sync')
    : null;

// Helper to broadcast changes across tabs/windows instantly
export const broadcastRealtimeEvent = (type, data) => {
  if (syncChannel) {
    try {
      syncChannel.postMessage({ type, data, timestamp: Date.now() });
    } catch (err) {
      console.warn('Realtime broadcast error:', err);
    }
  }
};

export {
  collection,
  onSnapshot,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  query,
  orderBy,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
};
