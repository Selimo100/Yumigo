import ingredientsData from '../utils/ingredients.json';

// Prüft, ob eine Zutat für ein Land+Monat saisonal ist
export function isIngredientSeasonal(ingredientId, country, month) {
  const ingredient = ingredientsData.find(ing => ing.id === ingredientId);
  if (!ingredient || !ingredient.season || !ingredient.season[country]) return false;
  return ingredient.season[country].includes(month);
}

// Prüft, ob ein Rezept mindestens eine saisonale Zutat enthält
export function recipeHasSeasonalIngredient(recipe, country, month) {
  if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) return false;
  return recipe.ingredients.some(ing => {
    let id = typeof ing === 'string' ? ing : (ing && ing.id);
    if (!id) return false;
    return isIngredientSeasonal(id, country, month);
  });
}
