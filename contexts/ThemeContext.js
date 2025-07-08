// Theme Context - Globale Theme-Verwaltung für Dark/Light Mode
import {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
    }
  };

  const theme = {
    isDarkMode,
    colors: {
      background: isDarkMode ? '#000000' : '#FFFFFF',
      surface: isDarkMode ? '#111111' : '#F5F5F5',
      border: isDarkMode ? '#333333' : '#E0E0E0',
      text: isDarkMode ? '#FFFFFF' : '#000000',
      textSecondary: isDarkMode ? '#666666' : '#666666',
      tabBarBackground: isDarkMode ? '#000000' : '#FFFFFF',
      tabBarActive: isDarkMode ? '#FFFFFF' : '#000000',
      tabBarInactive: isDarkMode ? '#666666' : '#999999',
      button: isDarkMode ? '#333333' : '#E0E0E0',
      buttonText: isDarkMode ? '#FFFFFF' : '#000000',
      error: '#FF6B6B',
      
      primary: '#0D6159', 
      primaryLight: isDarkMode ? '#1A7A6E' : '#0D6159',
      secondary: '#A5B68D', 
      secondaryLight: isDarkMode ? '#8FA876' : '#B8C5A0',
      accent: isDarkMode ? '#A5B68D' : '#0D6159',
      accentBackground: isDarkMode ? 'rgba(165, 182, 141, 0.1)' : 'rgba(13, 97, 89, 0.05)',
      
      cardAccent: isDarkMode ? 'rgba(165, 182, 141, 0.08)' : 'rgba(13, 97, 89, 0.03)',
      iconAccent: isDarkMode ? '#8FA876' : '#0D6159',
      successAccent: '#4CAF50',
      successBackground: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)',
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};