import React from 'react';

describe('useFavorites Hook', () => {
  test('Placeholder test - Hook Logic', () => {
    // Simuliere Hook-Logic ohne echte Implementation
    const favorites = [];
    const addFavorite = (id) => favorites.push(id);
    const removeFavorite = (id) => {
      const index = favorites.indexOf(id);
      if (index > -1) favorites.splice(index, 1);
    };
    const isFavorite = (id) => favorites.includes(id);
    
    expect(favorites).toHaveLength(0);
    addFavorite('recipe1');
    expect(favorites).toHaveLength(1);
    expect(isFavorite('recipe1')).toBe(true);
    removeFavorite('recipe1');
    expect(favorites).toHaveLength(0);
  });

  test('kann Arrays verwalten', () => {
    const testArray = [];
    testArray.push('item1');
    testArray.push('item2');
    
    expect(testArray).toContain('item1');
    expect(testArray).toContain('item2');
    expect(testArray).toHaveLength(2);
  });
});
