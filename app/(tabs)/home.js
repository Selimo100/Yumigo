import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, TextInput, Image, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react'; 
import RecipeCard from '../../components/RecipeCard';
import RecipeForm from '../../components/RecipeForm/RecipeForm';
import NotificationModal from '../../components/NotificationModal';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import useAuth from "../../lib/useAuth";
import { Redirect } from 'expo-router'; 
import { db } from '../../lib/firebaseconfig';
import { getDocs, collection, doc, getDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native'; 
import { useFollow } from '../../hooks/useFollow';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import { recipeHasSeasonalIngredient } from '../../utils/seasonalUtils';
import * as Location from 'expo-location';
import ingredientsData from '../../utils/ingredients.json';

export default function HomeScreen() {
    const [recipeList, setRecipeList] = useState([]);
    const [error, setError] = useState(null);
    const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
    const [activeTab, setActiveTab] = useState('discover'); 
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [seasonalFilterActive, setSeasonalFilterActive] = useState(false);
    const [countryName, setCountryName] = useState('Switzerland');
    const [currentMonth, setCurrentMonth] = useState(() => new Date().toLocaleString('en-US', { month: 'long' }));

    const { theme } = useTheme();
    const { notifications, unreadCount } = useNotifications();
    const tabBarHeight = useTabBarHeight();
    const styles = createStyles(theme, tabBarHeight);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { user, isLoading: isLoadingAuth } = useAuth();
    const { followingFeed, loadFollowingFeed, isLoading: isLoadingFeed } = useFollow();

    // KOMPLEXE KOMPONENTE: Saisonale Zutaten Filter System
    // Konvertiert Zutatennamen zu IDs für saisonale Prüfung
    function getIngredientIdByName(name) {
        const lower = name.trim().toLowerCase();
        const found = ingredientsData.find(ing => ing.names.some(n => n.toLowerCase() === lower));
        return found ? found.id : null;
    }
    
    // FACHGESPRÄCH: Intelligente Zutat-zu-Saison Zuordnung
    // Behandelt verschiedene Datenstrukturen (String, Object) für Zutaten
    function isAnyIngredientSeasonal(ingredient, country, month) {
        let id = null;
        if (typeof ingredient === 'string') {
            id = getIngredientIdByName(ingredient) || ingredient;
        } else if (ingredient && typeof ingredient === 'object') {
            id = ingredient.id || getIngredientIdByName(ingredient.ingredient || ingredient.name || '');
        }
        if (!id) return false;
        return recipeHasSeasonalIngredient({ ingredients: [id] }, country, month);
    }

    // KOMPLEXER ALGORITHMUS: Multi-Parameter Rezept-Filter
    // Kombiniert Textsuche, saisonale Filter und Feed-Auswahl
    const getFilteredRecipes = useCallback(() => {
        const currentRecipes = activeTab === 'discover' ? recipeList : followingFeed;
        let filtered = currentRecipes;
        if (seasonalFilterActive) {
            filtered = filtered.filter(recipe => {
                const isSeasonal = (recipe.ingredients || []).some(ing => isAnyIngredientSeasonal(ing, countryName, currentMonth));
                return isSeasonal;
            });
        }
        if (!searchQuery.trim()) {
            return filtered;
        }
        const query = searchQuery.toLowerCase();
        return filtered.filter(recipe => {
            if (recipe.title?.toLowerCase().includes(query)) return true;
            if (recipe.description?.toLowerCase().includes(query)) return true;
            if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
                return recipe.ingredients.some(ingredient => {
                    if (typeof ingredient === 'string') return ingredient.toLowerCase().includes(query);
                    if (ingredient && typeof ingredient === 'object' && ingredient.name) return ingredient.name.toLowerCase().includes(query);
                    return false;
                });
            }
            return false;
        });
    }, [recipeList, followingFeed, activeTab, searchQuery, seasonalFilterActive, countryName, currentMonth]);

    // KOMPLEXE DATENVERARBEITUNG: Rezept-Laden mit Engagement-Daten
    // Lädt Rezepte mit Likes, Ratings und User-Status in einem optimierten Query
    const getRecipes = useCallback(async () => {
        if (!user) { 
            setIsLoadingRecipes(false);
            return;
        }

        setIsLoadingRecipes(true);
        setError(null);
        try {
            const recipesCollectionRef = collection(db, 'recipes');
            const data = await getDocs(recipesCollectionRef);

            // PERFORMANCE-KRITISCH: Parallel Firebase-Abfragen für alle Rezepte
            const recipesWithLikesAndStatus = await Promise.all(
                data.docs.map(async (docSnapshot) => {
                    const recipeData = { id: docSnapshot.id, ...docSnapshot.data() };

                    const likesCollectionRef = collection(db, 'recipes', docSnapshot.id, 'likes');
                    const likesSnapshot = await getDocs(likesCollectionRef);
                    const likesCount = likesSnapshot.size;

                    let isLikedByCurrentUser = false;
                    if (user && user.uid) {
                        const userLikeDocRef = doc(db, 'recipes', docSnapshot.id, 'likes', user.uid);
                        const userLikeDoc = await getDoc(userLikeDocRef);
                        isLikedByCurrentUser = userLikeDoc.exists();
                    }
                    const ratingsCollectionRef = collection(db, 'recipes', docSnapshot.id, 'ratings');
                    const ratingsSnapshot = await getDocs(ratingsCollectionRef);
                    const reviewsCount = ratingsSnapshot.size;
                    
                    let averageRating = recipeData.rating || 0;
                    if (reviewsCount > 0 && !recipeData.rating) {
                        let totalRating = 0;
                        ratingsSnapshot.docs.forEach(doc => {
                            totalRating += doc.data().rating;
                        });
                        averageRating = Math.round((totalRating / reviewsCount) * 10) / 10;
                    }

                    return { 
                        ...recipeData, 
                        likesCount, 
                        isLikedByCurrentUser,
                        rating: averageRating,
                        reviews: reviewsCount
                    };
                })
            );

            setRecipeList(recipesWithLikesAndStatus);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoadingRecipes(false);
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            (async () => {
                try {
                    let { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') {
                        setCountryName('Switzerland');
                        return;
                    }
                    let location = await Location.getCurrentPositionAsync({});
                    let geocode = await Location.reverseGeocodeAsync({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                    if (geocode && geocode.length > 0) {
                        setCountryName(mapCountryName(geocode[0].country));
                    } else {
                        setCountryName('Switzerland');
                    }
                } catch (err) {
                    setCountryName('Switzerland');
                }
            })();
            getRecipes();
            if (activeTab === 'following') {
                loadFollowingFeed();
            }
            return () => {};
        }, [getRecipes, activeTab, loadFollowingFeed])
    );


    const handleCreatePress = () => {
        setShowCreateModal(true);
    };

    const handleRecipeSuccess = (recipeId) => {
        setShowCreateModal(false);
        getRecipes();
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
    };

    const handleLikeUpdate = (recipeId, isLiked, newLikesCount) => {
        setRecipeList(prevRecipes => 
            prevRecipes.map(recipe => 
                recipe.id === recipeId 
                    ? { ...recipe, isLikedByCurrentUser: isLiked, likesCount: newLikesCount }
                    : recipe
            )
        );
        
        if (followingFeed.length > 0) {
            loadFollowingFeed();
        }
    };

    const handleRatingUpdate = (recipeId) => {
        getRecipes();
        if (activeTab === 'following') {
            loadFollowingFeed();
        }
    };

    const handleNotificationPress = () => {
        setShowNotificationModal(true);
    };

    const getRankedFilteredRecipes = useCallback(() => {
        const filtered = getFilteredRecipes();
        
        return filtered.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
                const dateCompare = b.createdAt.seconds - a.createdAt.seconds;
                if (Math.abs(dateCompare) > 86400) {
                    return dateCompare;
                }
            }
            
            return (b.likesCount || 0) - (a.likesCount || 0);
        });
    }, [getFilteredRecipes]);

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = async () => {
      setRefreshing(true);
      await getRecipes();
      setRefreshing(false);
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
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>Yumigo</Text>
                    <Image 
                        source={require('../../assets/Yumigo_Logo.png')} 
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </View>
                <View style={styles.topNavIcons}>
                    <TouchableOpacity style={styles.createButton} onPress={handleCreatePress}>
                        <Ionicons name="add" size={24} color="#FFFFFF" />
                        <Text style={styles.createText}>Create </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.notificationIcon}
                        onPress={handleNotificationPress}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
                        {unreadCount > 0 && (
                            <View style={styles.notificationBadge}>
                                <Text style={styles.notificationBadgeText}>
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar with Filter */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search ..."
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
                
                <TouchableOpacity 
                    style={styles.filterButton}
                    onPress={() => setShowFilterModal(true)}
                >
                    <Ionicons name="options" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Recipe Feed */}
            {(activeTab === 'discover' ? isLoadingRecipes : isLoadingFeed) ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ color: theme.colors.text, marginTop: 10 }}>
                        {activeTab === 'discover' ? 'Loading recipes...' : 'Loading following feed...'}
                    </Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error loading recipes: {error.message}</Text>
                    <TouchableOpacity onPress={getRecipes} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Tap to Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : getFilteredRecipes().length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons 
                        name={searchQuery ? "search-outline" : (activeTab === 'discover' ? "pizza-outline" : "people-outline")} 
                        size={80} 
                        color={theme.colors.textSecondary} 
                    />
                    <Text style={styles.emptyText}>
                        {searchQuery 
                            ? `No recipes found for "${searchQuery}"`
                            : (activeTab === 'discover' 
                                ? 'No recipes yet! Be the first to create one.'
                                : 'No recipes from following users yet. Follow some users to see their recipes here!'
                            )
                        }
                    </Text>
                    {activeTab === 'following' && !searchQuery && (
                        <TouchableOpacity 
                            style={[styles.discoverUsersButton, { backgroundColor: theme.colors.button }]}
                            onPress={() => setActiveTab('discover')}
                        >
                            <Text style={[styles.discoverUsersButtonText, { color: theme.colors.buttonText }]}>
                                Discover Recipes
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <ScrollView 
                    style={styles.feed} 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.feedContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {getRankedFilteredRecipes().map((recipe) => (
                        <RecipeCard 
                            key={recipe.id} 
                            recipe={recipe} 
                            onLikeUpdate={handleLikeUpdate}
                            onRatingUpdate={handleRatingUpdate}
                        />
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

            {/* Filter Modal */}
            <Modal
                visible={showFilterModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowFilterModal(false)}
            >
                <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}> 
                    {/* Modal Header */}
                    <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}> 
                        <TouchableOpacity 
                            onPress={() => setShowFilterModal(false)} 
                            style={styles.modalCloseButton}
                        >
                            <Ionicons name="close" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Search & Filter</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Modal Content */}
                    <ScrollView style={styles.modalContent}>
                        {/* Search Section */}
                        <View style={styles.modalSection}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Search</Text>
                            <View style={styles.modalSearchContainer}>
                                <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
                                <TextInput
                                    style={[styles.modalSearchInput, { color: theme.colors.text }]}
                                    placeholder="Search recipes..."
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

                        {/* Feed Type Section */}
                        <View style={styles.modalSection}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Feed Type</Text>
                            
                            <TouchableOpacity 
                                style={[
                                    styles.filterOption,
                                    activeTab === 'discover' && styles.filterOptionActive
                                ]}
                                onPress={() => setActiveTab('discover')}
                            >
                                <Ionicons 
                                    name="compass" 
                                    size={20} 
                                    color={activeTab === 'discover' ? theme.colors.primary : theme.colors.textSecondary} 
                                />
                                <Text style={[
                                    styles.filterOptionText, 
                                    { color: activeTab === 'discover' ? theme.colors.primary : theme.colors.text }
                                ]}>
                                    Discover - All Recipes
                                </Text>
                                {activeTab === 'discover' && (
                                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                                )}
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[
                                    styles.filterOption,
                                    activeTab === 'following' && styles.filterOptionActive
                                ]}
                                onPress={() => {
                                    setActiveTab('following');
                                    loadFollowingFeed();
                                }}
                            >
                                <Ionicons 
                                    name="people" 
                                    size={20} 
                                    color={activeTab === 'following' ? theme.colors.primary : theme.colors.textSecondary} 
                                />
                                <Text style={[
                                    styles.filterOptionText, 
                                    { color: activeTab === 'following' ? theme.colors.primary : theme.colors.text }
                                ]}>
                                    Following - From People You Follow
                                </Text>
                                {activeTab === 'following' && (
                                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Seasonal Filter Section */}
                        <View style={styles.modalSection}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Saisonale Filter</Text>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 10 }}
                                onPress={() => setSeasonalFilterActive(v => !v)}
                            >
                                <Ionicons
                                    name={seasonalFilterActive ? 'leaf' : 'leaf-outline'}
                                    size={22}
                                    color={seasonalFilterActive ? theme.colors.primary : theme.colors.textSecondary}
                                />
                                <Text style={{ marginLeft: 8, color: theme.colors.text }}>
                                    Show only seasonal ingredients
                                </Text>
                                <View style={{
                                    marginLeft: 8,
                                    width: 36,
                                    height: 22,
                                    borderRadius: 12,
                                    backgroundColor: seasonalFilterActive ? theme.colors.primary : theme.colors.cardAccent,
                                    justifyContent: 'center',
                                    padding: 2,
                                }}>
                                    <View style={{
                                        width: 18,
                                        height: 18,
                                        borderRadius: 9,
                                        backgroundColor: '#fff',
                                        alignSelf: seasonalFilterActive ? 'flex-end' : 'flex-start',
                                        shadowColor: '#000',
                                        shadowOpacity: 0.1,
                                        shadowRadius: 2,
                                        elevation: 2,
                                    }} />
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Current Results */}
                        <View style={styles.modalSection}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                                Current Feed: {activeTab === 'discover' ? 'Discover' : 'Following'}
                            </Text>
                            <Text style={[styles.resultsSubtitle, { color: theme.colors.textSecondary }]}>
                                {getFilteredRecipes().length} recipe{getFilteredRecipes().length !== 1 ? 's' : ''} 
                                {searchQuery ? ` found for "${searchQuery}"` : ' available'}
                            </Text>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* Notification Modal */}
            <NotificationModal
                visible={showNotificationModal}
                onClose={() => setShowNotificationModal(false)}
            />
        </SafeAreaView>
    );
}

const createStyles = (theme, tabBarHeight) => StyleSheet.create({
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
        backgroundColor: theme.colors.background,
    },
    logoContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
        gap: 0,
    },
    logoText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
    },
    logoImage: {
        height: 40,
        width: 130,
        marginLeft: -50,
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
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 5,
    },
    createText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    notificationIcon: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.cardAccent,
        position: 'relative',
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#ff4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.background,
        pointerEvents: 'none',
        zIndex: 1,
    },
    notificationBadgeText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    feed: {
        flex: 1,
        paddingTop: 10,
    },
    feedContent: {
        paddingBottom: tabBarHeight,
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
    discoverUsersButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        marginTop: 16,
    },
    discoverUsersButtonText: {
        fontSize: 16,
        fontWeight: '600',
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
    filterButton: {
        padding: 10,
        backgroundColor: theme.colors.primary,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    placeholder: {
        width: 40,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    modalSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalSearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 10,
    },
    modalSearchInput: {
        flex: 1,
        fontSize: 16,
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 16,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        marginBottom: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    filterOptionActive: {
        backgroundColor: theme.colors.accentBackground,
        borderColor: theme.colors.primary,
    },
    filterOptionText: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    resultsSubtitle: {
        fontSize: 14,
    },
    seasonalFilterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 16,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        marginBottom: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    seasonalFilterActive: {
        backgroundColor: theme.colors.accentBackground,
        borderColor: theme.colors.primary,
    },
    seasonalFilterText: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
});