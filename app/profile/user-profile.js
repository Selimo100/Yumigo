import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { getUserProfile, getUserRecipes, syncUserRecipeCount } from '../../services/userService';
import FollowButton from '../../components/FollowButton';
import RecipeCard from '../../components/RecipeCard';
import useAuth from '../../lib/useAuth';
import { profileUpdateEmitter } from '../../utils/profileUpdateEmitter';

export default function UserProfileScreen() {
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { userId } = useLocalSearchParams();
  
  const [userProfile, setUserProfile] = useState(null);
  const [userRecipes, setUserRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recipes');

  useEffect(() => {
    loadUserData();
  }, [userId]);

  // Listen for profile update events (e.g., when recipes are deleted)
  useEffect(() => {
    const unsubscribe = profileUpdateEmitter.subscribe(() => {
      loadUserData();
    });

    return unsubscribe;
  }, [userId]);

  // Listen for global flag to reload profile data after recipe deletion
  useFocusEffect(
    useCallback(() => {
      if (global.profileNeedsReload) {
        loadUserData();
        global.profileNeedsReload = false; // Reset flag
      }
    }, [])
  );

  const loadUserData = async () => {
    if (!userId) {
      console.error('No userId provided to user-profile');
      return;
    }
    
    console.log('Loading user data for userId:', userId);
    setIsLoading(true);
    try {
      console.log('Attempting to fetch user profile...');
      const profile = await getUserProfile(userId);
      console.log('User profile fetched:', profile);
      
      console.log('Attempting to fetch user recipes...');
      const recipes = await getUserRecipes(userId);
      console.log('User recipes fetched:', recipes?.length || 0, 'recipes');
      
      setUserProfile(profile);
      setUserRecipes(recipes);
      
      // Sync recipe count if there's a mismatch
      if (profile && recipes && profile.recipeCount !== recipes.length) {
        console.log(`Recipe count mismatch: profile shows ${profile.recipeCount}, actual recipes: ${recipes.length}`);
        try {
          await syncUserRecipeCount(userId);
          // Reload profile to get updated count
          const updatedProfile = await getUserProfile(userId);
          setUserProfile(updatedProfile);
          console.log('Recipe count synchronized');
        } catch (syncError) {
          console.warn('Failed to sync recipe count:', syncError);
        }
      }
    } catch (error) {
      console.error('Error initializing user profile:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        userId: userId
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowChange = (isNowFollowing) => {
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        followerCount: isNowFollowing 
          ? (userProfile.followerCount || 0) + 1
          : Math.max(0, (userProfile.followerCount || 0) - 1)
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.button} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            User not found
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.button }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: theme.colors.buttonText }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCurrentUser = currentUser?.uid === userId;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backIconButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {userProfile.username}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Profile Section */}
        <View style={[styles.profileSection, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.profileHeader}>
            <View
              style={[
                styles.profilePicture,
                { backgroundColor: theme.colors.border, borderColor: theme.colors.surface },
              ]}
            >
              {userProfile.avatar ? (
                <Image source={{ uri: userProfile.avatar }} style={styles.profileImage} />
              ) : (
                <Ionicons name="person" size={50} color={theme.colors.textSecondary} />
              )}
            </View>

            <Text style={[styles.username, { color: theme.colors.text }]}>
              {userProfile.username}
            </Text>

            <Text style={[styles.bio, { color: theme.colors.textSecondary }]}>
              {userProfile.bio || 'Food enthusiast'}
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                  {userProfile.followingCount || 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Following
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                  {userProfile.followerCount || 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Followers
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                  {userProfile.recipeCount || 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Recipes
                </Text>
              </View>
            </View>

            {!isCurrentUser && (
              <FollowButton
                userId={userId}
                size="large"
                onFollowChange={handleFollowChange}
                style={styles.followButton}
              />
            )}
          </View>
        </View>

        {/* Content Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'recipes' && { backgroundColor: theme.colors.button }
            ]}
            onPress={() => setActiveTab('recipes')}
          >
            <Ionicons 
              name="restaurant" 
              size={18} 
              color={activeTab === 'recipes' ? theme.colors.buttonText : theme.colors.textSecondary} 
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'recipes' 
                    ? theme.colors.buttonText 
                    : theme.colors.textSecondary
                }
              ]}
            >
              Recipes ({userRecipes.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'about' && { backgroundColor: theme.colors.button }
            ]}
            onPress={() => setActiveTab('about')}
          >
            <Ionicons 
              name="information-circle" 
              size={18} 
              color={activeTab === 'about' ? theme.colors.buttonText : theme.colors.textSecondary} 
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'about' 
                    ? theme.colors.buttonText 
                    : theme.colors.textSecondary
                }
              ]}
            >
              About
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'recipes' ? (
          <View style={styles.recipesContainer}>
            {userRecipes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="restaurant-outline" size={64} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                  No recipes yet
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                  {isCurrentUser 
                    ? "Start creating delicious recipes to share with the community!"
                    : `${userProfile.username} hasn't shared any recipes yet.`
                  }
                </Text>
                {isCurrentUser && (
                  <TouchableOpacity
                    style={[styles.createRecipeButton, { backgroundColor: theme.colors.button }]}
                    onPress={() => router.push('/recipe/create-recipe')}
                  >
                    <Ionicons name="add" size={20} color={theme.colors.buttonText} />
                    <Text style={[styles.createRecipeButtonText, { color: theme.colors.buttonText }]}>
                      Create Your First Recipe
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              userRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))
            )}
          </View>
        ) : (
          <View style={styles.aboutContainer}>
            <View style={[styles.aboutSection, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.aboutTitle, { color: theme.colors.text }]}>
                About {userProfile.username}
              </Text>
              <Text style={[styles.aboutBio, { color: theme.colors.textSecondary }]}>
                {userProfile.bio || 'This user hasn\'t added a bio yet.'}
              </Text>
              
              <View style={styles.joinedContainer}>
                <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.joinedText, { color: theme.colors.textSecondary }]}>
                  Joined {userProfile.createdAt 
                    ? new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })
                    : 'recently'
                  }
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backIconButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  profileSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  followButton: {
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recipesContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  createRecipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
    gap: 8,
  },
  createRecipeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  aboutContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  aboutSection: {
    padding: 20,
    borderRadius: 16,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  aboutBio: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  joinedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  joinedText: {
    fontSize: 14,
  },
});
