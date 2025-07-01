import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Image,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import useAuth from "../../lib/useAuth";
import { useUserProfile } from '../../hooks/useUserProfile';
import { logout } from '../../services/authService';
import { useRouter, useFocusEffect } from 'expo-router';
import { profileUpdateEmitter } from '../../utils/profileUpdateEmitter';
import { useFollow } from '../../hooks/useFollow';
import ShoppingListModal from '../../components/ShoppingListModal';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';

const { width } = Dimensions.get('window');

export default function ProfileScreen({
  onShareProfile,
  onRecipePress,
}) {
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const tabBarHeight = useTabBarHeight();
  const styles = createStyles(theme, tabBarHeight);
  const { user } = useAuth();
  const { profile: userProfile, recipes: userRecipes, isLoading: profileLoading, refreshProfile } = useUserProfile();
  const { followingList, followersList, followingCount, followerCount, loadFollowingUsers, loadFollowers } = useFollow();
  const router = useRouter();
  const [showShoppingList, setShowShoppingList] = useState(false);

  useEffect(() => {
    const unsubscribe = profileUpdateEmitter.subscribe(() => {
      if (refreshProfile) {
        refreshProfile();
      }
      loadFollowingUsers();
      loadFollowers();
    });

    return unsubscribe;
  }, [refreshProfile, loadFollowingUsers, loadFollowers]);

  // Load follow data when component mounts or user changes
  useEffect(() => {
    if (user?.uid) {
      loadFollowingUsers();
      loadFollowers();
    }
  }, [user?.uid, loadFollowingUsers, loadFollowers]);

  // Refresh profile data when screen comes into focus (only if needed)
  useFocusEffect(
    useCallback(() => {
      // Only refresh if we don't have recent data
      if (refreshProfile && (!userRecipes || userRecipes.length === 0)) {
        refreshProfile();
      }
    }, [refreshProfile, userRecipes])
  );

  // Listen for global flag to reload profile data after recipe deletion
  useFocusEffect(
    useCallback(() => {
      if (global.profileNeedsReload && refreshProfile) {
        refreshProfile();
        global.profileNeedsReload = false; // Reset flag
      }
    }, [refreshProfile])
  );

  if (profileLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentUser = userProfile || {
    username: user?.email?.split('@')[0] || 'User',
    bio: 'Food enthusiast | Making cooking simple',
    followerCount: 0,
    followingCount: 0,
    recipeCount: 0,
    avatar: null,
  };
  
  // Use real-time counts from useFollow hook with fallback to profile data
  const displayFollowingCount = followingCount ?? followingList?.length ?? currentUser.followingCount ?? 0;
  const displayFollowerCount = followerCount ?? followersList?.length ?? currentUser.followerCount ?? 0;
  
  const recipeList = userRecipes || [];

  const renderRecipeCard = (recipe) => (
    <TouchableOpacity
      key={recipe.id}
      style={[
        styles.recipeCard,
        { backgroundColor: theme.colors.surface },
      ]}
      onPress={() => router.push(`/recipe/${recipe.id}`)}
    >
      <View style={styles.recipeImageContainer}>
        {recipe.imageUrl ? (
          <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImagePlaceholder} />
        ) : (
          <View
            style={[
              styles.recipeImagePlaceholder,
              { backgroundColor: theme.colors.border },
            ]}
          >
            <Ionicons name="restaurant" size={40} color="#999" />
          </View>
        )}
        <View style={styles.timeTag}>
          <Ionicons name="time-outline" size={12} color="#fff" />
          <Text style={styles.timeText}>{recipe.cookingTime || recipe.time || '-- min'}</Text>
        </View>
      </View>

      <View style={styles.recipeInfo}>
        <Text style={[styles.recipeTitle, { color: theme.colors.text }]}>
          {recipe.title}
        </Text>
        <Text style={[styles.chefName, { color: theme.colors.textSecondary }]}>
          by {recipe.authorName || 'You'}
        </Text>

        <View style={styles.recipeStats}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#ffc107" />
            <Text style={[styles.ratingText, { color: theme.colors.text }]}>
              {recipe.rating || '4.5'}
            </Text>
          </View>

          <View style={styles.likesContainer}>
            <Ionicons name="heart-outline" size={14} color="#6c757d" />
            <Text style={[styles.likesText, { color: theme.colors.textSecondary }]}>
              {recipe.likesCount || recipe.likes || '0'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleShareProfile = async () => {
    try {
      const shareText = `👨‍🍳 Check out ${currentUser.username}'s profile on Yumigo!

📝 ${currentUser.bio || 'Food enthusiast | Making cooking simple'}

📊 Stats:
👥 ${displayFollowerCount} followers
👤 ${displayFollowingCount} following  
🍽️ ${recipeList.length} delicious recipes

Join the Yumigo community and discover amazing recipes!`;

      const result = await Share.share({
        message: shareText,
        title: `${currentUser.username}'s Yumigo Profile`,
      });

      if (result.action === Share.sharedAction) {
        console.log('Profile shared successfully!');
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
      Alert.alert('Error', 'Could not share profile. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileHeader}>
          <View style={styles.profilePicture}>
          {currentUser.avatar ? (
            <Image source={{ uri: currentUser.avatar }} style={styles.profileImage} />
          ) : (
            <Ionicons name="person" size={50} color={theme.colors.textSecondary} />
          )}
        </View>

          <Text style={styles.username}>
            {currentUser.username}
          </Text>

          <View style={styles.statsContainer}>
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => {
                loadFollowingUsers();
                router.push('/profile/follow-list?type=following');
              }}
            >
              <Text style={styles.statNumber}>
                {displayFollowingCount}
              </Text>
              <Text style={styles.statLabel}>
                Following
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => {
                loadFollowers();
                router.push('/profile/follow-list?type=followers');
              }}
            >
              <Text style={styles.statNumber}>
                {displayFollowerCount}
              </Text>
              <Text style={styles.statLabel}>
                Followers
              </Text>
            </TouchableOpacity>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {currentUser.recipeCount || 0}
              </Text>
              <Text style={styles.statLabel}>
                Recipes
              </Text>
            </View>
          </View>

          <Text style={styles.bio}>
            {currentUser.bio}
          </Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/profile/settings')}
            >
              <Ionicons name="create-outline" size={18} color="#FFFFFF" />
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareProfile}
            >
              <Ionicons name="share-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shoppingListButton}
              onPress={() => setShowShoppingList(true)}
            >
              <Ionicons name="basket-outline" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.recipesSection}>
          <View style={styles.recipesSectionHeader}>
            <Text style={styles.sectionTitle}>
              My Recipes ({recipeList.length})
            </Text>
            {recipeList.length > 0 && (
              <TouchableOpacity
                style={styles.addRecipeButton}
                onPress={() => router.push('/recipe/create-recipe')}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          {profileLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>
                Loading recipes...
              </Text>
            </View>
          ) : recipeList.length > 0 ? (
            <View style={styles.recipesGrid}>{recipeList.map(renderRecipeCard)}</View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={48} color={theme.colors.primary} />
              <Text style={styles.emptyTitle}>
                No recipes yet
              </Text>
              <Text style={styles.emptySubtitle}>
                Start creating delicious recipes to share with the community!
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/recipe/create-recipe')}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.createButtonText}>
                  Create Recipe
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Shopping List Modal */}
      <ShoppingListModal
        visible={showShoppingList}
        onClose={() => setShowShoppingList(false)}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme, tabBarHeight) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: tabBarHeight + 24, // Add padding for tab bar plus existing padding
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: theme.colors.cardAccent,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    overflow: 'hidden',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: theme.colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginHorizontal: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
    color: theme.colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  discoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.accentBackground,
    marginHorizontal: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  shoppingListButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginLeft: 8,
  },
  discoverButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  recipesSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: theme.colors.primary,
  },
  recipesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addRecipeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  recipesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recipeCard: {
    width: (width - 64) / 2,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.cardAccent,
  },
  recipeImageContainer: {
    position: 'relative',
    height: 120,
  },
  recipeImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.cardAccent,
  },
  timeTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  timeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  recipeInfo: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
    color: theme.colors.text,
  },
  chefName: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  recipeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likesText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: theme.colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    color: theme.colors.textSecondary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  logoutSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.surface,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.error,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: theme.colors.text,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    color: theme.colors.textSecondary,
  },
  createRecipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});
