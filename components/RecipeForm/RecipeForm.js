import React from 'react';
import {ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {useRecipeForm} from '../../hooks/useRecipeForm';
import {saveRecipe, uploadImage} from '../../lib/firebaseconfig';
import ImageUpload from './ImageUpload';
import CategorySelector from './CategorySelector';
import AllergenSelector from './AllergenSelector';
import DietarySelector from './DietarySelector';
import IngredientInput from './IngredientInput';
import InstructionInput from './InstructionInput';
import TimePicker from './TimePicker';
import {useTheme} from '../../contexts/ThemeContext';
import {smartButton, smartInput} from '../../utils/platformStyles';

export default function RecipeForm({ onSuccess, onCancel }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const {
    recipe,
    errors,
    isLoading,
    setIsLoading,
    updateField,
    addIngredient,
    removeIngredient,
    updateIngredient,
    addInstruction,
    removeInstruction,
    updateInstruction,
    toggleCategory,
    toggleAllergen,
    toggleDietary,
    validateForm,
    resetForm
  } = useRecipeForm();

  const handlePublish = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before publishing.');
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl = null;
      
      // Upload image if exists
      if (recipe.image) {
        const fileName = `recipe_${Date.now()}.jpg`;
        imageUrl = await uploadImage(recipe.image.uri, fileName);
      }

      // Prepare recipe data
      const recipeData = {
        title: recipe.title.trim(),
        description: recipe.description.trim(),
        // *** FIX APPLIED HERE: Use recipe.time directly ***
        time: recipe.time, // TimePicker should already return "X min" or "X mins"
        // **************************************************
        categories: recipe.categories,
        allergens: recipe.allergens,
        dietary: recipe.dietary,
        ingredients: recipe.ingredients.filter(
          item => item.amount.trim() && item.ingredient.trim()
        ),
        instructions: recipe.instructions.filter(
          instruction => instruction.trim()
        ),
        imageUrl,
      };

      // Save to Firebase
      const recipeId = await saveRecipe(recipeData);
      
      // Reset form and navigate first
      resetForm();
      onSuccess && onSuccess(recipeId);
    } catch (error) {
      Alert.alert('Error', 'Failed to publish recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
        keyboardDismissMode="on-drag"
      >
        <View style={styles.form}>
          <ImageUpload
            image={recipe.image}
            onImageSelect={(image) => updateField('image', image)}
            error={errors.image}
          />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Recipe Title *</Text>
            <TextInput
              style={[styles.input, errors.title && styles.errorBorder]}
              placeholder="Enter recipe title"
              placeholderTextColor={theme.colors.textSecondary}
              value={recipe.title}
              onChangeText={(text) => updateField('title', text)}
              returnKeyType="next"
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.errorBorder]}
              placeholder="Tell us about your recipe"
              placeholderTextColor={theme.colors.textSecondary}
              value={recipe.description}
              onChangeText={(text) => updateField('description', text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              returnKeyType="next"
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          <TimePicker
            time={recipe.time}
            onTimeChange={(time) => updateField('time', time)}
            error={errors.time}
          />

          <CategorySelector
            selectedCategories={recipe.categories}
            onToggleCategory={toggleCategory}
            error={errors.categories}
          />

          <AllergenSelector
            selectedAllergens={recipe.allergens}
            onToggleAllergen={toggleAllergen}
            error={errors.allergens}
          />

          <DietarySelector
            selectedDietary={recipe.dietary}
            onToggleDietary={toggleDietary}
          />

          <IngredientInput
            ingredients={recipe.ingredients}
            onUpdateIngredient={updateIngredient}
            onAddIngredient={addIngredient}
            onRemoveIngredient={removeIngredient}
            error={errors.ingredients}
          />

          <InstructionInput
            instructions={recipe.instructions}
            onUpdateInstruction={updateInstruction}
            onAddInstruction={addInstruction}
            onRemoveInstruction={removeInstruction}
            error={errors.instructions}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.publishButton, isLoading && styles.disabledButton]}
              onPress={handlePublish}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.text} />
              ) : (
                <Text style={styles.publishButtonText}>Publish Recipe</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  form: {
    padding: 20,
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: theme.colors.text,
  },
  input: {
    ...smartInput(theme, false),
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    ...smartInput(theme, false, {
      minHeight: 80,
      textAlignVertical: 'top',
    }),
  },
  errorBorder: {
    borderColor: '#DC3545',
  },
  errorText: {
    color: '#DC3545',
    fontSize: 12,
    marginTop: 4,
  },
 buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
    marginBottom: 20,
  },
  cancelButton: {
    ...smartButton(theme, false, {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
    }),
  },
  publishButton: {
    ...smartButton(theme, true, {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
    }),
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});