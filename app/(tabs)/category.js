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
      },
      {
        id: 4,
        title: 'Garlic Butter Shrimp',
        image: 'https://via.placeholder.com/300x200',
        time: '12 min',
        rating: 4.7,
        reviews: 89,
        author: 'SeafoodLover',
      },
      {
        id: 5,
        title: 'Crispy Bacon Sandwich',
        image: 'https://via.placeholder.com/300x200',
        time: '8 min',
        rating: 4.5,
        reviews: 156,
        author: 'BreakfastKing',
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
      },
      {
        id: 7,
        title: 'Quick Fruit Parfait',
        image: 'https://via.placeholder.com/300x200',
        time: '5 min',
        rating: 4.6,
        reviews: 78,
        author: 'HealthyEats',
      }
    ]
  },
  sour: {
    name: 'Sour',
    emoji: '🍋',
    color: '#7ED321',
    description: 'Tangy and zesty flavor combinations',
    recipes: [
      {
        id: 8,
        title: 'Lemon Garlic Chicken',
        image: 'https://via.placeholder.com/300x200',
        time: '18 min',
        rating: 4.7,
        reviews: 145,
        author: 'CitrusChef',
      }
    ]
  },
  spicy: {
    name: 'Spicy',
    emoji: '🌶️',
    color: '#D0021B',
    description: 'Fiery hot recipes for spice lovers',
    recipes: [
      {
        id: 9,
        title: 'Spicy Thai Noodles',
        image: 'https://via.placeholder.com/300x200',
        time: '14 min',
        rating: 4.8,
        reviews: 167,
        author: 'SpiceKing',
      },
      {
        id: 10,
        title: 'Jalapeño Poppers',
        image: 'https://via.placeholder.com/300x200',
        time: '16 min',
        rating: 4.4,
        reviews: 92,
        author: 'HotStuff',
      }
    ]
  },
  cold: {
    name: 'Cold',
    emoji: '🧊',
    color: '#50E3C2',
    description: 'Refreshing cold dishes and drinks',
    recipes: [
      {
        id: 11,
        title: 'Iced Coffee Smoothie',
        image: 'https://via.placeholder.com/300x200',
        time: '3 min',
        rating: 4.5,
        reviews: 134,
        author: 'CoffeeLover',
      }
    ]
  },
  hot: {
    name: 'Hot',
    emoji: '🔥',
    color: '#F8E71C',
    description: 'Warm and comforting hot meals',
    recipes: [
      {
        id: 12,
        title: 'Spicy Ramen Bowl',
        image: 'https://via.placeholder.com/300x200',
        time: '12 min',
        rating: 4.9,
        reviews: 189,
        author: 'RamenMaster',
      }
    ]
  }
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