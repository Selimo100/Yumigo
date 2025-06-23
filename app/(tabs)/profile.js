import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Image,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ProfileScreen({
                                        user,
                                        recipes = [],
                                        onEditProfile,
                                        onShareProfile,
                                        onRecipePress,
                                      }) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const defaultUser = {
    id: '1',
    username: 'Username',
    bio: 'Food enthusiast | 15-min recipe creator | Making cooking simple',
    following: 89,
    followers: 125,
    recipes: 2,
  };

  const defaultRecipes = [
    {
      id: '1',
      title: 'Quick Pasta Carbonara',
      time: '15 min',
      rating: 4.8,
      likes: 99,
      chef: 'Chef Mario',
    },
    {
      id: '2',
      title: 'Quick Pasta Carbonara',
      time: '16 min',
      rating: 4.8,
      likes: 99,
      chef: 'Chef Mario',
    },
  ];

  const currentUser = user || defaultUser;
  const recipeList = recipes.length > 0 ? recipes : defaultRecipes;

  const renderRecipeCard = (recipe) => (
      <TouchableOpacity
          key={recipe.id}
          style={styles.recipeCard}
          onPress={() => onRecipePress?.(recipe)}
      >
        <View style={styles.recipeImageContainer}>
          <View style={styles.recipeImagePlaceholder}>
            <Ionicons name="restaurant" size={40} color="#999" />
          </View>
          <View style={styles.timeTag}>
            <Ionicons name="time-outline" size={12} color="#fff" />
            <Text style={styles.timeText}>{recipe.time}</Text>
          </View>
        </View>

        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle} numberOfLines={2}>
            {recipe.title}
          </Text>
          <Text style={styles.chefName}>by {recipe.chef}</Text>

          <View style={styles.recipeStats}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#ffc107" />
              <Text style={styles.ratingText}>{recipe.rating}</Text>
            </View>

            <View style={styles.likesContainer}>
              <Ionicons name="heart-outline" size={14} color="#6c757d" />
              <Text style={styles.likesText}>{recipe.likes}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
  );

  return (
      <SafeAreaView
          style={[
            styles.container,
            { backgroundColor: isDarkMode ? '#000' : '#fff' },
          ]}
      >
        <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={isDarkMode ? '#000' : '#fff'}
        />

        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Header */}
          <View style={[styles.profileHeader, { backgroundColor: isDarkMode ? '#111' : '#fafafa' }]}>
            {/* Profile Picture */}
            <View style={styles.profilePicture}>
              {currentUser.profileImage ? (
                  <Image
                      source={{ uri: currentUser.profileImage }}
                      style={styles.profileImage}
                  />
              ) : (
                  <Ionicons name="person" size={50} color="#6c757d" />
              )}
            </View>

            <Text style={[styles.username, { color: isDarkMode ? '#fff' : '#212529' }]}>
              {currentUser.username}
            </Text>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : '#212529' }]}>{currentUser.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : '#212529' }]}>{currentUser.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : '#212529' }]}>{currentUser.recipes}</Text>
                <Text style={styles.statLabel}>Recipes</Text>
              </View>
            </View>

            <Text style={[styles.bio, { color: isDarkMode ? '#ccc' : '#495057' }]}>
              {currentUser.bio}
            </Text>

            {/* Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                  style={styles.editButton}
                  onPress={onEditProfile}
              >
                <Ionicons name="create-outline" size={18} color="#333" />
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                  style={styles.shareButton}
                  onPress={onShareProfile}
              >
                <Ionicons name="share-outline" size={18} color="#333" />
                <Text style={styles.buttonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recipes */}
          <View style={styles.recipesSection}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#212529' }]}>
              Your Recipes
            </Text>

            <View style={styles.recipesGrid}>
              {recipeList.map(renderRecipeCard)}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
  );
}
