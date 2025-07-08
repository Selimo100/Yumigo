// Toast - Utility-Funktionen für Toast-Benachrichtigungen (implementiert mit Alert)
import { Alert } from 'react-native';

export const showToast = (message, type = 'success') => {
  const title = type === 'error' ? 'Fehler' : type === 'success' ? 'Erfolg' : 'Info';
  Alert.alert(title, message);
};

showToast.error = (message) => {
  Alert.alert('Fehler', message);
};

showToast.success = (message) => {
  Alert.alert('Erfolg', message);
};

showToast.info = (message) => {
  Alert.alert('Info', message);
};
