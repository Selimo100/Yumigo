import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import RecipeCard from '../../components/RecipeCard';
import RecipeForm from '../../components/RecipeForm/RecipeForm';
import { useTheme } from '../../contexts/ThemeContext';
import useAuth from "../../lib/useAuth";
import { Redirect } from 'expo-router';
import { db } from '../../lib/firebaseconfig';
import { getDocs, collection, doc, getDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
    const [recipeList, setRecipeList] = useState([]);
    const [error, setError] = useState(null);
    const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);

    const { theme } = useTheme();
    const styles = createStyles(theme);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { user, isLoading: isLoadingAuth } = useAuth();

    // Memoize getRecipes to prevent unnecessary re-creations
    const getRecipes = useCallback(async () => {
        if (!user) { // Only fetch if user is logged in
            console.log('[HomeScreen] User not authenticated yet, skipping recipe fetch.');
            setIsLoadingRecipes(false);
            return;
        }

        setIsLoadingRecipes(true);
        setError(null);
        try {
            console.log('🔍 [HomeScreen] Fetching recipes from Firestore...');
            const recipesCollectionRef = collection(db, 'recipes');
            const data = await getDocs(recipesCollectionRef);

            const recipesWithLikesAndStatus = await Promise.all(
                data.docs.map(async (docSnapshot) => {
                    const recipeData = { id: docSnapshot.id, ...docSnapshot.data() };

                    // Fetch the likes count for each recipe from its subcollection
                    const likesCollectionRef = collection(db, 'recipes', docSnapshot.id, 'likes');
                    const likesSnapshot = await getDocs(likesCollectionRef);
                    const likesCount = likesSnapshot.size;

                    // Check if the current user has liked this recipe
                    let isLikedByCurrentUser = false;
                    if (user && user.uid) { // Ensure user and uid exist before checking
                        const userLikeDocRef = doc(db, 'recipes', docSnapshot.id, 'likes', user.uid);
                        const userLikeDoc = await getDoc(userLikeDocRef);
                        isLikedByCurrentUser = userLikeDoc.exists();
                    }

                    console.log(`✅ [HomeScreen] Recipe ID: ${docSnapshot.id}, Likes: ${likesCount}, Liked by current user: ${isLikedByCurrentUser}`);

                    return { ...recipeData, likesCount, isLikedByCurrentUser }; // Add both counts and status
                })
            );

            console.log('✅ [HomeScreen] All recipes fetched with likes and user status.');
            setRecipeList(recipesWithLikesAndStatus);
        } catch (err) {
            console.error('❌ [HomeScreen] Error fetching recipes:', err);
            setError(err);
        } finally {
            setIsLoadingRecipes(false);
        }
    }, [user]); // Re-create getRecipes if the user object changes

    // Use useFocusEffect to re-fetch recipes when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            getRecipes();
            // Optional: return a cleanup function if you had listeners that needed unsubscribing
            return () => {
                console.log('[HomeScreen] Screen unfocused. No specific cleanup needed for getDocs.');
            };
        }, [getRecipes]) // Depend on getRecipes to re-run when getRecipes changes
    );


    const handleCreatePress = () => {
        setShowCreateModal(true);
    };

    const handleRecipeSuccess = (recipeId) => {
        console.log('[HomeScreen] Recipe created with ID:', recipeId);
        setShowCreateModal(false);
        getRecipes(); // Refresh the list to include the new recipe and its like count
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
    };

    if (isLoadingAuth) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ color: theme.colors.text, marginTop: 10 }}>Checking authentication...</Text>
            </View>
        );
    }

    if (!user) {
        return <Redirect href="/login" />;
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Navigation */}
            <View style={styles.topNav}>
                <Text style={styles.logo}>Yumigo</Text>
                <View style={styles.topNavIcons}>
                    <TouchableOpacity style={styles.createButton} onPress={handleCreatePress}>
                        <Ionicons name="add" size={24} color={theme.colors.buttonText} />
                        <Text style={styles.createText}>Create</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.notificationIcon}>
                        <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Recipe Feed */}
            {isLoadingRecipes ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ color: theme.colors.text, marginTop: 10 }}>Loading recipes...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error loading recipes: {error.message}</Text>
                    <TouchableOpacity onPress={getRecipes} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Tap to Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : recipeList.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="pizza-outline" size={80} color={theme.colors.textSecondary} />
                    <Text style={styles.emptyText}>No recipes yet! Be the first to create one.</Text>
                </View>
            ) : (
                <ScrollView style={styles.feed} showsVerticalScrollIndicator={false}>
                    {recipeList.map((recipe) => (
                        // Pass the recipe object which now contains likesCount and isLikedByCurrentUser
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </ScrollView>
            )}

            {/* Create Recipe Modal */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={handleCloseModal}
            >
                <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                    {/* Modal Header */}
                    <View style={[styles.modalHeader, {
                        backgroundColor: theme.isDarkMode
                            ? 'rgba(0,0,0,0.8)'
                            : 'rgba(255,255,255,0.9)',
                        borderBottomColor: theme.colors.border
                    }]}>
                        <TouchableOpacity onPress={handleCloseModal} style={styles.modalCloseButton}>
                            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.modalHeaderTitle, { color: theme.colors.text }]}>Create Recipe</Text>
                    </View>

                    <RecipeForm onSuccess={handleRecipeSuccess} onCancel={handleCloseModal} />
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    topNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    topNavIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.button,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 5,
    },
    createText: {
        color: theme.colors.buttonText,
        fontSize: 14,
        fontWeight: '600',
    },
    notificationIcon: {
        padding: 5,
    },
    feed: {
        flex: 1,
        paddingTop: 10,
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    modalCloseButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    modalHeaderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
        fontSize: 16,
    },
    retryButton: {
        backgroundColor: theme.colors.button,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    retryButtonText: {
        color: theme.colors.buttonText,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: 15,
        fontSize: 18,
    },
});