// KOMPLEXE KOMPONENTE: Rezeptkarte mit interaktiven Features
// Verwaltet Likes, Ratings, Favoriten und Navigation in einem optimierten UI-Element

import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Animated, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { ALLERGENS, CATEGORIES } from '../utils/constants';
import FollowButton from './FollowButton';
import useAuth from '../lib/useAuth';
import useFavorites from '../hooks/useFavorites';
import { useState, useRef } from 'react';
import { toggleRecipeLike, rateRecipe, getUserRating } from '../services/recipeService';
import { notifyRecipeLike, notifyRecipeRating } from '../services/inAppNotificationService';
import { RatingModal } from './RatingModal';
import { smartCard, smartShadow } from '../utils/platformStyles';

// PERFORMANCE-KRITISCH: Allergen-Konfiguration wird einmalig berechnet
const allergyConfig = ALLERGENS.reduce((acc, allergen) => {
    acc[allergen.id] = {
        label: allergen.label.replace('Contains ', ''),
        color: allergen.color,
        icon: allergen.icon
    };
    return acc;
}, {});

// FACHGESPRÄCH: Kategorie-Mapping für optimierte Darstellung
const categoryConfig = CATEGORIES.reduce((acc, category) => {
    acc[category.id] = {
        label: category.label,
        color: category.color,
        emoji: category.icon
    };
    return acc;
}, {});
export default function RecipeCard({ recipe, onLikeUpdate, onRatingUpdate }) {
    const { theme } = useTheme();
    const { user } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();
    const styles = createStyles(theme);
    const [isLiked, setIsLiked] = useState(recipe.isLikedByCurrentUser || false);
    const [likesCount, setLikesCount] = useState(recipe.likesCount || 0);
    const [isLiking, setIsLiking] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const likeAnimation = useRef(new Animated.Value(1)).current;
    const isRecipeFavorite = isFavorite(recipe.id);
    const commentCount = typeof recipe.commentsCount === 'number' ? recipe.commentsCount : 0;
    const handlePress = () => {
        router.push(`/recipe/${recipe.id}`);
    };
    const handleCommentPress = (e) => {
        e.stopPropagation();
        router.push(`/recipe/${recipe.id}?scrollToComments=true`);
    };
    const handleAuthorPress = (e) => {
        e.stopPropagation();
        if (recipe.authorId && recipe.authorId !== user?.uid) {
            router.push(`/profile/user-profile?userId=${recipe.authorId}`);
        }
    };
    // KOMPLEXER INTERAKTIONS-HANDLER: Like-Funktionalität mit Animation
    // Verwaltet optimistische UI-Updates und Server-Synchronisation
    const handleLikePress = async (e) => {
        e.stopPropagation();
        if (!user || isLiking) return;

        // UI-Animation für bessere User Experience
        Animated.sequence([
            Animated.timing(likeAnimation, {
                toValue: 1.2,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(likeAnimation, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            })
        ]).start();

        setIsLiking(true);

        try {
            const newLikedState = await toggleRecipeLike(recipe.id, user.uid);
            setIsLiked(newLikedState);
            setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

            // BENACHRICHTIGUNGS-LOGIK: Informiere Autor über neuen Like
            if (newLikedState && recipe.authorId && recipe.authorId !== user.uid) {
                notifyRecipeLike(recipe.id, recipe.title, user.displayName || user.email?.split('@')[0] || 'Someone', recipe.authorId);
            }

            if (onLikeUpdate) {
                onLikeUpdate(recipe.id, newLikedState, newLikedState ? likesCount + 1 : likesCount - 1);
            }
        } catch (error) {
            Alert.alert("Error", "Could not update like status.");
        } finally {
            setIsLiking(false);
        }
    };
    const handleRatingPress = (e) => {
        e.stopPropagation();
        if (!user) {
            Alert.alert("Login Required", "You need to be logged in to rate recipes.");
            return;
        }
        setShowRatingModal(true);
        getUserRating(recipe.id, user.uid).then(rating => {
            setUserRating(rating);
        });
    };
    const handleRating = async (rating) => {
        try {
            await rateRecipe(recipe.id, user.uid, rating);
            setUserRating(rating);
            setShowRatingModal(false);
            if (recipe.authorId && recipe.authorId !== user.uid) {
                notifyRecipeRating(recipe.id, recipe.title, user.displayName || user.email?.split('@')[0] || 'Someone', rating, recipe.authorId);
            }
            if (onRatingUpdate) {
                onRatingUpdate(recipe.id);
            }
        } catch (error) {
            Alert.alert("Error", "Could not save your rating.");
        }
    };
    const handleShare = async (e) => {
        e.stopPropagation();
        try {
            const shareText = `🍽️ ${recipe.title}\n\n⏱️ ${recipe.time} min\n⭐ ${recipe.rating || '0.0'} rating\n👨‍🍳 by ${recipe.authorName}\n\nCheck out this delicious recipe!`;
            const result = await Share.share({
                message: shareText,
                title: recipe.title,
            });
            if (result.action === Share.sharedAction) {
            }
        } catch (error) {
            Alert.alert('Error', 'Could not share recipe. Please try again.');
        }
    };
    return (
        <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.9}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
                <View style={styles.topTags}>
                    {recipe.categories && recipe.categories.slice(0, 2).map((category) => {
                        const config = categoryConfig[category];
                        if (!config) return null;
                        return (
                            <View key={category} style={[styles.tag, { backgroundColor: config.color }]}>
                                <Text style={styles.tagEmoji}>{config.emoji}</Text>
                                <Text style={styles.tagText}>{config.label}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>{recipe.title}</Text>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={async (e) => {
                            e.stopPropagation();
                            if (!user) {
                                Alert.alert("Login Required", "You need to be logged in to save recipes to favorites.");
                                return;
                            }
                            try {
                                await toggleFavorite(recipe.id);
                            } catch (error) {
                                if (error.code === 'permission-denied' || error.message.includes('Permission denied')) {
                                    Alert.alert(
                                        "Setup Required", 
                                        "Favorites feature requires Firestore rules setup. Check UPDATE_FIRESTORE_RULES.md in your project."
                                    );
                                } else {
                                    Alert.alert("Error", "Could not update favorite status.");
                                }
                            }
                        }}
                    >
                        <Ionicons 
                            name={isRecipeFavorite ? "bookmark" : "bookmark-outline"} 
                            size={20} 
                            color={isRecipeFavorite ? theme.colors.primary : theme.colors.textSecondary} 
                        />
                    </TouchableOpacity>
                </View>
                {recipe.allergens && recipe.allergens.length > 0 && (
                    <View style={styles.allergyTags}>
                        <Ionicons name="warning-outline" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.allergyLabel}>Contains:</Text>
                        <View style={styles.allergyList}>
                            {recipe.allergens.slice(0, 3).map((allergy) => {
                                const config = allergyConfig[allergy];
                                if (!config) return null;
                                return (
                                    <View key={allergy} style={[styles.allergyTag, { borderColor: config.color }]}>
                                        <Text style={styles.allergyIcon}>{config.icon}</Text>
                                        <Text style={[styles.allergyText, { color: config.color }]}>{config.label}</Text>
                                    </View>
                                );
                            })}
                            {recipe.allergens.length > 3 && (
                                <Text style={styles.moreAllergies}>+{recipe.allergens.length - 3}</Text>
                            )}
                        </View>
                    </View>
                )}
                <View style={styles.metadata}>
                    <View style={styles.timeContainer}>
                        <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.time}>{recipe.time} min</Text>
                    </View>
                    <TouchableOpacity style={styles.ratingContainer} onPress={handleRatingPress}>
                        <Ionicons name="star" size={16} color="#ffc107" />
                        <Text style={styles.rating}>{recipe.rating || '0.0'}</Text>
                        <Text style={styles.reviews}>({recipe.reviews || 0})</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.footer}>
                    <TouchableOpacity onPress={handleAuthorPress} style={styles.authorContainer}>
                        <Text style={styles.author}>by {recipe.authorName}</Text>
                    </TouchableOpacity>
                    <View style={styles.engagement}>
                        {}
                        <TouchableOpacity 
                            style={[styles.likeButton, isLiking && styles.likeButtonDisabled]} 
                            onPress={handleLikePress} 
                            disabled={isLiking}
                        >
                            <Animated.View style={{ transform: [{ scale: likeAnimation }] }}>
                                <Ionicons
                                    name={isLiked ? "heart" : "heart-outline"}
                                    size={18}
                                    color={isLiked ? theme.colors.primary : theme.colors.textSecondary}
                                />
                            </Animated.View>
                            <Text style={[styles.likesCountText, { color: isLiked ? theme.colors.primary : theme.colors.textSecondary }]}>
                                {likesCount}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.commentButton} onPress={handleCommentPress}>
                            <Ionicons name="chatbubble-outline" size={18} color={theme.colors.textSecondary} />
                            {commentCount > 0 && <Text style={[styles.commentCount, { color: theme.colors.textSecondary }]}>{commentCount}</Text>}
                        </TouchableOpacity>
                        {}
                        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                            <Ionicons name="share-outline" size={18} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                        {}
                        {recipe.authorId && recipe.authorId !== user?.uid && (
                            <FollowButton 
                                userId={recipe.authorId} 
                                size="small"
                            />
                        )}
                    </View>
                </View>
            </View>
            {}
            <RatingModal
                visible={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                onRating={handleRating}
                userRating={userRating}
                recipeTitle={recipe.title}
                theme={theme}
            />
        </TouchableOpacity>
    );
}
const createStyles = (theme) => StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
        ...smartShadow(
            {
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            2
        ),
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 200,
        backgroundColor: theme.colors.button, 
    },
    topTags: {
        position: 'absolute',
        top: 12,
        right: 12,
        gap: 6,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    tagEmoji: {
        fontSize: 12,
    },
    tagText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        flex: 1,
        marginRight: 10,
    },
    saveButton: {
        padding: 4,
    },
    allergyTags: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 6,
    },
    allergyLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    allergyList: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    allergyTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1,
        backgroundColor: theme.colors.background,
        gap: 3,
    },
    allergyIcon: {
        fontSize: 10,
    },
    allergyText: {
        fontSize: 10,
        fontWeight: '600',
    },
    moreAllergies: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    metadata: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    time: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rating: {
        fontSize: 14,
        color: theme.colors.text,
        fontWeight: '600',
    },
    reviews: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    authorContainer: {
        flex: 1,
    },
    author: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    engagement: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        padding: 4,
        opacity: 1,
    },
    likeButtonDisabled: {
        opacity: 0.6,
    },
    likesCountText: {
        fontSize: 12,
        color: theme.colors.text,
        fontWeight: '500',
    },
    commentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        padding: 4,
    },
    commentCount: {
        fontSize: 12,
        color: theme.colors.text,
        fontWeight: '500',
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        padding: 4,
    },
});