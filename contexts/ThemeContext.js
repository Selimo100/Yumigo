import React, { createContext, useContext, useState, useEffect } from 'react';
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
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
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
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};