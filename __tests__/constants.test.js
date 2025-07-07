import { CATEGORIES, ALLERGENS, DIETARY, COLORS } from '../utils/constants';

describe('Constants - Essentielle App-Konstanten', () => {
  describe('CATEGORIES', () => {
    test('enthält alle erwarteten Kategorien', () => {
      const expectedCategories = ['salty', 'sweet', 'spicy', 'sour', 'cold', 'hot'];
      const actualIds = CATEGORIES.map(cat => cat.id);
      
      expectedCategories.forEach(expected => {
        expect(actualIds).toContain(expected);
      });
    });

    test('jede Kategorie hat notwendige Eigenschaften', () => {
      CATEGORIES.forEach(category => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('label');
        expect(category).toHaveProperty('color');
        expect(category).toHaveProperty('icon');
        expect(category).toHaveProperty('slug');

        expect(typeof category.label).toBe('string');
        expect(typeof category.color).toBe('string');
        expect(typeof category.icon).toBe('string');
        expect(typeof category.slug).toBe('string');
      });
    });

    test('alle Kategorie-IDs sind eindeutig', () => {
      const ids = CATEGORIES.map(cat => cat.id);
      const uniqueIds = [...new Set(ids)];
      
      expect(ids.length).toBe(uniqueIds.length);
    });

    test('Farben sind gültige Hex-Codes', () => {
      CATEGORIES.forEach(category => {
        expect(category.color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  describe('ALLERGENS', () => {
    test('enthält wichtige Allergene', () => {
      const allergenIds = ALLERGENS.map(allergen => allergen.id);
      
      expect(allergenIds).toContain('gluten');
      expect(allergenIds).toContain('dairy');
      expect(allergenIds).toContain('nuts');
      expect(allergenIds).toContain('eggs');
    });

    test('jedes Allergen hat notwendige Eigenschaften', () => {
      ALLERGENS.forEach(allergen => {
        expect(allergen).toHaveProperty('id');
        expect(allergen).toHaveProperty('label');
        expect(allergen).toHaveProperty('color');
        expect(allergen).toHaveProperty('icon');
        
        expect(typeof allergen.id).toBe('string');
        expect(typeof allergen.label).toBe('string');
        expect(typeof allergen.color).toBe('string');
        expect(typeof allergen.icon).toBe('string');
      });
    });

    test('mindestens 5 Allergene vorhanden', () => {
      expect(ALLERGENS.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('DIETARY', () => {
    test('enthält wichtige Ernährungsformen', () => {
      const dietaryIds = DIETARY.map(diet => diet.id);
      
      expect(dietaryIds).toContain('vegan');
      expect(dietaryIds).toContain('vegetarian');
      expect(dietaryIds).toContain('gluten-free');
    });

    test('jede Ernährungsform hat notwendige Eigenschaften', () => {
      DIETARY.forEach(diet => {
        expect(diet).toHaveProperty('id');
        expect(diet).toHaveProperty('label');
        expect(diet).toHaveProperty('color');
        expect(diet).toHaveProperty('icon');
      });
    });
  });

  describe('COLORS', () => {
    test('enthält primäre App-Farben', () => {
      expect(COLORS).toHaveProperty('primary');
      expect(COLORS).toHaveProperty('secondary');
      expect(COLORS).toHaveProperty('background');
      expect(COLORS).toHaveProperty('white');
      expect(COLORS).toHaveProperty('black');
    });

    test('Farben sind gültige Hex-Codes oder bekannte Namen', () => {
      Object.values(COLORS).forEach(color => {
        // Hex-Code oder bekannte Farbnamen
        expect(
          color.match(/^#[0-9A-F]{6}$/i) || 
          ['white', 'black'].includes(color.toLowerCase())
        ).toBeTruthy();
      });
    });
  });
});
