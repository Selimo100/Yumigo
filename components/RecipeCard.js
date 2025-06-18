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
      <Image source={{ uri: recipe.image }} style={styles.image} />
      
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
  image: {
    width: '100%',
    height: 200,
    backgroundColor: theme.colors.button,
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