import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
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

// Standard Firebase Configuration (Can be replaced with your live Firebase keys)
const firebaseConfig = {
  apiKey: "AIzaSyDemoKeyForThanhManagementWeb2026",
  authDomain: "thanh-management-web.firebaseapp.com",
  projectId: "thanh-management-web",
  storageBucket: "thanh-management-web.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:demo1234567890"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);

// BroadcastChannel for instant local cross-tab sync fallback (simulating 3-4 online users in demo mode)
const syncChannel = typeof window !== 'undefined' && window.BroadcastChannel 
  ? new BroadcastChannel('thanh_management_realtime_sync')
  : null;

// Helper to broadcast changes across tabs/windows instantly
export const broadcastRealtimeEvent = (type, data) => {
  if (syncChannel) {
    try {
      syncChannel.postMessage({ type, data, timestamp: Date.now() });
    } catch (err) {
      console.warn("Realtime broadcast error:", err);
    }
  }
};

export { 
  collection, 
  onSnapshot, 
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
