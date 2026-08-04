import { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import storage from '../utils/storage.js';

export const palette = {
  indigo: '#4f46e5',
  teal: '#0d9488',
  slate900: '#0f172a',
  slate800: '#1e293b',
  slate700: '#334155',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  white: '#ffffff',
  red: '#ef4444',
  amber: '#f59e0b',
  gray: '#94a3b8'
};

export const darkTheme = {
  dark: true,
  colors: {
    background: palette.slate900,
    card: palette.slate800,
    text: palette.slate100,
    textMuted: palette.gray,
    primary: palette.indigo,
    accent: palette.teal,
    border: palette.slate700,
    error: palette.red,
    warning: palette.amber
  }
};

export const lightTheme = {
  dark: false,
  colors: {
    background: palette.slate100,
    card: palette.white,
    text: palette.slate900,
    textMuted: palette.slate700,
    primary: palette.indigo,
    accent: palette.teal,
    border: palette.slate200,
    error: palette.red,
    warning: palette.amber
  }
};

const ThemeContext = createContext({
  theme: darkTheme,
  themeMode: 'dark', // 'light' | 'dark' | 'system'
  setThemeMode: () => {}
});

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState('dark');

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await storage.getItem('user_theme_preference');
      if (savedTheme) {
        setThemeModeState(savedTheme);
      }
    };
    loadTheme();
  }, []);

  const setThemeMode = async (mode) => {
    setThemeModeState(mode);
    await storage.setItem('user_theme_preference', mode);
  };

  const getActiveTheme = () => {
    if (themeMode === 'system') {
      return systemColorScheme === 'light' ? lightTheme : darkTheme;
    }
    return themeMode === 'light' ? lightTheme : darkTheme;
  };

  const theme = getActiveTheme();

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode }}>
      {children}
    </ThemeContextContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
