import { validateRecipe } from '../utils/validation';

describe('Validation Utils', () => {
  describe('validateRecipe', () => {
    const validRecipe = {
      title: 'Spaghetti Carbonara',
      description: 'Ein klassisches italienisches Pasta-Gericht',
      time: 10,
      categories: ['Pasta'],
      ingredients: [
        { amount: '400g', ingredient: 'Spaghetti' },
        { amount: '200g', ingredient: 'Speck' }
      ],
      instructions: [
        'Wasser zum Kochen bringen',
        'Pasta ins kochende Wasser geben'
      ]
    };

    test('akzeptiert gültiges Rezept', () => {
      const result = validateRecipe(validRecipe);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    test('erkennt zu kurzen Titel', () => {
      const recipe = { ...validRecipe, title: 'AB' };
      const result = validateRecipe(recipe);
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBeDefined();
    });

    test('erkennt zu kurze Beschreibung', () => {
      const recipe = { ...validRecipe, description: 'Kurz' };
      const result = validateRecipe(recipe);
      expect(result.isValid).toBe(false);
      expect(result.errors.description).toBeDefined();
    });

    test('erkennt ungültige Kochzeit', () => {
      const recipe = { ...validRecipe, time: 20 };
      const result = validateRecipe(recipe);
      expect(result.isValid).toBe(false);
      expect(result.errors.time).toBeDefined();
    });

    test('erkennt fehlende Kategorien', () => {
      const recipe = { ...validRecipe, categories: [] };
      const result = validateRecipe(recipe);
      expect(result.isValid).toBe(false);
      expect(result.errors.categories).toBeDefined();
    });

    test('erkennt fehlende Zutaten', () => {
      const recipe = { ...validRecipe, ingredients: [] };
      const result = validateRecipe(recipe);
      expect(result.isValid).toBe(false);
      expect(result.errors.ingredients).toBeDefined();
    });

    test('erkennt fehlende Anweisungen', () => {
      const recipe = { ...validRecipe, instructions: [] };
      const result = validateRecipe(recipe);
      expect(result.isValid).toBe(false);
      expect(result.errors.instructions).toBeDefined();
    });
  });
});
