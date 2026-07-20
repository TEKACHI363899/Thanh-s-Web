import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from '../services/firebase';

const AuthContext = createContext();

export const INITIAL_ADMIN_USERS = [
  { id: 'admin1', name: 'Admin 1 (Quản lý 1)', email: 'admin1@thanhstore.vn', avatar: '👨‍💼', color: '#3b82f6', role: 'ADMIN' },
  { id: 'admin2', name: 'Admin 2 (Quản lý 2)', email: 'admin2@thanhstore.vn', avatar: '👩‍💼', color: '#ec4899', role: 'ADMIN' },
  { id: 'admin3', name: 'Admin 3 (Kho & Đơn)', email: 'admin3@thanhstore.vn', avatar: '🧑‍💻', color: '#8b5cf6', role: 'ADMIN' },
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('thanh_app_user');
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_USERS[0];
    } catch (e) {
      return INITIAL_ADMIN_USERS[0];
    }
  });

  const [onlineAdmins, setOnlineAdmins] = useState(INITIAL_ADMIN_USERS);

  // Listen to Firebase Authentication State Changes
  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const adminUser = {
          id: user.uid,
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          avatar: '👑',
          color: '#10b981',
          role: 'ADMIN'
        };
        setCurrentUser(adminUser);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('thanh_app_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('thanh_app_user');
      }
    } catch (e) {}
  }, [currentUser]);

  // Sign In with Firebase
  const loginWithFirebase = async (email, password) => {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
      const adminUser = {
        id: user.uid,
        name: user.displayName || email.split('@')[0],
        email: user.email,
        avatar: '👑',
        color: '#10b981',
        role: 'ADMIN'
      };
      setCurrentUser(adminUser);
      return { success: true, user: adminUser };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Sign Up with Firebase (New Admin Account)
  const signUpWithFirebase = async (email, password, name) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
      const newAdmin = {
        id: user.uid,
        name: name || email.split('@')[0],
        email: user.email,
        avatar: '👑',
        color: '#8b5cf6',
        role: 'ADMIN'
      };
      setCurrentUser(newAdmin);
      return { success: true, user: newAdmin };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const loginAdmin = (adminId) => {
    const found = INITIAL_ADMIN_USERS.find(u => u.id === adminId);
    if (found) {
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const loginCustom = (email, name) => {
    const newUser = {
      id: 'admin_' + Date.now(),
      name: name || email.split('@')[0],
      email: email,
      avatar: '👑',
      color: '#10b981',
      role: 'ADMIN'
    };
    setCurrentUser(newUser);
  };

  const logoutAdmin = async () => {
    try {
      if (auth) await signOut(auth);
    } catch (e) {}
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      onlineAdmins,
      loginWithFirebase,
      signUpWithFirebase,
      loginAdmin,
      loginCustom,
      logoutAdmin,
      availableAdmins: INITIAL_ADMIN_USERS
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
