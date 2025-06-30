import React, { useEffect, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import useAuth from "../../lib/useAuth";
import { useUserProfile } from '../../hooks/useUserProfile';
import {logout} from '../../services/authService';
import {useRouter} from 'expo-router';
import { profileUpdateEmitter } from '../../utils/profileUpdateEmitter';

const {width} = Dimensions.get('window');

export default function ProfileScreen({
                                          onEditProfile,
                                          onShareProfile,
                                          onRecipePress,
                                      }) {
    const {theme, toggleTheme, isDarkMode} = useTheme();
    const {user} = useAuth();
    const { profile: userProfile, recipes: userRecipes, isLoading: profileLoading, refreshProfile } = useUserProfile();
    const router = useRouter();

    // Listen for profile updates from settings
    useEffect(() => {        const unsubscribe = profileUpdateEmitter.subscribe(() => {
            if (refreshProfile) {
                refreshProfile();
            }
        });

        return unsubscribe;
    }, [refreshProfile]);

    // Show loading state while profile is loading
    if (profileLoading) {
        return (
            <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.button} />
                    <Text style={[styles.loadingText, {color: theme.colors.textSecondary}]}>
                        Loading profile...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Use the real user profile data or fallback only if no profile exists
    const currentUser = userProfile || {
        username: user?.email?.split('@')[0] || 'User',
        bio: 'Food enthusiast | Making cooking simple',
        followerCount: 0,
        followingCount: 0,
        recipeCount: 0,
        avatar: null,
    };    // Use real user recipes
    const recipeList = userRecipes || [];

    const renderRecipeCard = (recipe) => (
        <TouchableOpacity
            key={recipe.id}
            style={[
                styles.recipeCard,
                {backgroundColor: theme.colors.surface},
            ]}
            onPress={() => onRecipePress?.(recipe)}
        >
            <View style={styles.recipeImageContainer}>
                {recipe.imageUrl ? (
                    <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImagePlaceholder} />
                ) : (
                    <View
                        style={[
                            styles.recipeImagePlaceholder,
                            {backgroundColor: theme.colors.border},
                        ]}
                    >
                        <Ionicons name="restaurant" size={40} color="#999"/>
                    </View>
                )}
                <View style={styles.timeTag}>
                    <Ionicons name="time-outline" size={12} color="#fff"/>
                    <Text style={styles.timeText}>{recipe.cookingTime || recipe.time || '-- min'}</Text>
                </View>
            </View>

            <View style={styles.recipeInfo}>
                <Text style={[styles.recipeTitle, {color: theme.colors.text}]}>
                    {recipe.title}
                </Text>
                <Text style={[styles.chefName, {color: theme.colors.textSecondary}]}>
                    by {recipe.authorName || 'You'}
                </Text>

                <View style={styles.recipeStats}>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#ffc107"/>
                        <Text style={[styles.ratingText, {color: theme.colors.text}]}>
                            {recipe.rating || '4.5'}
                        </Text>
                    </View>

                    <View style={styles.likesContainer}>
                        <Ionicons name="heart-outline" size={14} color="#6c757d"/>
                        <Text style={[styles.likesText, {color: theme.colors.textSecondary}]}>
                            {recipe.likes || '0'}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const handleLogout = async () => {
        try {
            await logout();
            // Nach Logout willst du eventuell zur Login-Seite navigieren
            router.replace('/login');
        } catch (error) {
            console.error("Logout error:", error);
        }
    };


    return (
        <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={theme.colors.background}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={[styles.profileHeader, {backgroundColor: theme.colors.surface}]}>                    <View
                        style={[
                            styles.profilePicture,
                            {backgroundColor: theme.colors.border, borderColor: theme.colors.surface},
                        ]}
                    >
                        {currentUser.avatar ? (
                            <Image source={{uri: currentUser.avatar}} style={styles.profileImage}/>
                        ) : (
                            <Ionicons name="person" size={50} color={theme.colors.textSecondary}/>
                        )}
                    </View>

                    <Text style={[styles.username, {color: theme.colors.text}]}>
                        {currentUser.username}
                    </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                  {currentUser.followingCount || 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Following
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                  {currentUser.followerCount || 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Followers
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                  {currentUser.recipeCount || 0}
                </Text><Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Recipes
                </Text>
              </View>
            </View>

                    <Text style={[styles.bio, {color: theme.colors.textSecondary}]}>
                        {currentUser.bio}
                    </Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: theme.colors.button }]}
                  onPress={() => router.push('/profile/settings')}
              >
                <Ionicons name="create-outline" size={18} color={theme.colors.buttonText} />
                <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                  style={[styles.shareButton, { backgroundColor: theme.colors.button }]}
                  onPress={onShareProfile}
              >
                <Ionicons name="share-outline" size={18} color={theme.colors.buttonText} />
                <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>Share</Text>
              </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.logoutButton, {backgroundColor: theme.colors.accent}]}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={18} color={theme.colors.textOnAccent}/>
                    <Text style={[styles.buttonText, {color: theme.colors.textOnAccent}]}>Logout</Text>
                </TouchableOpacity>
            </View>
          </View>                <View style={styles.recipesSection}>
                    <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
                        Your Recipes ({currentUser.recipeCount || 0})
                    </Text>

                    {profileLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={theme.colors.button} />
                            <Text style={[styles.loadingText, {color: theme.colors.textSecondary}]}>
                                Loading recipes...
                            </Text>
                        </View>
                    ) : recipeList.length > 0 ? (
                        <View style={styles.recipesGrid}>{recipeList.map(renderRecipeCard)}</View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="restaurant-outline" size={48} color={theme.colors.textSecondary} />
                            <Text style={[styles.emptyTitle, {color: theme.colors.text}]}>
                                No recipes yet
                            </Text>
                            <Text style={[styles.emptySubtitle, {color: theme.colors.textSecondary}]}>
                                Start creating delicious recipes to share with the community!
                            </Text>
                            <TouchableOpacity 
                                style={[styles.createButton, {backgroundColor: theme.colors.button}]}
                                onPress={() => router.push('/recipe/create-recipe')}
                            >
                                <Ionicons name="add" size={20} color={theme.colors.buttonText} />
                                <Text style={[styles.createButtonText, {color: theme.colors.buttonText}]}>
                                    Create Recipe
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
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
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  recipesSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
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
  },
  timeTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
  },
  chefName: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '500',
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
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },  likesText: {
    fontSize: 14,
    fontWeight: '500',
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
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        gap: 8,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    marginLeft: 12,
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
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  createRecipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
});
