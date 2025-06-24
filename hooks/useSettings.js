import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PROFILE: 'user_profile',
  NOTIFICATIONS: 'notification_settings',
};

export const useSettings = () => {
  const [profile, setProfile] = useState({
    username: 'Username',
    bio: 'Food enthusiast | 15-min recipe creator | Making cooking simple',
    email: 'user@example.com',
    profileImage: null,
  });

  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailNotifications: false,
    recipeRecommendations: true,
    socialUpdates: true,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load settings from AsyncStorage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Load profile
      const savedProfile = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }

      // Load notifications
      const savedNotifications = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const newProfile = { ...profile, ...updates };
      setProfile(newProfile);
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const updateNotification = async (key, value) => {
    try {
      const newNotifications = { ...notifications, [key]: value };
      setNotifications(newNotifications);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(newNotifications));
    } catch (error) {
      console.error('Failed to save notification setting:', error);
    }
  };

  const saveAllSettings = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile)),
        AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications))
      ]);
      return true;
    } catch (error) {
      console.error('Failed to save all settings:', error);
      return false;
    }
  };

  return {
    profile,
    notifications,
    isLoading,
    updateProfile,
    updateNotification,
    saveAllSettings,
  };
};
