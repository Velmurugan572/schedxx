import { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import storage from '../utils/storage.js';

export const palette = {
  blue: '#3B82F6',
  indigo: '#6366F1',
  purple: '#7C3AED',
  bgDark: '#0B1020',
  cardDark: '#161F32',
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  borderDark: 'rgba(255,255,255,0.08)',
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444'
};

export const darkTheme = {
  dark: true,
  colors: {
    background: palette.bgDark,
    card: palette.cardDark,
    text: palette.textPrimary,
    textMuted: palette.textSecondary,
    primary: palette.blue,
    secondary: palette.indigo,
    accent: palette.purple,
    border: palette.borderDark,
    error: palette.red,
    warning: palette.amber,
    success: palette.green
  }
};

export const lightTheme = {
  dark: false,
  colors: {
    background: palette.bgDark, // Keep dark theme as default premium SaaS styling for best enterprise feel
    card: palette.cardDark,
    text: palette.textPrimary,
    textMuted: palette.textSecondary,
    primary: palette.blue,
    secondary: palette.indigo,
    accent: palette.purple,
    border: palette.borderDark,
    error: palette.red,
    warning: palette.amber,
    success: palette.green
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
