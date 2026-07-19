import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const INITIAL_ADMIN_USERS = [
  { id: 'admin1', name: 'Admin 1 (Quản lý 1)', email: 'admin1@thanhstore.vn', avatar: '👨‍💼', color: '#3b82f6' },
  { id: 'admin2', name: 'Admin 2 (Quản lý 2)', email: 'admin2@thanhstore.vn', avatar: '👩‍💼', color: '#ec4899' },
  { id: 'admin3', name: 'Admin 3 (Kho & Đơn)', email: 'admin3@thanhstore.vn', avatar: '🧑‍💻', color: '#8b5cf6' },
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('thanh_app_user');
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_USERS[0];
  });

  const [onlineAdmins, setOnlineAdmins] = useState([
    INITIAL_ADMIN_USERS[0],
    INITIAL_ADMIN_USERS[1],
  ]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('thanh_app_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('thanh_app_user');
    }
  }, [currentUser]);

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
      avatar: '👤',
      color: '#10b981'
    };
    setCurrentUser(newUser);
  };

  const logoutAdmin = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      onlineAdmins,
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
