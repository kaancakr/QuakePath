import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/Colors';

type ThemeType = 'light' | 'dark';

interface ThemeColors extends Record<keyof typeof Colors, string> {
  background: string;
  card: string;
  text: string;
  border: string;
  notification: string;
  headerBackground: string;
  headerText: string;
  lightGreen: string;
  darkTeal: string;
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
        background: '#121212',
        card: '#1e1e1e',
        text: '#f5f5f5',
        border: '#333333',
        notification: Colors.primary,
        light: '#121212',
        dark: '#f5f5f5',
        grey: '#a0a0a0',
        primary: Colors.darkGreen,
        headerBackground: Colors.darkGreen,
        headerText: '#ffffff',
        // Enhanced green colors for dark mode
        green: '#2c5530',
        darkGreen: '#1a331d',
        lightGreen: '#3c7340',
        teal: '#264d4a',
        darkTeal: '#1a3533',
      };
    }
    
    return {
      ...baseColors,
      background: '#f5f5f5',
      card: '#ffffff',
      text: '#000000',
      border: '#e0e0e0',
      notification: Colors.primary,
      headerBackground: Colors.light,
      headerText: Colors.dark,
      // Enhanced green colors for light mode
      green: Colors.green,
      darkGreen: Colors.darkGreen,
      lightGreen: '#4d8f53',
      teal: Colors.teal,
      darkTeal: '#1d3b39',
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
