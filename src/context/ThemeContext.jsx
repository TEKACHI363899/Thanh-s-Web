import React, { createContext, useContext, useState, useEffect } from 'react';
import { COLORS } from '../theme/colors';

export const THEMES = {
  dark: {
    id: 'dark',
    name: 'Theme Dark (Đêm Tối)',
    desc: 'Nền tối Slate Navy sang trọng, hiện đại & chữ sáng sắc nét',
    previewBg: '#0f172a',
    previewAccent: '#3b82f6',
    colors: {
      label: '#FFFFFF',
      secondaryLabel: '#EBEBF5',
      tertiaryLabel: '#EBEBF54D',
      systemBackground: '#000000',
      secondarySystemBackground: '#1C1C1E',
      tertiarySystemBackground: '#2C2C2E',
      systemGroupedBackground: '#000000',

      systemBlue: '#0A84FF',
      systemGreen: '#30D158',
      systemRed: '#FF453A',
      systemOrange: '#FF9F0A',
      systemPurple: '#BF5AF2',
      systemTeal: '#64D2FF',
      systemIndigo: '#5E5CE6',
      systemPink: '#FF375F',
      systemCyan: '#32ADE6',

      primary: '#0A84FF',
      primaryDark: '#0061e0',
      primaryLight: '#60a5fa',
      accent: '#BF5AF2',
      accentHover: '#8b5cf6',
      bgDark: '#000000',
      cardDark: '#1C1C1E',
      sidebarBg: '#1C1C1E',
      cardBorder: '#38383A',
      surfaceHover: '#2C2C2E',
      textMain: '#FFFFFF',
      textMuted: '#EBEBF5',
      textSub: '#EBEBF599',
      statusPending: '#FF9F0A',
      statusConfirmed: '#0A84FF',
      statusShipping: '#BF5AF2',
      statusDelivered: '#30D158',
      statusCancelled: '#FF453A',
      categoryTS: '#FF375F',
      categoryQA: '#64D2FF',
      orderTypeInStock: '#30D158',
      orderTypePreorder: '#FF9F0A',
      success: '#30D158',
      danger: '#FF453A',
      warning: '#FF9F0A',
      info: '#0A84FF'
    }
  },
  bright: {
    id: 'bright',
    name: 'Theme Bright (Trắng Đen)',
    desc: 'Nền sáng tối giản, độ tương phản chữ đen đậm sắc nét',
    previewBg: '#F2F2F7',
    previewAccent: '#007AFF',
    colors: {
      label: '#000000',
      secondaryLabel: '#3C3C43',
      tertiaryLabel: '#3C3C434D',
      systemBackground: '#FFFFFF',
      secondarySystemBackground: '#F2F2F7',
      tertiarySystemBackground: '#FFFFFF',
      systemGroupedBackground: '#F2F2F7',

      systemBlue: '#007AFF',
      systemGreen: '#34C759',
      systemRed: '#FF3B30',
      systemOrange: '#FF9500',
      systemPurple: '#AF52DE',
      systemTeal: '#5AC8FA',
      systemIndigo: '#5856D6',
      systemPink: '#FF2D55',
      systemCyan: '#32ADE6',

      primary: '#007AFF',
      primaryDark: '#005bb5',
      primaryLight: '#60a5fa',
      accent: '#AF52DE',
      accentHover: '#8b5cf6',
      bgDark: '#F2F2F7',
      cardDark: '#FFFFFF',
      sidebarBg: '#F2F2F7',
      cardBorder: '#C6C6C8',
      surfaceHover: '#E5E5EA',
      textMain: '#000000',
      textMuted: '#3C3C43',
      textSub: '#3C3C434D',
      statusPending: '#FF9500',
      statusConfirmed: '#007AFF',
      statusShipping: '#AF52DE',
      statusDelivered: '#34C759',
      statusCancelled: '#FF3B30',
      categoryTS: '#FF2D55',
      categoryQA: '#32ADE6',
      orderTypeInStock: '#34C759',
      orderTypePreorder: '#FF9500',
      success: '#34C759',
      danger: '#FF3B30',
      warning: '#FF9500',
      info: '#007AFF'
    }
  },
  pink: {
    id: 'pink',
    name: 'Theme Hồng (Sweetie Pink)',
    desc: 'Nền hồng pastel ngọt ngào, chữ hồng đô sang trọng',
    previewBg: '#fff1f2',
    previewAccent: '#FF2D55',
    colors: {
      label: '#881337',
      secondaryLabel: '#9f1239',
      tertiaryLabel: '#be123c',
      systemBackground: '#fff1f2',
      secondarySystemBackground: '#ffe4e6',
      tertiarySystemBackground: '#ffffff',
      systemGroupedBackground: '#fff1f2',

      systemBlue: '#007AFF',
      systemGreen: '#34C759',
      systemRed: '#FF3B30',
      systemOrange: '#FF9500',
      systemPurple: '#AF52DE',
      systemTeal: '#5AC8FA',
      systemIndigo: '#5856D6',
      systemPink: '#FF2D55',
      systemCyan: '#32ADE6',

      primary: '#FF2D55',
      primaryDark: '#e11d48',
      primaryLight: '#fb7185',
      accent: '#FF2D55',
      accentHover: '#db2777',
      bgDark: '#fff1f2',
      cardDark: '#ffffff',
      sidebarBg: '#ffe4e6',
      cardBorder: '#fecdd3',
      surfaceHover: '#ffe4e6',
      textMain: '#881337',
      textMuted: '#9f1239',
      textSub: '#be123c',
      statusPending: '#FF9500',
      statusConfirmed: '#FF2D55',
      statusShipping: '#AF52DE',
      statusDelivered: '#34C759',
      statusCancelled: '#FF3B30',
      categoryTS: '#FF2D55',
      categoryQA: '#32ADE6',
      orderTypeInStock: '#34C759',
      orderTypePreorder: '#FF9500',
      success: '#34C759',
      danger: '#FF3B30',
      warning: '#FF9500',
      info: '#007AFF'
    }
  },
  kuromi: {
    id: 'kuromi',
    name: 'Theme Tím Kuromi (Mystic Violet)',
    desc: 'Nền tím Kuromi mộng mơ, chữ sáng lung linh & nổi bật',
    previewBg: '#130b24',
    previewAccent: '#AF52DE',
    colors: {
      label: '#FFFFFF',
      secondaryLabel: '#EBEBF5',
      tertiaryLabel: '#EBEBF54D',
      systemBackground: '#130b24',
      secondarySystemBackground: '#21153b',
      tertiarySystemBackground: '#1a0e30',
      systemGroupedBackground: '#130b24',

      systemBlue: '#0A84FF',
      systemGreen: '#30D158',
      systemRed: '#FF453A',
      systemOrange: '#FF9F0A',
      systemPurple: '#AF52DE',
      systemTeal: '#64D2FF',
      systemIndigo: '#5E5CE6',
      systemPink: '#FF375F',
      systemCyan: '#32ADE6',

      primary: '#AF52DE',
      primaryDark: '#9333ea',
      primaryLight: '#c084fc',
      accent: '#FF375F',
      accentHover: '#e11d48',
      bgDark: '#130b24',
      cardDark: '#21153b',
      sidebarBg: '#1a0e30',
      cardBorder: '#4c327a',
      surfaceHover: '#2e1c50',
      textMain: '#FFFFFF',
      textMuted: '#EBEBF5',
      textSub: '#EBEBF599',
      statusPending: '#FF9F0A',
      statusConfirmed: '#AF52DE',
      statusShipping: '#FF375F',
      statusDelivered: '#30D158',
      statusCancelled: '#FF453A',
      categoryTS: '#FF375F',
      categoryQA: '#64D2FF',
      orderTypeInStock: '#30D158',
      orderTypePreorder: '#FF9F0A',
      success: '#30D158',
      danger: '#FF453A',
      warning: '#FF9F0A',
      info: '#AF52DE'
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

  // Generate CSS Variables dynamically from activeTheme.colors
  let cssVariables = ':root {\n';
  Object.keys(activeTheme.colors).forEach((key) => {
    // convert camelCase to kebab-case
    const kebabKey = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    cssVariables += `  --${kebabKey}: ${activeTheme.colors[key]};\n`;
  });
  cssVariables += '}\n';

  styleEl.innerHTML = `
    ${cssVariables}
    
    html, body, #root {
      background-color: var(--bg-dark);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro", "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
    }

    input, select, textarea {
      background-color: var(--bg-dark) !important;
      color: var(--text-main) !important;
      border-color: var(--card-border) !important;
    }
    
    input::placeholder, textarea::placeholder {
      color: var(--text-muted) !important;
      opacity: 0.85;
    }
    
    /* Native Select Options */
    option {
      background-color: var(--card-dark) !important;
      color: var(--text-main) !important;
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: var(--bg-dark) !important;
    }
    ::-webkit-scrollbar-thumb {
      background: var(--primary) !important;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: var(--primary-dark) !important;
    }

    /* Mobile Responsive Flex (max-width: 768px) */
    @media (max-width: 768px) {
      .responsive-app-wrapper {
        flex-direction: column !important;
      }
      .responsive-sidebar {
        width: 100% !important;
        height: auto !important;
        border-right: none !important;
        border-bottom: 1px solid var(--card-border) !important;
        flex-shrink: 0;
      }
      .responsive-sidebar .sidebar-menu-section {
        display: none !important;
      }
      .responsive-sidebar.expanded .sidebar-menu-section {
        display: flex !important;
      }
      .responsive-modal {
        width: 95% !important;
        max-width: 100% !important;
        margin: 10px !important;
      }
      .responsive-grid-container {
        padding: 8px !important;
      }
      .responsive-flex-wrap {
        flex-wrap: wrap !important;
      }
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
    <ThemeContext.Provider
      value={{ theme, setTheme: changeTheme, themeObj: activeThemeObj, colors: activeThemeObj.colors }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
