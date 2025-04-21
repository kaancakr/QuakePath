import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/Colors';

type ThemeType = 'light' | 'dark';

interface ThemeColors extends Record<keyof typeof Colors, string> {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  notification: string;
  headerBackground: string;
  headerText: string;
  input: string;
  selected: string;
}

interface ThemeContextType {
  theme: ThemeType;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('light');

  useEffect(() => {
    // Load saved theme preference
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setThemeState(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };

    loadTheme();
  }, []);

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Get the appropriate color palette based on the current theme
  const getColors = (): ThemeColors => {
    const baseColors = { ...Colors };
    
    if (theme === 'dark') {
      return {
        ...baseColors,
        background: Colors.darkBackground,
        card: Colors.darkCard,
        text: Colors.darkText,
        textSecondary: Colors.darkTextSecondary,
        border: Colors.darkBorder,
        notification: Colors.darkPrimary,
        headerBackground: Colors.darkHeaderBackground,
        headerText: Colors.darkHeaderText,
        input: Colors.darkInput,
        selected: Colors.darkSelected,
      };
    }
    
    return {
      ...baseColors,
      background: Colors.background,
      card: Colors.card,
      text: Colors.text,
      textSecondary: Colors.textSecondary,
      border: Colors.border,
      notification: Colors.primary,
      headerBackground: Colors.headerBackground,
      headerText: Colors.headerText,
      input: Colors.input,
      selected: Colors.selected,
    };
  };

  const value = {
    theme,
    isDarkMode: theme === 'dark',
    toggleTheme,
    setTheme,
    colors: getColors(),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
