import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { StarRating } from '../../components/CommentComponents';
import { CommentInput } from '../../components/CommentInput';
import { CommentsSection } from '../../components/CommentsSection';
import { RatingModal } from '../../components/RatingModal';
import { ALLERGENS, CATEGORIES } from '../../utils/constants';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import {db} from '../../lib/firebaseconfig'

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

  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showRating, setShowRating] = useState(false);

useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const docRef = doc(db, 'recipes', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const recipeData = { id: docSnap.id, ...docSnap.data() };
          setRecipe(recipeData);

          const commentsSnap = await getDocs(collection(db, 'recipes', id, 'comments'));
          const commentsData = commentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setComments(commentsData);
        } else {
          console.warn('❌ Recipe not found');
        }
      } catch (error) {
        console.error('❌ Error fetching recipe:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRecipe();
  }, [id]);

  

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

  const handleLike = () => setIsLiked(!isLiked);

  const handleSave = () => {
    setIsSaved(!isSaved);
    Alert.alert(
      isSaved ? 'Removed from Favorites' : 'Saved to Favorites',
      isSaved ? 'Recipe removed from your favorites' : 'Recipe saved to your favorites'
    );
  };

  const handleRating = (rating) => {
    setUserRating(rating);
    setShowRating(false);
    Alert.alert(
      'Rating Submitted',
      `You rated this recipe ${rating} star${rating !== 1 ? 's' : ''}!`
    );
  };

  const handleCommentLike = (commentId) => {
    setComments(prevComments =>
      prevComments.map(comment =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
            }
          : comment
      )
    );
  };

  const handleAddComment = (commentText) => {
    const comment = {
      id: Date.now(),
      user: 'You',
      avatar: 'https://via.placeholder.com/40x40',
      comment: commentText,
      time: 'now',
      likes: 0,
      isLiked: false
    };
    setComments([comment, ...comments]);
    Alert.alert('Comment Added', 'Your comment has been posted!');
  };

  if (loading || !recipe) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
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
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Recipe Image with Category Tags */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
          
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
              <Text style={styles.time}>{recipe.time}</Text>
            </View>

            <View style={styles.ratingContainer}>
              <StarRating rating={recipe.rating} />
              <Text style={styles.rating}>{recipe.rating}</Text>
              <Text style={styles.reviews}>({recipe.reviews} reviews)</Text>
            </View>
          </View>

          <Text style={styles.author}>by {recipe.author}</Text>

          {/* Allergy Information */}
          {recipe.allergies && recipe.allergies.length > 0 && (
            <View style={styles.allergySection}>
              <View style={styles.allergyHeader}>
                <Ionicons name="warning-outline" size={18} color="#FF6B6B" />
                <Text style={styles.allergyTitle}>Allergen Information</Text>
              </View>
              <View style={styles.allergyTags}>
                {recipe.allergies.map((allergy) => {
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
});