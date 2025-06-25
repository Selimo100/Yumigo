import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { ALLERGENS, CATEGORIES } from '../utils/constants';

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
export default function RecipeCard({ recipe }) {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    // Use the likesCount from the recipe object, defaulting to 0 if not present
    // This now comes from HomeScreen's Firestore query
    const likesCount = recipe.likesCount || 0;

    // Access the new isLikedByCurrentUser prop
    const isLiked = recipe.isLikedByCurrentUser || false;

    // Use mockCommentCounts as per your original code for comments
    const commentCount = mockCommentCounts[recipe.id] || 0;


    const handlePress = () => {
        router.push(`/recipe/${recipe.id}`);
    };

    const handleCommentPress = (e) => {
        e.stopPropagation();
        router.push(`/recipe/${recipe.id}?scrollToComments=true`);
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
                        onPress={(e) => {
                            e.stopPropagation();
                            console.log('Save recipe');
                        }}
                    >
                        <Ionicons name="bookmark-outline" size={20} color={theme.colors.text} />
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

                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={16} color="#ffc107" />
                        <Text style={styles.rating}>{recipe.rating}</Text>
                        <Text style={styles.reviews}>({recipe.reviews})</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.author}>by {recipe.authorId}</Text>

                    <View style={styles.engagement}>
                        {/* Display Likes Count Here */}
                        <View style={styles.likeButton}>
                            {/* Conditional rendering for heart icon and color */}
                            <Ionicons
                                name={isLiked ? "heart" : "heart-outline"}
                                size={18}
                                color={isLiked ? "red" : theme.colors.text}
                            />
                            <Text style={styles.likesCountText}>{likesCount}</Text>
                        </View>

                        <TouchableOpacity style={styles.commentButton} onPress={handleCommentPress}>
                            <Ionicons name="chatbubble-outline" size={18} color={theme.colors.text} />
                            {commentCount > 0 && <Text style={styles.commentCount}>{commentCount}</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.followButton}>
                            <Text style={styles.followText}>Follow</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
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
    followButton: {
        backgroundColor: theme.colors.button,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    followText: {
        color: theme.colors.buttonText,
        fontSize: 12,
        fontWeight: '600',
    },
});