import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export const checkNotificationSettings = async () => {
  try {
    console.log('=== NOTIFICATION SETTINGS DEBUG ===');
    
    // Check device permissions
    const permissions = await Notifications.getPermissionsAsync();
    console.log('Device permissions:', permissions);
    
    // Check local storage settings
    const savedSettings = await AsyncStorage.getItem('notification_settings');
    console.log('Saved notification settings:', savedSettings);
    
    // Check if notifications are enabled in settings
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      console.log('Push notifications enabled:', settings.pushNotifications);
      console.log('Email notifications enabled:', settings.emailNotifications);
    }
    
    console.log('=== END DEBUG ===');
    
    return {
      permissions,
      savedSettings: savedSettings ? JSON.parse(savedSettings) : null
    };
  } catch (error) {
    console.error('Error checking notification settings:', error);
    return null;
  }
};

export const enableAllNotifications = async () => {
  try {
    console.log('Enabling all notifications...');
    
    // Request permissions if needed
    const { status } = await Notifications.requestPermissionsAsync();
    console.log('Permission request result:', status);
    
    // Enable all notification types in local storage
    const notificationSettings = {
      pushNotifications: true,
      emailNotifications: true,
      recipeRecommendations: true,
      socialUpdates: true,
    };
    
    await AsyncStorage.setItem('notification_settings', JSON.stringify(notificationSettings));
    console.log('All notifications enabled successfully');
    
    return status === 'granted';
  } catch (error) {
    console.error('Error enabling notifications:', error);
    return false;
  }
};
