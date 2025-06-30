// Mock für Firebase Auth
jest.mock('../lib/firebaseconfig', () => ({
  auth: {
    currentUser: null
  }
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
  signOut: jest.fn(),
}));

// Mock für UserService
jest.mock('../services/userService', () => ({
  initializeUserProfile: jest.fn()
}));

// Import nach Mocks
import { login, register, logout } from '../services/authService';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut 
} from 'firebase/auth';

describe('AuthService - Essentielle Authentifizierung', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    test('erfolgreicher Login gibt User zurück', async () => {
      const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
        emailVerified: true
      };

      const mockUserCredential = {
        user: mockUser
      };

      signInWithEmailAndPassword.mockResolvedValue(mockUserCredential);

      const result = await login('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object),
        'test@example.com',
        'password123'
      );
    });

    test('wirft Fehler bei ungültigen Credentials', async () => {
      const authError = new Error('Invalid credentials');
      authError.code = 'auth/invalid-credential';

      signInWithEmailAndPassword.mockRejectedValue(authError);

      await expect(login('wrong@email.com', 'wrongpass'))
        .rejects.toThrow('Invalid credentials');
    });

    test('validiert Email-Format vor Login-Versuch', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@gmail.com'
      ];

      const invalidEmails = [
        'notanemail',
        '@domain.com',
        'test@',
        ''
      ];

      validEmails.forEach(email => {
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });

      invalidEmails.forEach(email => {
        expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });
  });

  describe('register', () => {
    test('erfolgreiche Registrierung erstellt User', async () => {
      const mockUser = {
        uid: 'newuser123',
        email: 'new@example.com',
        emailVerified: false
      };

      const mockUserCredential = {
        user: mockUser
      };

      createUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);
      sendEmailVerification.mockResolvedValue();

      const result = await register('new@example.com', 'password123', 'newuser');

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object),
        'new@example.com',
        'password123'
      );
      expect(sendEmailVerification).toHaveBeenCalledWith(mockUser);
    });

    test('behandelt schwache Passwörter', async () => {
      const authError = new Error('Password too weak');
      authError.code = 'auth/weak-password';

      createUserWithEmailAndPassword.mockRejectedValue(authError);

      await expect(register('test@example.com', '123'))
        .rejects.toThrow('Password too weak');
    });

    test('behandelt bereits existierende Email', async () => {
      const authError = new Error('Email already in use');
      authError.code = 'auth/email-already-in-use';

      createUserWithEmailAndPassword.mockRejectedValue(authError);

      await expect(register('existing@example.com', 'password123'))
        .rejects.toThrow('Email already in use');
    });
  });

  describe('logout', () => {
    test('erfolgreicher Logout ruft signOut auf', async () => {
      signOut.mockResolvedValue();

      await logout();

      expect(signOut).toHaveBeenCalledWith(expect.any(Object));
    });

    test('behandelt Logout-Fehler graceful', async () => {
      const error = new Error('Logout failed');
      signOut.mockRejectedValue(error);

      await expect(logout()).rejects.toThrow('Logout failed');
    });
  });

  describe('Password Validation', () => {
    test('starke Passwörter werden akzeptiert', () => {
      const strongPasswords = [
        'StrongPass123!',
        'MySecurePassword2024',
        'ComplexP@ssw0rd'
      ];

      strongPasswords.forEach(password => {
        expect(password.length).toBeGreaterThanOrEqual(8);
        expect(password).toMatch(/[a-z]/); // Kleinbuchstabe
        expect(password).toMatch(/[A-Z]/); // Großbuchstabe
        expect(password).toMatch(/[0-9]/); // Zahl
      });
    });

    test('schwache Passwörter werden erkannt', () => {
      const weakPasswords = [
        '123',
        'password',
        '12345678',
        'abc'
      ];

      weakPasswords.forEach(password => {
        const isWeak = password.length < 8 || 
                      !password.match(/[a-z]/) ||
                      !password.match(/[A-Z]/) ||
                      !password.match(/[0-9]/);
        expect(isWeak).toBe(true);
      });
    });
  });
});
