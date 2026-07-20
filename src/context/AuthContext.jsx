import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from '../services/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('thanh_app_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [loadingAuth, setLoadingAuth] = useState(true);

  // Realtime Firebase Auth Listener
  useEffect(() => {
    if (!auth) {
      setLoadingAuth(false);
      return;
    }
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
      setLoadingAuth(false);
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

  // Firebase Sign In
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
      let msg = 'Đăng nhập thất bại. Vui lòng kiểm tra lại Email và Mật khẩu!';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'Email hoặc mật khẩu không chính xác!';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Tài khoản tạm thời bị khóa do gõ sai quá nhiều lần. Vui lòng thử lại sau!';
      }
      return { success: false, error: msg };
    }
  };

  // Firebase Sign Up (Creating real new Admin account)
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
      let msg = 'Đăng ký không thành công!';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Email này đã được đăng ký tài khoản trước đó!';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Mật khẩu quá yếu! Vui lòng nhập từ 6 ký tự trở lên.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Định dạng Email không hợp lệ!';
      }
      return { success: false, error: msg };
    }
  };

  // Logout from Firebase
  const logoutAdmin = async () => {
    try {
      if (auth) await signOut(auth);
    } catch (e) {}
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loadingAuth,
      loginWithFirebase,
      signUpWithFirebase,
      logoutAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
