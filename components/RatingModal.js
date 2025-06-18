import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { StarRating } from './CommentComponents';

export const RatingModal = ({ visible, onClose, onRating, userRating, recipeTitle, theme }) => {
  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      padding: 30,
      margin: 20,
      alignItems: 'center',
      minWidth: 300,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 10,
    },
    modalSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 30,
      lineHeight: 22,
    },
    modalButtons: {
      marginTop: 30,
      width: '100%',
    },
    cancelButton: {
      backgroundColor: theme.colors.button,
      paddingVertical: 12,
      borderRadius: 25,
      alignItems: 'center',
    },
    cancelButtonText: {
      color: theme.colors.buttonText,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Rate this recipe</Text>
          <Text style={styles.modalSubtitle}>How would you rate "{recipeTitle}"?</Text>
          
          <StarRating 
            rating={userRating} 
            onRatingPress={onRating} 
            editable={true} 
            size={40}
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};