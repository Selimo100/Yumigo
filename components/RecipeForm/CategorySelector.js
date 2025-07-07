import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {CATEGORIES} from '../../utils/constants';
import {useTheme} from '../../contexts/ThemeContext';

export default function CategorySelector({ selectedCategories, onToggleCategory, error }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Category *</Text>
      <Text style={styles.subtitle}>What type of dish is this?</Text>
      <View style={styles.categoriesContainer}>
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                isSelected && { backgroundColor: category.color },
                error && styles.errorBorder
              ]}
              onPress={() => onToggleCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.selectedCategoryText
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  errorBorder: {
    borderColor: '#DC3545',
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorText: {
    color: '#DC3545',
    fontSize: 12,
    marginTop: 4,
  },
});