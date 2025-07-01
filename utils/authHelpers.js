import { Alert } from 'react-native';

export const requireAuth = (user, actionName = 'perform this action') => {
  if (!user) {
    Alert.alert(
      "Login Required", 
      `You need to be logged in to ${actionName}.`
    );
    return false;
  }
  return true;
};

export const showAuthError = (error, actionName = 'complete the action') => {
  console.error(`Error during ${actionName}:`, error);
  Alert.alert(
    "Error", 
    `Could not ${actionName}. Please try again.`
  );
};
