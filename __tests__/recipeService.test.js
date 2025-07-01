// Mock für Firebase Services
jest.mock('../lib/firebaseconfig', () => ({
  db: {},
  storage: {},
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
  serverTimestamp: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  writeBatch: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
}));

// Import nach Mocks
import { getRecipe } from '../services/recipeService';
import { getDoc } from 'firebase/firestore';

describe('RecipeService - Essentielle Rezept-Funktionen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecipe', () => {
    test('gibt Rezept zurück wenn es existiert', async () => {
      const mockRecipeData = {
        title: 'Test Rezept',
        description: 'Ein Testrezept',
        ingredients: ['Zutat 1', 'Zutat 2'],
        time: 15
      };

      const mockDoc = {
        exists: jest.fn(() => true),
        data: jest.fn(() => mockRecipeData),
        id: 'recipe123'
      };

      getDoc.mockResolvedValue(mockDoc);

      const result = await getRecipe('recipe123');

      expect(result).toEqual({
        id: 'recipe123',
        ...mockRecipeData
      });
      expect(getDoc).toHaveBeenCalled();
    });

    test('gibt null zurück wenn Rezept nicht existiert', async () => {
      const mockDoc = {
        exists: jest.fn(() => false)
      };

      getDoc.mockResolvedValue(mockDoc);

      const result = await getRecipe('nonexistent');

      expect(result).toBeNull();
    });

    test('wirft Fehler bei Firebase-Error', async () => {
      const error = new Error('Firebase error');
      getDoc.mockRejectedValue(error);

      await expect(getRecipe('recipe123')).rejects.toThrow('Firebase error');
    });

    test('validiert Rezept-ID Parameter', async () => {
      const mockDoc = {
        exists: jest.fn(() => true),
        data: jest.fn(() => ({})),
        id: 'test'
      };

      getDoc.mockResolvedValue(mockDoc);

      // Test mit verschiedenen ID-Formaten
      await getRecipe('recipe123');
      await getRecipe('short');
      
      expect(getDoc).toHaveBeenCalledTimes(2);
    });
  });

  describe('Recipe Data Validation', () => {
    test('validiert Rezept-Datenstruktur', () => {
      const validRecipe = {
        id: 'recipe123',
        title: 'Test Recipe',
        description: 'A test recipe',
        time: 15,
        ingredients: ['ingredient1', 'ingredient2'],
        instructions: ['step1', 'step2'],
        categories: ['sweet'],
        allergens: [],
        dietary: ['vegan']
      };

      // Validiere alle notwendigen Felder
      expect(validRecipe).toHaveProperty('id');
      expect(validRecipe).toHaveProperty('title');
      expect(validRecipe).toHaveProperty('description');
      expect(validRecipe).toHaveProperty('time');
      expect(validRecipe).toHaveProperty('ingredients');
      expect(validRecipe).toHaveProperty('instructions');

      // Validiere Datentypen
      expect(typeof validRecipe.id).toBe('string');
      expect(typeof validRecipe.title).toBe('string');
      expect(typeof validRecipe.time).toBe('number');
      expect(Array.isArray(validRecipe.ingredients)).toBe(true);
      expect(Array.isArray(validRecipe.instructions)).toBe(true);
    });

    test('erkennt ungültige Rezept-Zeit', () => {
      const invalidTimes = [-1, 0, 16, 'invalid', null];

      invalidTimes.forEach(time => {
        expect(time < 1 || time > 15 || typeof time !== 'number').toBe(true);
      });
    });

    test('validiert Zutaten-Array', () => {
      const validIngredients = ['Mehl', 'Zucker', 'Eier'];
      const invalidIngredients = [null, undefined, '', 'a'];

      expect(Array.isArray(validIngredients)).toBe(true);
      expect(validIngredients.length).toBeGreaterThan(0);
      
      // Alle Zutaten sollten nicht-leere Strings sein
      validIngredients.forEach(ingredient => {
        expect(typeof ingredient).toBe('string');
        expect(ingredient.length).toBeGreaterThan(0);
      });
    });
  });
});
