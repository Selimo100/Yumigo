import { Alert } from 'react-native';

// Simple toast utility for showing error messages
// In a real app, you might want to use a library like react-native-toast-message

export const showToast = {
  error: (message) => {
    console.warn('Toast Error:', message);
    // For now, just log to console
    // In production, you could show a native alert or use a toast library
    // Alert.alert('Error', message);
  },
  
  success: (message) => {
    console.log('Toast Success:', message);
    // For now, just log to console
  },
  
  info: (message) => {
    console.log('Toast Info:', message);
    // For now, just log to console
  }
};
