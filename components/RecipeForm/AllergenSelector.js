// Allergen Selector - Komponente zur Auswahl von Allergenen im Rezeptformular
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ALLERGENS} from '../../utils/constants';
import {useTheme} from '../../contexts/ThemeContext';

export default function AllergenSelector({ selectedAllergens, onToggleAllergen }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Contains Allergens</Text>
      <Text style={styles.subtitle}>Select what your recipe contains</Text>
      <View style={styles.allergenContainer}>
        {ALLERGENS.map((allergen) => {
          const isSelected = selectedAllergens.includes(allergen.id);
          return (
            <TouchableOpacity
              key={allergen.id}
              style={[
                styles.allergenButton,
                { borderColor: allergen.color },
                isSelected && { backgroundColor: allergen.color + '20' }
              ]}
              onPress={() => onToggleAllergen(allergen.id)}
            >
              <Text style={styles.allergenIcon}>{allergen.icon}</Text>
              <Text
                style={[
                  styles.allergenText,
                  { color: theme.colors.text },
                  isSelected && { color: allergen.color, fontWeight: '600' }
                ]}
              >
                {allergen.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  allergenContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: theme.colors.surface,
    gap: 6,
    marginBottom: 8,
  },
  allergenIcon: {
    fontSize: 14,
  },
  allergenText: {
    fontSize: 13,
    fontWeight: '500',
  },
});