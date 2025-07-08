// Dietary Selector - Komponente zur Auswahl von Ernährungsformen (vegan, glutenfrei, etc.)
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {DIETARY} from '../../utils/constants';
import {useTheme} from '../../contexts/ThemeContext';

export default function DietarySelector({ selectedDietary, onToggleDietary }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Dietary Information</Text>
      <Text style={styles.subtitle}>What dietary preferences does this recipe meet?</Text>
      <View style={styles.dietaryContainer}>
        {DIETARY.map((dietary) => {
          const isSelected = selectedDietary.includes(dietary.id);
          return (
            <TouchableOpacity
              key={dietary.id}
              style={[
                styles.dietaryButton,
                { borderColor: dietary.color },
                isSelected && { backgroundColor: dietary.color + '20' }
              ]}
              onPress={() => onToggleDietary(dietary.id)}
            >
              <Text style={styles.dietaryIcon}>{dietary.icon}</Text>
              <Text
                style={[
                  styles.dietaryText,
                  { color: theme.colors.text },
                  isSelected && { color: dietary.color, fontWeight: '600' }
                ]}
              >
                {dietary.label}
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
  dietaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dietaryButton: {
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
  dietaryIcon: {
    fontSize: 14,
  },
  dietaryText: {
    fontSize: 13,
    fontWeight: '500',
  },
});