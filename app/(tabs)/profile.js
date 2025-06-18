import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Recipe {
  id: string;
  title: string;
  time: string;
  rating: number;
  likes: number;
  chef: string;
  image?: string;
}

interface UserProfile {
  id: string;
  username: string;
  bio: string;
  following: number;
  followers: number;
  recipes: number;
  profileImage?: string;
}

interface ProfileScreenProps {
  user?: UserProfile;
  recipes?: Recipe[];
  onEditProfile?: () => void;
  onShareProfile?: () => void;
  onRecipePress?: (recipe: Recipe) => void;
}

export default function ProfileScreen({
  user,
  recipes = [],
  onEditProfile,
  onShareProfile,
  onRecipePress,
}: ProfileScreenProps) {
  
  // Default user data if none provided
  const defaultUser: UserProfile = {
    id: '1',
    username: 'Username',
    bio: 'Food enthusiast | 15-min recipe creator | Making cooking simple',
    following: 89,
    followers: 125,
    recipes: 2,
  };

  // Default recipes if none provided
  const defaultRecipes: Recipe[] = [
    {
      id: '1',
      title: 'Quick Pasta Carbonara',
      time: '15 min',
      rating: 4.8,
      likes: 99,
      chef: 'Chef Mario',
    },
    {
      id: '2',
      title: 'Quick Pasta Carbonara',
      time: '16 min',
      rating: 4.8,
      likes: 99,
      chef: 'Chef Mario',
    }
  ];

  const currentUser = user || defaultUser;
  const recipeList = recipes.length > 0 ? recipes : defaultRecipes;

  const renderRecipeCard = (recipe: Recipe) => (
    <TouchableOpacity 
      key={recipe.id} 
      style={styles.recipeCard}
      onPress={() => onRecipePress?.(recipe)}
    >
      <View style={styles.recipeImageContainer}>
        <View style={styles.recipeImagePlaceholder}>
          <Ionicons name="restaurant" size={40} color="#999" />
        </View>
        <View style={styles.timeTag}>
          <Ionicons name="time-outline" size={12} color="#fff" />
          <Text style={styles.timeText}>{recipe.time}</Text>
        </View>
      </View>
      
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {recipe.title}
        </Text>
        <Text style={styles.chefName}>by {recipe.chef}</Text>
        
        <View style={styles.recipeStats}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#ffc107" />
            <Text style={styles.ratingText}>{recipe.rating}</Text>
          </View>
          
          <View style={styles.likesContainer}>
            <Ionicons name="heart-outline" size={14} color="#6c757d" />
            <Text style={styles.likesText}>{recipe.likes}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {/* Profile Picture */}
          <View style={styles.profilePicture}>
            {currentUser.profileImage ? (
              <Image 
                source={{ uri: currentUser.profileImage }} 
                style={styles.profileImage}
              />
            ) : (
              <Ionicons name="person" size={50} color="#6c757d" />
            )}
          </View>
          
          {/* Username */}
          <Text style={styles.username}>{currentUser.username}</Text>
          
          {/* Stats Row */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{currentUser.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{currentUser.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{currentUser.recipes}</Text>
              <Text style={styles.statLabel}>Recipes</Text>
            </View>
          </View>

          {/* Bio */}
          <Text style={styles.bio}>{currentUser.bio}</Text>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={onEditProfile}
            >
              <Ionicons name="create-outline" size={18} color="#333" />
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={onShareProfile}
            >
              <Ionicons name="share-outline" size={18} color="#333" />
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Your Recipes Section */}
        <View style={styles.recipesSection}>
          <Text style={styles.sectionTitle}>Your Recipes</Text>
          
          <View style={styles.recipesGrid}>
            {recipeList.map(renderRecipeCard)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#fafafa',
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#ffffff',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  bio: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  recipesSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 20,
  },
  recipesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recipeCard: {
    width: (width - 64) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  recipeImageContainer: {
    position: 'relative',
    height: 120,
  },
  recipeImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  timeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  recipeInfo: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
    lineHeight: 20,
  },
  chefName: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 8,
    fontWeight: '500',
  },
  recipeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likesText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
});

// Example usage:
/*
import { ProfileScreen } from './ProfileScreen';

export default function App() {
  return (
    <ProfileScreen 
      onEditProfile={() => console.log('Edit profile')}
      onShareProfile={() => console.log('Share profile')}
      onRecipePress={(recipe) => console.log('Recipe pressed:', recipe)}
    />
  );
}
*/