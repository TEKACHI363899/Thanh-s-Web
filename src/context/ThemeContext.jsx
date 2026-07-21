import React, { createContext, useContext, useState, useEffect } from 'react';
import { COLORS } from '../theme/colors';

export const THEMES = {
  dark: {
    id: 'dark',
    name: 'Theme Dark (Mặc Định)',
    desc: 'Nền tối Slate Navy sang trọng & hiện đại',
    previewBg: '#0f172a',
    previewAccent: '#3b82f6',
    colors: {
      primary: '#3b82f6',
      primaryDark: '#1d4ed8',
      primaryLight: '#60a5fa',
      accent: '#8b5cf6',
      accentHover: '#7c3aed',
      bgDark: '#0f172a',
      cardDark: '#1e293b',
      cardBorder: '#334155',
      surfaceHover: '#334155',
      textMain: '#f8fafc',
      textMuted: '#94a3b8',
      textSub: '#cbd5e1',
      statusPending: '#f59e0b',
      statusConfirmed: '#3b82f6',
      statusShipping: '#8b5cf6',
      statusDelivered: '#10b981',
      statusCancelled: '#ef4444',
      categoryTS: '#ec4899',
      categoryQA: '#06b6d4',
      orderTypeInStock: '#10b981',
      orderTypePreorder: '#f59e0b',
      success: '#10b981',
      danger: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    }
  },
  bright: {
    id: 'bright',
    name: 'Theme Bright (Trắng Đen)',
    desc: 'Nền sáng tối giản, tương phản cao chữ rõ nét',
    previewBg: '#f8fafc',
    previewAccent: '#0f172a',
    colors: {
      primary: '#2563eb',
      primaryDark: '#1d4ed8',
      primaryLight: '#3b82f6',
      accent: '#7c3aed',
      accentHover: '#6d28d9',
      bgDark: '#f1f5f9',
      cardDark: '#ffffff',
      cardBorder: '#cbd5e1',
      surfaceHover: '#e2e8f0',
      textMain: '#0f172a',
      textMuted: '#475569',
      textSub: '#334155',
      statusPending: '#d97706',
      statusConfirmed: '#2563eb',
      statusShipping: '#7c3aed',
      statusDelivered: '#059669',
      statusCancelled: '#dc2626',
      categoryTS: '#db2777',
      categoryQA: '#0891b2',
      orderTypeInStock: '#059669',
      orderTypePreorder: '#d97706',
      success: '#059669',
      danger: '#dc2626',
      warning: '#d97706',
      info: '#2563eb'
    }
  },
  pink: {
    id: 'pink',
    name: 'Theme Hồng (Sweetie Pink)',
    desc: 'Gam màu hồng pastel quyến rũ & ngọt ngào',
    previewBg: '#fff1f2',
    previewAccent: '#f43f5e',
    colors: {
      primary: '#f43f5e',
      primaryDark: '#e11d48',
      primaryLight: '#fb7185',
      accent: '#ec4899',
      accentHover: '#db2777',
      bgDark: '#fff1f2',
      cardDark: '#ffffff',
      cardBorder: '#fecdd3',
      surfaceHover: '#ffe4e6',
      textMain: '#881337',
      textMuted: '#9f1239',
      textSub: '#be123c',
      statusPending: '#f59e0b',
      statusConfirmed: '#f43f5e',
      statusShipping: '#ec4899',
      statusDelivered: '#10b981',
      statusCancelled: '#e11d48',
      categoryTS: '#ec4899',
      categoryQA: '#06b6d4',
      orderTypeInStock: '#10b981',
      orderTypePreorder: '#f59e0b',
      success: '#10b981',
      danger: '#e11d48',
      warning: '#f59e0b',
      info: '#f43f5e'
    }
  },
  kuromi: {
    id: 'kuromi',
    name: 'Theme Tím Kuromi (Mystic Violet)',
    desc: 'Tím mộng mơ, cá tính huyền bí phong cách Kuromi',
    previewBg: '#181028',
    previewAccent: '#c084fc',
    colors: {
      primary: '#a855f7',
      primaryDark: '#9333ea',
      primaryLight: '#c084fc',
      accent: '#f43f5e',
      accentHover: '#e11d48',
      bgDark: '#130b24',
      cardDark: '#21153b',
      cardBorder: '#3c2763',
      surfaceHover: '#2e1c50',
      textMain: '#f5f3ff',
      textMuted: '#c4b5fd',
      textSub: '#ddd6fe',
      statusPending: '#f59e0b',
      statusConfirmed: '#a855f7',
      statusShipping: '#f43f5e',
      statusDelivered: '#10b981',
      statusCancelled: '#ef4444',
      categoryTS: '#f43f5e',
      categoryQA: '#c084fc',
      orderTypeInStock: '#10b981',
      orderTypePreorder: '#f59e0b',
      success: '#10b981',
      danger: '#ef4444',
      warning: '#f59e0b',
      info: '#a855f7'
    }
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('thanh_store_theme') || 'dark';
  });

  const changeTheme = (newThemeId) => {
    if (!THEMES[newThemeId]) return;
    setThemeState(newThemeId);
    localStorage.setItem('thanh_store_theme', newThemeId);
  };

  useEffect(() => {
    const activeTheme = THEMES[theme] || THEMES.dark;
    // Update global COLORS object in place
    Object.assign(COLORS, activeTheme.colors);
    
    // Set CSS variables on body for smooth styling
    const root = document.documentElement;
    Object.entries(activeTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    document.body.style.backgroundColor = activeTheme.colors.bgDark;
    document.body.style.color = activeTheme.colors.textMain;
  }, [theme]);

  const activeThemeObj = THEMES[theme] || THEMES.dark;

  return (
    <ThemeContext.Provider value={{ theme, setTheme: changeTheme, themeObj: activeThemeObj, colors: activeThemeObj.colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
