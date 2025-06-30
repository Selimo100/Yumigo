import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { StarRating } from '../../components/CommentComponents';
import { CommentInput } from '../../components/CommentInput';
import { CommentsSection } from '../../components/CommentsSection';
import { RatingModal } from '../../components/RatingModal';
import { ALLERGENS, CATEGORIES } from '../../utils/constants';
import { doc, getDoc, collection, getDocs, addDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebaseconfig';
import { formatDistanceToNow } from 'date-fns';
import { getAuth } from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';
import { useUserProfile } from '../../hooks/useUserProfile';
import useFavorites from '../../hooks/useFavorites';
import { deleteRecipe, isRecipeOwner } from '../../services/recipeService';
import useAuth from '../../lib/useAuth';

const formatTime = (timestamp) => {
  try {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (e) {
    console.error("Error formatting time:", e);
    return 'just now';
  }
};

// Convert arrays to config objects for easier lookup
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

export default function RecipeDetailScreen() {
  const { id, scrollToComments } = useLocalSearchParams();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const scrollViewRef = useRef(null);
  const commentsRef = useRef(null);
  const { profile: userProfile } = useUserProfile();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showRating, setShowRating] = useState(false);

  // Check if this recipe is in favorites
  const isSaved = isFavorite(id);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchRecipeAndData = async () => {
      setLoading(true);
      try {
        const recipeDocRef = doc(db, 'recipes', id);
        const recipeDocSnap = await getDoc(recipeDocRef);

        if (recipeDocSnap.exists()) {
          const recipeData = { id: recipeDocSnap.id, ...recipeDocSnap.data() };

          // --- START CHANGES HERE ---
          // Fetch author's display name
          let authorDisplayName = 'Anonymous';
          if (recipeData.authorId) {
            const userDocRef = doc(db, 'users', recipeData.authorId); // Assuming you have a 'users' collection
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              authorDisplayName = userDocSnap.data().displayName || userDocSnap.data().email || 'Anonymous';
            } else if (currentUser && currentUser.uid === recipeData.authorId) {
              // Fallback to current user's display name if the recipe is by them
              authorDisplayName = currentUser.displayName || currentUser.email || 'Anonymous';
            }
          }
          setRecipe({ ...recipeData, authorDisplayName });
          // --- END CHANGES HERE ---

          // Check if current user has liked this recipe
          if (currentUser) {
            const recipeLikeDocRef = doc(db, 'recipes', id, 'likes', currentUser.uid);
            const recipeLikeSnap = await getDoc(recipeLikeDocRef);
            setIsLiked(recipeLikeSnap.exists());
          }

          // Fetch comments and their like status/counts
          const commentsSnap = await getDocs(collection(db, 'recipes', id, 'comments'));
          const commentsData = await Promise.all(commentsSnap.docs.map(async docSnapshot => {
            const data = docSnapshot.data();
            let isCommentLikedByUser = false;
            let commentLikesCount = 0;
            let commentAuthorName = data.authorName || data.authorId || 'Anonymous'; // Use existing authorName from comment or fallback

            // If authorId is present but authorName is not, try fetching from users collection for comments too
            if (!data.authorName && data.authorId) {
              const commentUserDocRef = doc(db, 'users', data.authorId);
              const commentUserDocSnap = await getDoc(commentUserDocRef);
              if (commentUserDocSnap.exists()) {
                commentAuthorName = commentUserDocSnap.data().displayName || commentUserDocSnap.data().email || commentAuthorName;
              }
            }


            // Fetch total likes for this comment
            const commentLikesCollectionRef = collection(db, 'recipes', id, 'comments', docSnapshot.id, 'likes');
            const commentLikesSnapshot = await getDocs(commentLikesCollectionRef);
            commentLikesCount = commentLikesSnapshot.size;

            // Check if current user liked this comment
            if (currentUser) {
              const userCommentLikeDocRef = doc(commentLikesCollectionRef, currentUser.uid);
              const userCommentLikeSnap = await getDoc(userCommentLikeDocRef);
              isCommentLikedByUser = userCommentLikeSnap.exists();
            }            return {
              id: docSnapshot.id,
              user: commentAuthorName, // Use the fetched/resolved author name for comments
              avatar: data.authorAvatar || null, // Use the stored avatar from comment data
              comment: data.text || '',
              time: formatTime(data.createdAt?.toDate?.() || new Date()),
              likes: commentLikesCount,
              isLiked: isCommentLikedByUser,
            };
          }));

          // Sort comments by timestamp, newest first
          commentsData.sort((a, b) => {
            // This sort is problematic if 'time' is a string like "X minutes ago".
            // Ideally, you'd sort by the raw `createdAt` timestamp.
            // For now, if your `formatTime` returns "just now" for new comments, they might not sort correctly.
            // Let's assume you fetch `createdAt` and use it for sorting directly:
            // If `data.createdAt` from Firestore is a Timestamp, it needs to be compared as such.
            // This section assumes `commentsData` now includes `createdAt` as a Date object or Firebase Timestamp
            // For better sorting, pass `createdAt` from `docSnapshot.data()` to the comment object.
            // Example:
            // const timeA = commentsSnap.docs.find(d => d.id === a.id)?.data()?.createdAt?.toDate?.() || new Date(0);
            // const timeB = commentsSnap.docs.find(d => d.id === b.id)?.data()?.createdAt?.toDate?.() || new Date(0);
            // return timeB.getTime() - timeA.getTime();
            return 0; // Keeping original order of fetched comments for now
          });

          setComments(commentsData);

        } else {
          console.warn('❌ Recipe not found');
        }
      } catch (error) {
        console.error('❌ Error fetching recipe and data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRecipeAndData();
  }, [id, currentUser]); // Re-run effect if recipe ID or current user changes


  useEffect(() => {
    if (scrollToComments === 'true') {
      setTimeout(() => {
        commentsRef.current?.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y: y - 100, animated: true });
          }
        );
      }, 500);
    }
  }, [scrollToComments]);

  const handleLike = async () => {
    if (!currentUser) {
      Alert.alert("Login Required", "You need to be logged in to like recipes.");
      return;
    }

    const recipeLikeDocRef = doc(db, 'recipes', id, 'likes', currentUser.uid);

    try {
      if (isLiked) {
        // User is unliking
        await deleteDoc(recipeLikeDocRef);
        setIsLiked(false);
        Alert.alert("Unliked", "Recipe removed from your liked items.");
      } else {
        // User is liking
        await setDoc(recipeLikeDocRef, { timestamp: serverTimestamp() }); // Add timestamp for potential future use (e.g., when it was liked)
        setIsLiked(true);
        Alert.alert("Liked", "Recipe added to your liked items!");
      }
      // TODO: Consider updating the recipe's global like count field in Firestore here
      // (This would typically involve Cloud Functions or a transaction for atomic updates)
    } catch (error) {
      console.error("Error updating recipe like:", error);
      Alert.alert("Error", "Could not update like status.");
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      Alert.alert("Login Required", "You need to be logged in to save recipes to favorites.");
      return;
    }

    try {
      await toggleFavorite(id);
      Alert.alert(
        isSaved ? 'Removed from Favorites' : 'Saved to Favorites',
        isSaved ? 'Recipe removed from your favorites' : 'Recipe saved to your favorites'
      );
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
  };

  const handleRating = (rating) => {
    setUserRating(rating);
    setShowRating(false);
    Alert.alert(
      'Rating Submitted',
      `You rated this recipe ${rating} star${rating !== 1 ? 's' : ''}!`
    );
    // TODO: Implement saving user ratings to Firestore
  };

  const handleCommentLike = (commentId) => {
    if (!currentUser) {
      Alert.alert("Login Required", "You need to be logged in to like comments.");
      return;
    }

    const commentLikeDocRef = doc(db, 'recipes', id, 'comments', commentId, 'likes', currentUser.uid);

    setComments(prevComments =>
      prevComments.map(comment => {
        if (comment.id === commentId) {
          const newIsLiked = !comment.isLiked;
          const newLikes = newIsLiked ? comment.likes + 1 : comment.likes - 1;

          // Optimistically update UI
          const updatedComment = {
            ...comment,
            isLiked: newIsLiked,
            likes: newLikes,
          };

          // Perform Firestore update in the background
          (async () => {
            try {
              if (newIsLiked) {
                await setDoc(commentLikeDocRef, { timestamp: serverTimestamp() });
              } else {
                await deleteDoc(commentLikeDocRef);
              }
            } catch (error) {
              console.error("Error updating comment like in Firestore:", error);
              // If Firestore update fails, revert the local state change
              setComments(prev => prev.map(c => c.id === commentId ? comment : c)); // Revert to original state
              Alert.alert("Error", "Could not update comment like status.");
            }
          })();

          return updatedComment;
        }
        return comment;
      })
    );
  };

  const handleAddComment = async (commentText) => {
    if (!currentUser) {
      Alert.alert("Login Required", "You need to be logged in to post comments.");
      return;
    }

    if (!commentText.trim()) {
      Alert.alert("Empty Comment", "Please enter some text for your comment.");
      return;
    }

    try {
      const newCommentData = {
        text: commentText,
        authorId: currentUser.uid, // Store UID for security/lookup
        authorName: userProfile?.username || currentUser.displayName || currentUser.email || 'Anonymous', // Store display name for UI
        authorAvatar: userProfile?.avatar || null, // Store user's profile picture
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'recipes', id, 'comments'), newCommentData);

      // Create local comment for immediate UI update, ensuring 'comment' key
      const localComment = {
        id: docRef.id,
        user: newCommentData.authorName, // Use the display name for UI
        avatar: newCommentData.authorAvatar, // Use user's actual avatar
        comment: commentText, // Corrected: This must be 'comment' for CommentsSection
        time: 'just now', // Will be updated on next fetch
        likes: 0,
        isLiked: false,
      };

      setComments(prev => [localComment, ...prev]); // Add new comment to the top
      Alert.alert('Comment added', 'Your comment has been posted!');
    } catch (error) {
      console.error('❌ Failed to post comment:', error);
      Alert.alert('Error', 'Failed to post comment.');
    }
  };

  // Handle recipe deletion
  const handleDeleteRecipe = () => {
    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to delete this recipe? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRecipe(id, recipe.authorId);
              Alert.alert("Recipe Deleted", "Your recipe has been deleted successfully.");
              router.back();
            } catch (error) {
              console.error('Error deleting recipe:', error);
              Alert.alert("Error", "Failed to delete recipe. Please try again.");
            }
          }
        }
      ]
    );
  };

  // Function to reload recipe data
  const reloadRecipeData = async () => {
    try {
      setLoading(true);
      const recipeDocRef = doc(db, 'recipes', id);
      const recipeDocSnap = await getDoc(recipeDocRef);

      if (recipeDocSnap.exists()) {
        const recipeData = { id: recipeDocSnap.id, ...recipeDocSnap.data() };

        // Fetch author's display name
        let authorDisplayName = 'Anonymous';
        if (recipeData.authorId) {
          const userDocRef = doc(db, 'users', recipeData.authorId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            authorDisplayName = userDocSnap.data().displayName || userDocSnap.data().email || 'Anonymous';
          } else if (currentUser && currentUser.uid === recipeData.authorId) {
            authorDisplayName = currentUser.displayName || currentUser.email || 'Anonymous';
          }
        }
        setRecipe({ ...recipeData, authorDisplayName });
      }
    } catch (error) {
      console.error('Error reloading recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle recipe editing with callback
  const handleEditRecipe = () => {
    router.push(`/recipe/edit-recipe?id=${id}`);
  };

  // Listen for navigation back from edit screen using useFocusEffect
  useFocusEffect(
    useCallback(() => {
      // Check if edit was completed
      if (global.recipeEditCompleted) {
        reloadRecipeData();
        global.recipeEditCompleted = false; // Reset flag
      }
    }, [])
  );

  // Check if current user is the recipe owner
  const isOwner = isRecipeOwner(recipe, currentUser?.uid);

  if (loading || !recipe) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.text }}>Loading recipe details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          {isOwner && (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={handleEditRecipe}>
                <Ionicons name="create-outline" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleDeleteRecipe}>
                <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Recipe Image with Category Tags */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImage} />

          {/* Category Tags on Image */}
          {recipe.categories && recipe.categories.length > 0 && (
            <View style={styles.imageTags}>
              {recipe.categories.slice(0, 3).map((category) => {
                const config = categoryConfig[category];
                if (!config) return null;
                return (
                  <View key={category} style={[styles.categoryTag, { backgroundColor: config.color }]}>
                    <Text style={styles.categoryEmoji}>{config.emoji}</Text>
                    <Text style={styles.categoryText}>{config.label}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Recipe Info */}
        <View style={styles.content}>
          <Text style={styles.title}>{recipe.title}</Text>

          <View style={styles.metadata}>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.time}>{recipe.time} min</Text>
            </View>

            <View style={styles.ratingContainer}>
              <StarRating rating={recipe.rating} />
              <Text style={styles.rating}>{recipe.rating}</Text>
              <Text style={styles.reviews}>({recipe.reviews} reviews)</Text>
            </View>
          </View>

          {/* Use recipe.authorName here */}
          <Text style={styles.author}>by {recipe.authorName}</Text>

          {/* Allergy Information */}
          {recipe.allergens && recipe.allergens.length > 0 && (
            <View style={styles.allergySection}>
              <View style={styles.allergyHeader}>
                <Ionicons name="warning-outline" size={18} color="#FF6B6B" />
                <Text style={styles.allergyTitle}>Allergen Information</Text>
              </View>
              <View style={styles.allergyTags}>
                {recipe.allergens.map((allergy) => {
                  const config = allergyConfig[allergy];
                  if (!config) return null;
                  return (
                    <View key={allergy} style={[styles.allergyTag, { borderColor: config.color, backgroundColor: config.color + '15' }]}>
                      <Text style={styles.allergyIcon}>{config.icon}</Text>
                      <Text style={[styles.allergyText, { color: config.color }]}>{config.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <Text style={styles.description}>{recipe.description}</Text>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.likeButton, isLiked && styles.likedButton]}
              onPress={handleLike}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={20}
                color={isLiked ? "#FF6B6B" : theme.colors.buttonText}
              />
              <Text style={[styles.buttonText, isLiked && styles.likedText]}>
                {isLiked ? 'Liked' : 'Like'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, isSaved && styles.savedButton]}
              onPress={handleSave}
            >
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={20}
                color={isSaved ? "#4ECDC4" : theme.colors.buttonText}
              />
              <Text style={[styles.buttonText, isSaved && styles.savedText]}>
                {isSaved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <Text style={styles.ratingSectionTitle}>Rate this recipe</Text>
            {userRating > 0 ? (
              <View style={styles.userRatingContainer}>
                <Text style={styles.userRatingText}>Your rating:</Text>
                <StarRating rating={userRating} size={24} />
                <TouchableOpacity onPress={() => setShowRating(true)} style={styles.changeRatingButton}>
                  <Text style={styles.changeRatingText}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.rateButton} onPress={() => setShowRating(true)}>
                <Ionicons name="star-outline" size={20} color={theme.colors.buttonText} />
                <Text style={styles.buttonText}>Rate Recipe</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((item, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ingredientText}>
                  {item.amount} {item.ingredient}
                </Text>
              </View>
            ))}
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.sectionSubtitle}>Step-by-step guide</Text>

            {recipe.instructions?.length > 0 ? (
              recipe.instructions.map((step, index) => (
                <View key={index} style={styles.stepCard}>
                  <View style={styles.stepHeader}>
                    <View style={styles.stepCircle}>
                      <Text style={styles.stepNumber}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepTitle}>Step {index + 1}</Text>
                  </View>
                  <Text style={styles.stepDescription}>{step}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.ingredientText}>No instructions provided.</Text>
            )}
          </View>

          {/* Comments Section */}
          <CommentsSection
            comments={comments}
            onCommentLike={handleCommentLike}
            theme={theme}
            commentsRef={commentsRef}
          />
        </View>
      </ScrollView>

      {/* Comment Input */}
      <CommentInput onAddComment={handleAddComment} theme={theme} />

      {/* Rating Modal */}
      <RatingModal
        visible={showRating}
        onClose={() => setShowRating(false)}
        onRating={handleRating}
        userRating={userRating}
        recipeTitle={recipe.title}
        theme={theme}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: theme.isDarkMode
      ? 'rgba(0,0,0,0.8)'
      : 'rgba(255,255,255,0.9)',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  shareButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  imageContainer: {
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: 300,
    backgroundColor: theme.colors.surface,
  },
  imageTags: {
    position: 'absolute',
    top: 80,
    right: 20,
    gap: 8,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    marginLeft: 4,
  },
  reviews: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  author: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 20,
  },
  allergySection: {
    backgroundColor: '#FF6B6B10',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B30',
    marginBottom: 20,
  },
  allergyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  allergyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  allergyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  allergyIcon: {
    fontSize: 14,
  },
  allergyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: 30,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  likeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.button,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.button,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  likedButton: {
    backgroundColor: '#FF6B6B20',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  savedButton: {
    backgroundColor: '#4ECDC420',
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  likedText: {
    color: '#FF6B6B',
  },
  savedText: {
    color: '#4ECDC4',
  },
  ratingSection: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  ratingSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  userRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userRatingText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  changeRatingButton: {
    marginLeft: 10,
  },
  changeRatingText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.button,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 20,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.text,
    marginRight: 12,
  },
  ingredientText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },

  stepCard: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
  },

  stepNumber: {
    fontWeight: '600',
    fontSize: 13,
    color: '#333',
  },

  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },

  stepDescription: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 10,
  },

});