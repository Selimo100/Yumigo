// Recipe Detail - Detailansicht eines Rezepts mit Kommentaren, Bewertungen und Interaktionen
import {Alert, Image, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {router, useFocusEffect, useLocalSearchParams} from 'expo-router';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useTheme} from '../../contexts/ThemeContext';
import {StarRating} from '../../components/Comment/CommentComponents';
import {CommentInput} from '../../components/Comment/CommentInput';
import {CommentsSection} from '../../components/Comment/CommentsSection';
import {RatingModal} from '../../components/RatingModal';
import {ALLERGENS, CATEGORIES} from '../../utils/constants';
import {addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc} from 'firebase/firestore';
import {db} from '../../lib/firebaseconfig';
import {formatDistanceToNow} from 'date-fns';
import {useUserProfile} from '../../hooks/useUserProfile';
import useFavorites from '../../hooks/useFavorites';
import {deleteRecipe, getUserRating, isRecipeOwner, rateRecipe} from '../../services/recipeService';
import {addShoppingListItem} from '../../services/userService';
import {showToast} from '../../utils/toast';
import useAuth from '../../lib/useAuth';
import {createPlatformStyles} from '../../utils/platformStyles';

const formatTime = (timestamp) => {
  try {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (e) {
    return 'just now';
  }
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
export default function RecipeDetailScreen() {
  const { id, scrollToComments, created } = useLocalSearchParams();
  const { theme } = useTheme();
  const { user: currentUser } = useAuth(); 
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
  const isSaved = isFavorite(id);
  useEffect(() => {
    const fetchRecipeAndData = async () => {
      setLoading(true);
      try {
        const recipeDocRef = doc(db, 'recipes', id);
        const recipeDocSnap = await getDoc(recipeDocRef);
        if (recipeDocSnap.exists()) {
          const recipeData = { id: recipeDocSnap.id, ...recipeDocSnap.data() };
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
          const ratingsCollectionRef = collection(db, 'recipes', id, 'ratings');
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
          setRecipe({ 
            ...recipeData, 
            authorDisplayName,
            rating: averageRating,
            reviews: reviewsCount
          });
          if (currentUser) {
            const userCurrentRating = await getUserRating(id, currentUser.uid);
            setUserRating(userCurrentRating);
          }
          if (currentUser) {
            const recipeLikeDocRef = doc(db, 'recipes', id, 'likes', currentUser.uid);
            const recipeLikeSnap = await getDoc(recipeLikeDocRef);
            setIsLiked(recipeLikeSnap.exists());
          }
          const commentsSnap = await getDocs(collection(db, 'recipes', id, 'comments'));
          const commentsData = await Promise.all(commentsSnap.docs.map(async docSnapshot => {
            const data = docSnapshot.data();
            let isCommentLikedByUser = false;
            let commentLikesCount = 0;
            let commentAuthorName = data.authorName || data.authorId || 'Anonymous'; 
            if (!data.authorName && data.authorId) {
              const commentUserDocRef = doc(db, 'users', data.authorId);
              const commentUserDocSnap = await getDoc(commentUserDocRef);
              if (commentUserDocSnap.exists()) {
                commentAuthorName = commentUserDocSnap.data().displayName || commentUserDocSnap.data().email || commentAuthorName;
              }
            }
            const commentLikesCollectionRef = collection(db, 'recipes', id, 'comments', docSnapshot.id, 'likes');
            const commentLikesSnapshot = await getDocs(commentLikesCollectionRef);
            commentLikesCount = commentLikesSnapshot.size;
            if (currentUser) {
              const userCommentLikeDocRef = doc(commentLikesCollectionRef, currentUser.uid);
              const userCommentLikeSnap = await getDoc(userCommentLikeDocRef);
              isCommentLikedByUser = userCommentLikeSnap.exists();
            }            return {
              id: docSnapshot.id,
              user: commentAuthorName, 
              avatar: data.authorAvatar || null, 
              comment: data.text || '',
              time: formatTime(data.createdAt?.toDate?.() || new Date()),
              likes: commentLikesCount,
              isLiked: isCommentLikedByUser,
            };
          }));
          commentsData.sort((a, b) => {
            return 0; 
          });
          setComments(commentsData);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRecipeAndData();
  }, [id, currentUser]);
  useEffect(() => {
    if (created === 'true') {
      setTimeout(() => {
        Alert.alert(
          'Success!', 
          'Your recipe has been published successfully!',
          [{ text: 'OK' }]
        );
      }, 500); 
    }
  }, [created]);
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
        await deleteDoc(recipeLikeDocRef);
        setIsLiked(false);
      } else {
        await setDoc(recipeLikeDocRef, { timestamp: serverTimestamp() }); 
        setIsLiked(true);
      }
    } catch (error) {
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
  };
  const handleRating = async (rating) => {
    if (!currentUser) {
      Alert.alert("Login Required", "You need to be logged in to rate recipes.");
      return;
    }
    try {
      await rateRecipe(id, currentUser.uid, rating);
      setUserRating(rating);
      setShowRating(false);
      await reloadRecipeData();
    } catch (error) {
      Alert.alert("Error", "Could not save your rating.");
    }
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
          const updatedComment = {
            ...comment,
            isLiked: newIsLiked,
            likes: newLikes,
          };
          (async () => {
            try {
              if (newIsLiked) {
                await setDoc(commentLikeDocRef, { timestamp: serverTimestamp() });
              } else {
                await deleteDoc(commentLikeDocRef);
              }
            } catch (error) {
              setComments(prev => prev.map(c => c.id === commentId ? comment : c)); 
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
        authorId: currentUser.uid, 
        authorName: userProfile?.username || currentUser.displayName || currentUser.email || 'Anonymous', 
        authorAvatar: userProfile?.avatar || null, 
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'recipes', id, 'comments'), newCommentData);
      const localComment = {
        id: docRef.id,
        user: newCommentData.authorName, 
        avatar: newCommentData.authorAvatar,
        comment: commentText, 
        time: 'just now', 
        likes: 0,
        isLiked: false,
      };
      setComments(prev => [localComment, ...prev]);
    } catch (error) {
      Alert.alert('Error', 'Failed to post comment.');
    }
  };
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
              global.profileNeedsReload = true;
              Alert.alert("Recipe Deleted", "Your recipe has been deleted successfully.");
              router.back();
            } catch (error) {
              Alert.alert("Error", "Failed to delete recipe. Please try again.");
            }
          }
        }
      ]
    );
  };
  const reloadRecipeData = async () => {
    try {
      setLoading(true);
      const recipeDocRef = doc(db, 'recipes', id);
      const recipeDocSnap = await getDoc(recipeDocRef);
      if (recipeDocSnap.exists()) {
        const recipeData = { id: recipeDocSnap.id, ...recipeDocSnap.data() };
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
        const ratingsCollectionRef = collection(db, 'recipes', id, 'ratings');
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
        setRecipe({ 
          ...recipeData, 
          authorDisplayName,
          rating: averageRating,
          reviews: reviewsCount
        });
        if (currentUser) {
          const userCurrentRating = await getUserRating(id, currentUser.uid);
          setUserRating(userCurrentRating);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const handleEditRecipe = () => {
    router.push(`/recipe/edit-recipe?id=${id}`);
  };
  const handleShare = async () => {
    try {
      const shareText = `Check out this delicious recipe: ${recipe.title}\n\nIngredients:\n${recipe.ingredients.map(item => `• ${item.amount} ${item.ingredient}`).join('\n')}\n\nTime: ${recipe.time} min\nRating: ${recipe.rating}⭐\n\nBy ${recipe.authorName}`;
      const result = await Share.share({
        message: shareText,
        title: recipe.title,
        url: recipe.imageUrl, 
      });
      if (result.action === Share.sharedAction) {
      }
    } catch (error) {
      Alert.alert('Error', 'Could not share recipe. Please try again.');
    }
  };
  const handleAddToShoppingList = async () => {
    if (!currentUser) {
      Alert.alert("Login Required", "You need to be logged in to add items to your shopping list.");
      return;
    }
    try {
      let addedCount = 0;
      for (const ingredient of recipe.ingredients) {
        const itemText = `${ingredient.amount} ${ingredient.ingredient}`.trim();
        if (itemText) {
          try {
            await addShoppingListItem(currentUser.uid, { text: itemText });
            addedCount++;
          } catch (itemError) {
          }
        }
      }
      if (addedCount > 0) {
        Alert.alert(
          "Success! 🛒", 
          `${addedCount} ingredient${addedCount > 1 ? 's' : ''} ${addedCount > 1 ? 'have' : 'has'} been added to your shopping list!`,
          [
            { 
              text: "OK", 
              style: "default"
            }
          ]
        );
        showToast(`${addedCount} ingredients added to your shopping list!`);
      } else {
        Alert.alert("Error", "No ingredients could be added to your shopping list. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not add ingredients to shopping list. Please try again.");
    }
  };
  const handleCommentInputFocus = () => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };
  useFocusEffect(
    useCallback(() => {
      if (global.recipeEditCompleted) {
        reloadRecipeData();
        global.recipeEditCompleted = false;
      }
    }, [])
  );
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
      {}
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
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
        {}
        <View style={styles.imageContainer}>
          <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImage} />
          {}
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
        {}
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
          {}
          <Text style={styles.author}>by {recipe.authorName}</Text>
          {}
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
          {}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.likeButton, isLiked && styles.likedButton]}
              onPress={handleLike}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={20}
                color="#FFFFFF"
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
                color="#FFFFFF"
              />
              <Text style={[styles.buttonText, isSaved && styles.savedText]}>
                {isSaved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
          {}
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
                <Ionicons name="star-outline" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Rate Recipe</Text>
              </TouchableOpacity>
            )}
          </View>
          {}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <TouchableOpacity 
                style={styles.addToShoppingListButton}
                onPress={handleAddToShoppingList}
              >
                <Ionicons name="basket-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.addToShoppingListText}>Add to List</Text>
              </TouchableOpacity>
            </View>
            {recipe.ingredients.map((item, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ingredientText}>
                  {item.amount} {item.ingredient}
                </Text>
              </View>
            ))}
          </View>
          {}
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
          {}
          <CommentsSection
            comments={comments}
            onCommentLike={handleCommentLike}
            theme={theme}
            commentsRef={commentsRef}
          />
        </View>
      </ScrollView>
      {}
      <CommentInput 
        onAddComment={handleAddComment} 
        theme={theme} 
        onFocus={handleCommentInputFocus}
      />
      </View>
      {}
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
    backgroundColor: theme.colors.cardAccent,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    ...createPlatformStyles(
      { elevation: 0 }, // iOS: no elevation
      { elevation: 0 } // Android: no elevation
    ),
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.cardAccent,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    ...createPlatformStyles(
      { elevation: 0 }, // iOS: no elevation
      { elevation: 0 } // Android: no elevation
    ),
  },
  shareButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.cardAccent,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    ...createPlatformStyles(
      { elevation: 0 }, // iOS: no elevation
      { elevation: 0 } // Android: no elevation
    ),
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
    backgroundColor: theme.colors.cardAccent,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...createPlatformStyles(
      { elevation: 0 }, // iOS: no elevation
      { elevation: 0 } // Android: no elevation
    ),
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
    backgroundColor: theme.colors.accentBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginBottom: 20,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...createPlatformStyles(
      { elevation: 0 }, // iOS: no elevation
      { elevation: 0 } // Android: no elevation
    ),
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
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  likedButton: {
    backgroundColor: '#FF6B6B',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  savedButton: {
    backgroundColor: '#4ECDC4',
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  likedText: {
    color: '#FFFFFF',
  },
  savedText: {
    color: '#FFFFFF',
  },
  ratingSection: {
    backgroundColor: theme.colors.cardAccent,
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...createPlatformStyles(
      { elevation: 0 }, // iOS: no elevation
      { elevation: 0 } // Android: no elevation
    ),
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
    color: theme.colors.primary,
    fontWeight: '600',
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  addToShoppingListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: 6,
  },
  addToShoppingListText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: theme.colors.cardAccent,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginRight: 12,
  },
  ingredientText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  stepCard: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.cardAccent,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    ...createPlatformStyles(
      { elevation: 0 }, // iOS: no elevation
      { elevation: 0 } // Android: no elevation
    ),
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
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: theme.colors.primary,
  },
  stepNumber: {
    fontWeight: '600',
    fontSize: 13,
    color: '#FFFFFF',
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