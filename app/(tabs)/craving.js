import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

const cravingTypes = [
  { id: 1, label: 'Salty', emoji: '🧂', color: '#4A90E2', slug: 'salty' },
  { id: 2, label: 'Sweet', emoji: '🍯', color: '#F5A623', slug: 'sweet' },
  { id: 3, label: 'Sour', emoji: '🍋', color: '#7ED321', slug: 'sour' },
  { id: 4, label: 'Spicy', emoji: '🌶️', color: '#D0021B', slug: 'spicy' },
  { id: 5, label: 'Cold', emoji: '🧊', color: '#50E3C2', slug: 'cold' },
  { id: 6, label: 'Hot', emoji: '🔥', color: '#F8E71C', slug: 'hot' },
];

export default function ExploreScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleCravingPress = (craving) => {
    router.push(`/category/${craving.slug}`); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What are you craving?</Text>
        <Text style={styles.subtitle}>Discover recipes by taste</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cravingsGrid}>
          {cravingTypes.map((craving) => (
            <TouchableOpacity
              key={craving.id}
              style={[styles.cravingButton, { borderColor: craving.color }]}
              onPress={() => handleCravingPress(craving)}
              activeOpacity={0.8}
            >
              <Text style={styles.cravingEmoji}>{craving.emoji}</Text>
              <Text style={styles.cravingLabel}>{craving.label}</Text>
              <View style={[styles.colorDot, { backgroundColor: craving.color }]} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cravingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
  },
  cravingButton: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  cravingEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  cravingLabel: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 12,
    right: 12,
  },
});