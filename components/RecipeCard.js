import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';

// Mock comment counts for recipes
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

// Tag configurations
const allergyConfig = {
  gluten: { label: 'Gluten', color: '#FF6B6B', icon: '🌾' },
  dairy: { label: 'Dairy', color: '#4ECDC4', icon: '🥛' },
  nuts: { label: 'Nuts', color: '#45B7D1', icon: '🥜' },
  shellfish: { label: 'Shellfish', color: '#96CEB4', icon: '🦐' },
  eggs: { label: 'Eggs', color: '#FFEAA7', icon: '🥚' },
  soy: { label: 'Soy', color: '#DDA0DD', icon: '🫛' },
};

const categoryConfig = {
  salty: { label: 'Salty', color: '#4A90E2', emoji: '🧂' },
  sweet: { label: 'Sweet', color: '#F5A623', emoji: '🍯' },
  sour: { label: 'Sour', color: '#7ED321', emoji: '🍋' },
  spicy: { label: 'Spicy', color: '#D0021B', emoji: '🌶️' },
  cold: { label: 'Cold', color: '#50E3C2', emoji: '🧊' },
  hot: { label: 'Hot', color: '#FF6F00', emoji: '🔥' },
};

export default function RecipeCard({ recipe }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const commentCount = mockCommentCounts[recipe.id] || 0;

  const handlePress = () => {
    router.push(`/recipe/${recipe.id}`);
  };

  const handleCommentPress = (e) => {
    e.stopPropagation();
    router.push(`/recipe/${recipe.id}?scrollToComments=true`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: recipe.image }} style={styles.image} />
        
        {/* Top right corner tags */}
        <View style={styles.topTags}>
          {recipe.categories && recipe.categories.slice(0, 2).map((category, index) => {
            const config = categoryConfig[category];
            if (!config) return null;
            return (
              <View key={category} style={[styles.tag, styles.categoryTag, { backgroundColor: config.color }]}>
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

        {/* Allergy tags */}
        {recipe.allergies && recipe.allergies.length > 0 && (
          <View style={styles.allergyTags}>
            <Ionicons name="warning-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.allergyLabel}>Contains:</Text>
            <View style={styles.allergyList}>
              {recipe.allergies.slice(0, 3).map((allergy) => {
                const config = allergyConfig[allergy];
                if (!config) return null;
                return (
                  <View key={allergy} style={[styles.allergyTag, { borderColor: config.color }]}>
                    <Text style={styles.allergyIcon}>{config.icon}</Text>
                    <Text style={[styles.allergyText, { color: config.color }]}>{config.label}</Text>
                  </View>
                );
              })}
              {recipe.allergies.length > 3 && (
                <Text style={styles.moreAllergies}>+{recipe.allergies.length - 3}</Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.metadata}>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.time}>{recipe.time}</Text>
          </View>

          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#F5A623" />
            <Text style={styles.rating}>{recipe.rating}</Text>
            <Text style={styles.reviews}>({recipe.reviews})</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.author}>by {recipe.author}</Text>
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                console.log('Like recipe');
              }}
            >
              <Ionicons name="heart-outline" size={20} color={theme.colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.commentButton}
              onPress={handleCommentPress}
            >
              <Ionicons name="chatbubble-outline" size={18} color={theme.colors.text} />
              <Text style={styles.commentCount}>{commentCount}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.followButton}
              onPress={(e) => {
                e.stopPropagation();
                console.log('Follow user');
              }}
            >
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
  categoryTag: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  commentCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
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