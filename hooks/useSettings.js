import { useState, useEffect } from 'react';
import { auth } from '../lib/firebaseconfig';
import { getUserProfile, updateUserProfile } from '../services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  NOTIFICATIONS: 'notification_settings',
};

export const useSettings = () => {
  const [profile, setProfile] = useState({
    username: '',
    bio: '',
    email: '',
    avatar: null,
  });

  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailNotifications: false,
    recipeRecommendations: true,
    socialUpdates: true,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load settings
  useEffect(() => {
    loadSettings();
  }, []);
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Load profile from Firestore
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userProfile = await getUserProfile(currentUser.uid);
          if (userProfile) {
            setProfile({
              username: userProfile.username || '',
              bio: userProfile.bio || '',
              email: userProfile.email || currentUser.email || '',
              avatar: userProfile.avatar || null,
            });
          } else {
            // Fallback to auth user data if no profile found
            setProfile({
              username: currentUser.email?.split('@')[0] || '',
              bio: 'Food enthusiast | Making cooking simple',
              email: currentUser.email || '',
              avatar: null,
            });
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Fallback to auth user data
          setProfile({
            username: currentUser.email?.split('@')[0] || '',
            bio: 'Food enthusiast | Making cooking simple',
            email: currentUser.email || '',
            avatar: null,
          });
        }
      }

      // Load notifications from AsyncStorage (keep local)
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
  const updateProfile = (updates) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
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
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Save profile to Firestore
      await updateUserProfile(currentUser.uid, {
        username: profile.username,
        bio: profile.bio,
        email: profile.email,
        avatar: profile.avatar,
      });

      // Save notifications to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      
      // Reload settings to reflect changes
      await loadSettings();
      
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
