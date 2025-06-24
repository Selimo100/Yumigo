export const validateRecipe = (recipe) => {
  const errors = {};

  if (!recipe.title || recipe.title.trim().length < 3) {
    errors.title = 'Recipe title must be at least 3 characters long';
  }

  if (!recipe.description || recipe.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters long';
  }

  if (!recipe.time || recipe.time < 1 || recipe.time > 15) {
    errors.time = 'Cooking time must be between 1 and 15 minutes';
  }

  if (!recipe.categories || recipe.categories.length === 0) {
    errors.categories = 'Please select at least one category';
  }

  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    errors.ingredients = 'Please add at least one ingredient';
  } else {
    const validIngredients = recipe.ingredients.filter(
      item => item.amount.trim() && item.ingredient.trim()
    );
    if (validIngredients.length === 0) {
      errors.ingredients = 'Please add at least one complete ingredient';
    }
  }

  if (!recipe.instructions || recipe.instructions.length === 0) {
    errors.instructions = 'Please add at least one instruction step';
  } else {
    const validInstructions = recipe.instructions.filter(
      instruction => instruction.trim().length > 0
    );
    if (validInstructions.length === 0) {
      errors.instructions = 'Please add at least one instruction step';
    } else if (validInstructions.some(instruction => instruction.trim().length < 5)) {
      errors.instructions = 'Each instruction step must be at least 5 characters long';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};