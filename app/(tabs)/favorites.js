import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import RecipeCard from '../../components/RecipeCard';
import { useTheme } from '../../contexts/ThemeContext';
import useFavorites from '../../hooks/useFavorites';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';

export default function FavoritesScreen() {
  const { theme } = useTheme();
  const { favorites, isLoading } = useFavorites();
  const tabBarHeight = useTabBarHeight();
  const styles = createStyles(theme, tabBarHeight);
  const [searchQuery, setSearchQuery] = useState('');

  // Simple filter function for favorites
  const getFilteredFavorites = useCallback(() => {
    if (!searchQuery.trim()) {
      return favorites;
    }
    
    const query = searchQuery.toLowerCase();
    
    return favorites.filter(recipe => {
      // Check title
      if (recipe.title?.toLowerCase().includes(query)) {
        return true;
      }
      
      // Check description
      if (recipe.description?.toLowerCase().includes(query)) {
        return true;
      }
      
      // Check ingredients (handle different data structures)
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        return recipe.ingredients.some(ingredient => {
          if (typeof ingredient === 'string') {
            return ingredient.toLowerCase().includes(query);
          }
          if (ingredient && typeof ingredient === 'object' && ingredient.name) {
            return ingredient.name.toLowerCase().includes(query);
          }
          return false;
        });
      }
      
      return false;
    });
  }, [favorites, searchQuery]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Favorites</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.button} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading your favorites...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        {favorites.length > 0 && (
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {favorites.length} recipe{favorites.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search favorites..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {getFilteredFavorites().length > 0 ? (
        <ScrollView 
          style={styles.feed} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedContent}
        >
          {getFilteredFavorites().map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </ScrollView>
      ) : favorites.length > 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={80} color={theme.colors.button} />
          <Text style={styles.emptyText}>No results found</Text>
          <Text style={styles.emptySubtext}>
            No favorites match "{searchQuery}"
          </Text>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={80} color={theme.colors.button} />
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>
            Start exploring recipes and save your favorites here
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme, tabBarHeight) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: '#FFFFFF', // White background for header
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    color: theme.colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  feed: {
    flex: 1,
    paddingTop: 10,
  },
  feedContent: {
    paddingBottom: tabBarHeight, // Add padding to prevent content being hidden behind tab bar
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.cardAccent,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: 10,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
});