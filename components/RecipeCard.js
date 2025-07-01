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
import { RatingModal } from './RatingModal';

// mockCommentCounts is still here, as per your previous code.
// If you want real comment counts, you'd fetch them in HomeScreen.js
// similarly to how likes are fetched and pass them via the recipe prop.
const mockCommentCounts = {
    1: 8,
    2: 3,
    3: 12,
    4: 5,
    5: 2,
    6: 15,
    7: 7,
    8: 4,
    9: 11,
    10: 6
};


const allergyConfig = ALLERGENS.reduce((acc, allergen) => {
    acc[allergen.id] = {
        label: allergen.label.replace('Contains ', ''),
        color: allergen.color,
        icon: allergen.icon
    };
    return acc;
}, {});

const categoryConfig = CATEGORIES.reduce((acc, category) => {
    acc[category.id] = {
        label: category.label,
        color: category.color,
        emoji: category.icon
    };
    return acc;
}, {});

// Accept the new isLikedByCurrentUser prop
export default function RecipeCard({ recipe, onLikeUpdate, onRatingUpdate }) {
    const { theme } = useTheme();
    const { user } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();
    const styles = createStyles(theme);

    // State for like and rating functionality
    const [isLiked, setIsLiked] = useState(recipe.isLikedByCurrentUser || false);
    const [likesCount, setLikesCount] = useState(recipe.likesCount || 0);
    const [isLiking, setIsLiking] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [userRating, setUserRating] = useState(0);
    
    // Animation for like button
    const likeAnimation = useRef(new Animated.Value(1)).current;

    // Check if this recipe is in favorites
    const isRecipeFavorite = isFavorite(recipe.id);

    // Use mockCommentCounts as per your original code for comments
    const commentCount = mockCommentCounts[recipe.id] || 0;


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
            // Navigate to author profile (can be implemented later)
            console.log('Navigate to author profile:', recipe.authorId);
        }
    };

    const handleLikePress = async (e) => {
        e.stopPropagation();
        
        if (!user) {
            Alert.alert("Login Required", "You need to be logged in to like recipes.");
            return;
        }

        if (isLiking) return; // Prevent double clicks

        // Animate like button
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
            
            if (onLikeUpdate) {
                onLikeUpdate(recipe.id, newLikedState, newLikedState ? likesCount + 1 : likesCount - 1);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
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
        // Load user's current rating
        getUserRating(recipe.id, user.uid).then(rating => {
            setUserRating(rating);
        }).catch(console.error);
    };

    const handleRating = async (rating) => {
        try {
            await rateRecipe(recipe.id, user.uid, rating);
            setUserRating(rating);
            setShowRatingModal(false);
            
            if (onRatingUpdate) {
                onRatingUpdate(recipe.id);
            }
            
            // Alert entfernt - nur stille Bestätigung
        } catch (error) {
            console.error('Error rating recipe:', error);
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
                console.log('Recipe shared successfully from card!');
            }
        } catch (error) {
            console.error('Error sharing recipe:', error);
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
                                // No need to show alert here as user gets visual feedback
                                // from the icon change
                            } catch (error) {
                                console.error('Error toggling favorite:', error);
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
                        {/* Like Button */}
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

                        {/* Share Button */}
                        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                            <Ionicons name="share-outline" size={18} color={theme.colors.textSecondary} />
                        </TouchableOpacity>

                        {/* Use the FollowButton component instead of custom follow button */}
                        {recipe.authorId && recipe.authorId !== user?.uid && (
                            <FollowButton 
                                userId={recipe.authorId} 
                                size="small"
                            />
                        )}
                    </View>
                </View>
            </View>

            {/* Rating Modal */}
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
        borderWidth: 1,
        borderColor: theme.colors.cardAccent,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 200,
        backgroundColor: theme.colors.button, // This will be a fallback color if image not loaded
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