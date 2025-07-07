import { Alert } from 'react-native';

// Simple toast utility for showing messages
// In a real app, you might want to use a library like react-native-toast-message

// Main function for backward compatibility
export const showToast = (message, type = 'success') => {
  console.log(`Toast ${type}:`, message);
  // For now, just log to console
  // In production, you could show a native alert or use a toast library
};

// Object methods for specific types
showToast.error = (message) => {
  console.warn('Toast Error:', message);
  // For now, just log to console
  // In production, you could show a native alert or use a toast library
  // Alert.alert('Error', message);
};

showToast.success = (message) => {
  console.log('Toast Success:', message);
  // For now, just log to console
};

showToast.info = (message) => {
  console.log('Toast Info:', message);
  // For now, just log to console
};
