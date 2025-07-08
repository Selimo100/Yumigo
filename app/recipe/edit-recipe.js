import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {router, useLocalSearchParams} from 'expo-router';
import {useTheme} from '../../contexts/ThemeContext';
import {getRecipe, isRecipeOwner, updateRecipe} from '../../services/recipeService';
import useAuth from '../../lib/useAuth';
import ImageUpload from '../../components/RecipeForm/ImageUpload';
import CategorySelector from '../../components/RecipeForm/CategorySelector';
import DietarySelector from '../../components/RecipeForm/DietarySelector';
import AllergenSelector from '../../components/RecipeForm/AllergenSelector';
import IngredientInput from '../../components/RecipeForm/IngredientInput';
import InstructionInput from '../../components/RecipeForm/InstructionInput';
import TimePicker from '../../components/RecipeForm/TimePicker';

export default function EditRecipeScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const { user } = useAuth();
  const styles = createStyles(theme);
  const [originalRecipe, setOriginalRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null,
    categories: [],
    dietary: [],
    allergens: [],
    ingredients: [{ amount: '', ingredient: '' }],
    instructions: [''],
    time: 15,
  });
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title || formData.title.trim().length < 3) {
      newErrors.title = 'Recipe title must be at least 3 characters long';
    }
    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    }
    if (!formData.categories || formData.categories.length === 0) {
      newErrors.categories = 'Please select at least one category';
    }
    if (!formData.ingredients || formData.ingredients.length === 0) {
      newErrors.ingredients = 'Please add at least one ingredient';
    } else {
      const validIngredients = formData.ingredients.filter(
        item => item.ingredient && item.ingredient.trim() && item.amount && item.amount.trim()
      );
      if (validIngredients.length === 0) {
        newErrors.ingredients = 'Please add at least one complete ingredient';
      }
    }
    if (!formData.instructions || formData.instructions.length === 0) {
      newErrors.instructions = 'Please add at least one instruction step';
    } else {
      const validInstructions = formData.instructions.filter(
        instruction => instruction && instruction.trim().length > 0
      );
      if (validInstructions.length === 0) {
        newErrors.instructions = 'Please add at least one instruction step';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  useEffect(() => {
    loadRecipe();
  }, [id]);
  const loadRecipe = async () => {
    if (!id) {
      Alert.alert('Error', 'Recipe ID not found');
      router.back();
      return;
    }
    try {
      setLoading(true);
      const recipe = await getRecipe(id);
      if (!recipe) {
        Alert.alert('Error', 'Recipe not found');
        router.back();
        return;
      }
      if (!isRecipeOwner(recipe, user?.uid)) {
        Alert.alert('Access Denied', 'You can only edit your own recipes');
        router.back();
        return;
      }
      setOriginalRecipe(recipe);
      const ingredients = recipe.ingredients || [];
      const formattedIngredients = ingredients.length > 0 
        ? ingredients.map(ing => {
            if (typeof ing === 'string') {
              const parts = ing.split(' ');
              const amount = parts[0] || '';
              const ingredient = parts.slice(1).join(' ') || '';
              return { amount, ingredient };
            } else if (ing.name) {
              return { 
                amount: ing.amount || '', 
                ingredient: ing.name || ''
              };
            } else {
              return { 
                amount: ing.amount || '', 
                ingredient: ing.ingredient || ''
              };
            }
          })
        : [{ amount: '', ingredient: '' }];
      setFormData({
        title: recipe.title || '',
        description: recipe.description || '',
        image: recipe.imageUrl || null,
        categories: recipe.categories || [],
        dietary: recipe.dietary || [],
        allergens: recipe.allergens || [],
        ingredients: formattedIngredients,
        instructions: recipe.instructions || [''],
        time: recipe.time || 15,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load recipe');
      router.back();
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Please fix the errors', 'Some fields are missing or invalid');
      return;
    }
    try {
      setSaving(true);
      const updatedRecipe = await updateRecipe(
        id,
        {
          ...formData,
          imageUrl: originalRecipe.imageUrl 
        },
        formData.image !== originalRecipe.imageUrl ? formData.image : null
      );
      Alert.alert(
        'Recipe Updated',
        'Your recipe has been updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              global.recipeEditCompleted = true;
              global.profileNeedsReload = true;
              router.back();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update recipe. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        {
          text: 'Keep Editing',
          style: 'cancel'
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => router.back()
        }
      ]
    );
  };
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.button} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading recipe...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {}
      <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Edit Recipe
        </Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, { backgroundColor: theme.colors.button }]}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={theme.colors.buttonText} />
          ) : (
            <Text style={[styles.saveButtonText, { color: theme.colors.buttonText }]}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <ImageUpload
            image={formData.image ? { uri: formData.image } : null}
            onImageSelect={(image) => setFormData({ ...formData, image: image.uri })}
            error={errors.image}
          />
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Recipe Title *</Text>
            <TextInput
              style={[styles.input, errors.title && styles.errorBorder]}
              placeholder="Enter recipe title"
              placeholderTextColor={theme.colors.textSecondary}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
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
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              returnKeyType="next"
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>
          <TimePicker
            time={formData.time}
            onTimeChange={(time) => setFormData({ ...formData, time })}
            error={errors.time}
          />
          <CategorySelector
            selectedCategories={formData.categories}
            onToggleCategory={(categoryId) => {
              const updatedCategories = formData.categories.includes(categoryId)
                ? formData.categories.filter(id => id !== categoryId)
                : [...formData.categories, categoryId];
              setFormData({ ...formData, categories: updatedCategories });
            }}
            error={errors.categories}
          />
          <AllergenSelector
            selectedAllergens={formData.allergens}
            onToggleAllergen={(allergenId) => {
              const updated = formData.allergens.includes(allergenId)
                ? formData.allergens.filter(id => id !== allergenId)
                : [...formData.allergens, allergenId];
              setFormData({ ...formData, allergens: updated });
            }}
          />
          <DietarySelector
            selectedDietary={formData.dietary}
            onToggleDietary={(dietaryId) => {
              const updated = formData.dietary.includes(dietaryId)
                ? formData.dietary.filter(id => id !== dietaryId)
                : [...formData.dietary, dietaryId];
              setFormData({ ...formData, dietary: updated });
            }}
          />
          <IngredientInput
            ingredients={formData.ingredients}
            onUpdateIngredient={(index, field, value) => {
              const updatedIngredients = [...formData.ingredients];
              updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
              setFormData({ ...formData, ingredients: updatedIngredients });
            }}
            onAddIngredient={() => {
              setFormData({ 
                ...formData, 
                ingredients: [...formData.ingredients, { amount: '', ingredient: '' }] 
              });
            }}
            onRemoveIngredient={(index) => {
              const updatedIngredients = formData.ingredients.filter((_, i) => i !== index);
              setFormData({ ...formData, ingredients: updatedIngredients });
            }}
            error={errors.ingredients}
          />
          <InstructionInput
            instructions={formData.instructions}
            onUpdateInstruction={(index, value) => {
              const updatedInstructions = [...formData.instructions];
              updatedInstructions[index] = value;
              setFormData({ ...formData, instructions: updatedInstructions });
            }}
            onAddInstruction={() => {
              setFormData({ 
                ...formData, 
                instructions: [...formData.instructions, ''] 
              });
            }}
            onRemoveInstruction={(index) => {
              const updatedInstructions = formData.instructions.filter((_, i) => i !== index);
              setFormData({ ...formData, instructions: updatedInstructions });
            }}
            error={errors.instructions}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
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
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
  },
  textArea: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    minHeight: 80,
  },
  errorBorder: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});
