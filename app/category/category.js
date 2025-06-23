import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import RecipeCard from '../../components/RecipeCard';

const categoryData = {
  salty: {
    name: 'Salty',
    emoji: '🧂',
    color: '#4A90E2',
    description: 'Savory recipes that satisfy your salt cravings',
    recipes: [
      {
        id: 1,
        title: 'Quick Pasta Carbonara',
        image: 'https://via.placeholder.com/300x200',
        time: '15 min',
        rating: 4.8,
        reviews: 124,
        author: 'Chef Mario',
        allergies: ['gluten', 'dairy'],
        categories: ['salty', 'hot'],
      },
      {
        id: 4,
        title: 'Garlic Butter Shrimp',
        image: 'https://via.placeholder.com/300x200',
        time: '12 min',
        rating: 4.7,
        reviews: 89,
        author: 'SeafoodLover',
        allergies: ['shellfish'],
        categories: ['salty', 'hot'],
      },
      {
        id: 5,
        title: 'Crispy Bacon Sandwich',
        image: 'https://via.placeholder.com/300x200',
        time: '8 min',
        rating: 4.5,
        reviews: 156,
        author: 'BreakfastKing',
        allergies: ['gluten'],
        categories: ['salty'],
      }
    ]
  },
  sweet: {
    name: 'Sweet',
    emoji: '🍯',
    color: '#F5A623',
    description: 'Delightful sweet treats and desserts',
    recipes: [
      {
        id: 6,
        title: 'Chocolate Chip Cookies',
        image: 'https://via.placeholder.com/300x200',
        time: '20 min',
        rating: 4.9,
        reviews: 203,
        author: 'BakeQueen',
        allergies: ['gluten', 'dairy'],
        categories: ['sweet'],
      },
      {
        id: 7,
        title: 'Quick Fruit Parfait',
        image: 'https://via.placeholder.com/300x200',
        time: '5 min',
        rating: 4.6,
        reviews: 78,
        author: 'HealthyEats',
        allergies: ['dairy'],
        categories: ['sweet', 'cold'],
      }
    ]
  },
};

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const category = categoryData[slug] || categoryData.salty;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.emoji}>{category.emoji}</Text>
          <Text style={styles.title}>{category.name} Recipes</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Category Info */}
      <View style={styles.categoryInfo}>
        <Text style={styles.description}>{category.description}</Text>
        <Text style={styles.recipeCount}>{category.recipes.length} recipes</Text>
      </View>

      {/* Recipe List */}
      <ScrollView style={styles.recipeList} showsVerticalScrollIndicator={false}>
        {category.recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  categoryInfo: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  recipeCount: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  recipeList: {
    flex: 1,
    paddingTop: 10,
  },
});