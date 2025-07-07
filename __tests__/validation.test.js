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

    test('behandelt null/undefined Werte graceful', () => {
      const invalidRecipes = [
        null,
        undefined,
        {},
        { title: null },
        { title: '', description: null }
      ];

      invalidRecipes.forEach(recipe => {
        expect(() => {
          const result = validateRecipe(recipe || {});
          expect(result.isValid).toBe(false);
        }).not.toThrow();
      });
    });

    test('validiert Ingredient-Struktur', () => {
      const validIngredientStructure = [
        { amount: '200g', ingredient: 'Mehl' },
        { amount: '1 TL', ingredient: 'Salz' }
      ];

      const invalidIngredientStructures = [
        [{ amount: '', ingredient: 'Mehl' }], // Leere Menge
        [{ amount: '200g', ingredient: '' }], // Leere Zutat
      ];

      const validRecipeWithIngredients = { 
        ...validRecipe, 
        ingredients: validIngredientStructure 
      };
      const validResult = validateRecipe(validRecipeWithIngredients);
      expect(validResult.isValid).toBe(true);

      invalidIngredientStructures.forEach(invalidIngredients => {
        const invalidRecipe = { 
          ...validRecipe, 
          ingredients: invalidIngredients 
        };
        const result = validateRecipe(invalidRecipe);
        expect(result.isValid).toBe(false);
        expect(result.errors.ingredients).toBeDefined();
      });
    });

    test('validiert Zeitbereich korrekt', () => {
      const validTimes = [1, 5, 10, 15];
      const invalidTimes = [0, -1, 16, 20];

      validTimes.forEach(time => {
        const recipe = { ...validRecipe, time };
        const result = validateRecipe(recipe);
        expect(result.isValid).toBe(true);
      });

      invalidTimes.forEach(time => {
        const recipe = { ...validRecipe, time };
        const result = validateRecipe(recipe);
        expect(result.isValid).toBe(false);
        expect(result.errors.time).toBeDefined();
      });
    });

    test('validiert Kategorien-Array', () => {
      const validCategories = [
        ['sweet'],
        ['salty', 'hot'],
        ['cold', 'sweet', 'sour']
      ];

      const invalidCategories = [
        [], // Leer
      ];

      validCategories.forEach(categories => {
        const recipe = { ...validRecipe, categories };
        const result = validateRecipe(recipe);
        expect(result.isValid).toBe(true);
      });

      invalidCategories.forEach(categories => {
        const recipe = { ...validRecipe, categories };
        const result = validateRecipe(recipe);
        expect(result.isValid).toBe(false);
        expect(result.errors.categories).toBeDefined();
      });
    });

    test('gibt detaillierte Error-Objekte zurück', () => {
      const completelyInvalidRecipe = {
        title: 'AB', // Zu kurz
        description: 'Short', // Zu kurz
        time: 20, // Zu hoch
        categories: [], // Leer
        ingredients: [], // Leer
        instructions: [] // Leer
      };

      const result = validateRecipe(completelyInvalidRecipe);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('title');
      expect(result.errors).toHaveProperty('description');
      expect(result.errors).toHaveProperty('time');
      expect(result.errors).toHaveProperty('categories');
      expect(result.errors).toHaveProperty('ingredients');
      expect(result.errors).toHaveProperty('instructions');
    });
  });

  describe('Edge Cases und Sicherheit', () => {
    const baseValidRecipe = {
      title: 'Test Rezept',
      description: 'Ein Testrezept mit ausreichender Länge',
      time: 10,
      categories: ['sweet'],
      ingredients: [
        { amount: '200g', ingredient: 'Mehl' }
      ],
      instructions: [
        'Schritt 1 der Anleitung'
      ]
    };

    test('behandelt sehr lange Eingaben', () => {
      const veryLongTitle = 'A'.repeat(1000);
      const veryLongDescription = 'B'.repeat(5000);

      const recipe = {
        ...baseValidRecipe,
        title: veryLongTitle,
        description: veryLongDescription
      };

      expect(() => {
        const result = validateRecipe(recipe);
        
      }).not.toThrow();
    });

    test('behandelt Sonderzeichen in Eingaben', () => {
      const specialCharTitle = 'Schöne Spätzle mit Würst & Sauerkraut! 🍽️';
      const recipe = {
        ...baseValidRecipe,
        title: specialCharTitle
      };

      const result = validateRecipe(recipe);
      expect(result.isValid).toBe(true);
    });

    test('validiert Performance bei großen Arrays', () => {
      const manyIngredients = Array(100).fill(0).map((_, i) => ({
        amount: `${i}g`,
        ingredient: `Zutat ${i}`
      }));

      const recipe = {
        ...baseValidRecipe,
        ingredients: manyIngredients
      };

      const startTime = Date.now();
      const result = validateRecipe(recipe);
      const endTime = Date.now();

      expect(result.isValid).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Sollte unter 100ms dauern
    });
  });
});
