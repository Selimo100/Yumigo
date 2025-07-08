// Ingredient Input - Dynamische Eingabekomponente für Rezeptzutaten
import {StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../../contexts/ThemeContext';

export default function IngredientInput({ 
  ingredients, 
  onUpdateIngredient, 
  onAddIngredient, 
  onRemoveIngredient,
  error 
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Ingredients *</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddIngredient}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>List all ingredients with their amounts</Text>
      
      {ingredients.map((item, index) => (
        <View key={index} style={styles.ingredientRow}>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Amount</Text>
            <TextInput
              style={[styles.amountInput, error && styles.errorBorder]}
              placeholder="100g"
              placeholderTextColor={theme.colors.textSecondary}
              value={item.amount}
              onChangeText={(text) => onUpdateIngredient(index, 'amount', text)}
              returnKeyType="next"
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Ingredient</Text>
            <TextInput
              style={[styles.ingredientInput, error && styles.errorBorder]}
              placeholder="Flour"
              placeholderTextColor={theme.colors.textSecondary}
              value={item.ingredient}
              onChangeText={(text) => onUpdateIngredient(index, 'ingredient', text)}
              returnKeyType="next"
            />
          </View>
          {ingredients.length > 1 && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemoveIngredient(index)}
            >
              <Ionicons name="trash-outline" size={20} color="#DC3545" />
            </TouchableOpacity>
          )}
        </View>
      ))}
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  ingredientRow: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputRow: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.text,
  },
  ingredientInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.text,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  errorBorder: {
    borderColor: '#DC3545',
  },
  errorText: {
    color: '#DC3545',
    fontSize: 12,
    marginTop: 4,
  },
});