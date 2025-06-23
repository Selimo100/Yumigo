import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import RecipeCard from '../../components/RecipeCard';
import RecipeForm from '../../components/RecipeForm/RecipeForm';
import { useTheme } from '../../contexts/ThemeContext';

const mockRecipes = [
  {
    id: 1,
    title: 'Quick Pasta Carbonara',
    image: 'https://via.placeholder.com/300x200',
    time: '15 min',
    rating: 4.8,
    reviews: 124,
    author: 'Chef Mario',
    allergies: ['gluten', 'dairy'],
    categories: ['salty', 'hot'],
  },
  {
    id: 2,
    title: 'Avocado Toast Supreme',
    image: 'https://via.placeholder.com/300x200',
    time: '10 min',
    rating: 4.6,
    reviews: 89,
    author: 'FoodieQueen',
    allergies: ['gluten'],
    categories: ['salty'],
  },
];

export default function HomeScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreatePress = () => {
    setShowCreateModal(true);
  };

  const handleRecipeSuccess = (recipeId) => {
    console.log('Recipe created with ID:', recipeId);
    setShowCreateModal(false);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation */}
      <View style={styles.topNav}>
        <Text style={styles.logo}>Yumigo</Text>
        <View style={styles.topNavIcons}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreatePress}>
            <Ionicons name="add" size={24} color={theme.colors.buttonText} />
            <Text style={styles.createText}>Create</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Recipe Feed */}
      <ScrollView style={styles.feed} showsVerticalScrollIndicator={false}>
        {mockRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </ScrollView>

      {/* Create Recipe Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={handleCloseModal} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalHeaderTitle, { color: theme.colors.text }]}>Create Recipe</Text>
            <View style={styles.modalPlaceholder} />
          </View>
          
          <RecipeForm onSuccess={handleRecipeSuccess} onCancel={handleCloseModal} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
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
    backgroundColor: theme.colors.button,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  createText: {
    color: theme.colors.buttonText,
    fontSize: 14,
    fontWeight: '600',
  },
  notificationIcon: {
    padding: 5,
  },
  feed: {
    flex: 1,
    paddingTop: 10,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalPlaceholder: {
    width: 40,
  },
});