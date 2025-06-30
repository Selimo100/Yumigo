import { requireAuth, showAuthError } from '../utils/authHelpers';
import { Alert } from 'react-native';

// Mock für React Native Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

describe('AuthHelpers - Essentielle Auth-Funktionen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requireAuth', () => {
    test('gibt true zurück wenn User eingeloggt ist', () => {
      const user = { uid: 'test123', email: 'test@example.com' };
      
      const result = requireAuth(user, 'like a recipe');
      
      expect(result).toBe(true);
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    test('zeigt Alert und gibt false zurück wenn User nicht eingeloggt', () => {
      const result = requireAuth(null, 'like a recipe');
      
      expect(result).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Login Required',
        'You need to be logged in to like a recipe.'
      );
    });

    test('verwendet Standard-Text wenn kein actionName angegeben', () => {
      const result = requireAuth(null);
      
      expect(result).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Login Required',
        'You need to be logged in to perform this action.'
      );
    });

    test('behandelt undefined User korrekt', () => {
      const result = requireAuth(undefined, 'save recipe');
      
      expect(result).toBe(false);
      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  describe('showAuthError', () => {
    test('zeigt Error Alert mit korrekter Nachricht', () => {
      const error = new Error('Network error');
      
      showAuthError(error, 'save recipe');
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Could not save recipe. Please try again.'
      );
    });

    test('verwendet Standard-Text wenn kein actionName angegeben', () => {
      const error = new Error('Test error');
      
      showAuthError(error);
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Could not complete the action. Please try again.'
      );
    });

    test('loggt Error in Console', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');
      
      showAuthError(error, 'login');
      
      expect(consoleSpy).toHaveBeenCalledWith('Error during login:', error);
      
      consoleSpy.mockRestore();
    });
  });
});
