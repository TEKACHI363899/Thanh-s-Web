import React, { createContext, useContext, useState, useEffect } from 'react';
import { COLORS } from '../theme/colors';

export const THEMES = {
  dark: {
    id: 'dark',
    name: 'Theme Dark (Đêm Tối)',
    desc: 'Nền tối Slate Navy sang trọng, hiện đại & dịu mắt',
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
      sidebarBg: '#162032',
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
    desc: 'Nền sáng tối giản, độ tương phản chữ đen đậm cao nét',
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
      sidebarBg: '#ffffff',
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
    desc: 'Nền hồng pastel ngọt ngào, nổi bật cho shop thời trang',
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
      sidebarBg: '#ffe4e6',
      cardBorder: '#fecdd3',
      surfaceHover: '#ffe4e6',
      textMain: '#881337',
      textMuted: '#9f1239',
      textSub: '#be123c',
      statusPending: '#d97706',
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
    desc: 'Nền tím Kuromi huyền bí, mộng mơ & đậm chất nghệ thuật',
    previewBg: '#130b24',
    previewAccent: '#c084fc',
    colors: {
      primary: '#a855f7',
      primaryDark: '#9333ea',
      primaryLight: '#c084fc',
      accent: '#f43f5e',
      accentHover: '#e11d48',
      bgDark: '#130b24',
      cardDark: '#21153b',
      sidebarBg: '#1a0e30',
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

const injectGlobalThemeStyle = (activeTheme) => {
  let styleEl = document.getElementById('dynamic-theme-style');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamic-theme-style';
    document.head.appendChild(styleEl);
  }

  const { bgDark, cardDark, sidebarBg, cardBorder, surfaceHover, textMain, textMuted, primary } = activeTheme.colors;

  styleEl.innerHTML = `
    html, body, #root {
      background-color: ${bgDark} !important;
      color: ${textMain} !important;
      font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif !important;
    }
    
    /* Global Background Overrides for RNWeb Elements */
    [style*="background-color: rgb(15, 23, 42)"],
    [style*="background-color: rgb(11, 19, 43)"],
    [style*="background-color: rgb(241, 245, 249)"] {
      background-color: ${bgDark} !important;
    }

    [style*="background-color: rgb(22, 32, 50)"] {
      background-color: ${sidebarBg} !important;
    }

    [style*="background-color: rgb(30, 41, 59)"],
    [style*="background-color: rgb(28, 37, 65)"] {
      background-color: ${cardDark} !important;
    }

    /* Global Text Overrides */
    [style*="color: rgb(248, 250, 252)"] {
      color: ${textMain} !important;
    }

    [style*="color: rgb(148, 163, 184)"] {
      color: ${textMuted} !important;
    }

    /* Border Overrides */
    [style*="border-color: rgb(51, 65, 85)"],
    [style*="border-bottom-color: rgb(51, 65, 85)"],
    [style*="border-top-color: rgb(51, 65, 85)"],
    [style*="border-right-color: rgb(51, 65, 85)"] {
      border-color: ${cardBorder} !important;
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar-track {
      background: ${bgDark} !important;
    }
    ::-webkit-scrollbar-thumb {
      background: ${primary} !important;
    }
  `;
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
    Object.assign(COLORS, activeTheme.colors);
    injectGlobalThemeStyle(activeTheme);
  }, [theme]);

  const activeThemeObj = THEMES[theme] || THEMES.dark;

  return (
    <ThemeContext.Provider value={{ theme, setTheme: changeTheme, themeObj: activeThemeObj, colors: activeThemeObj.colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
