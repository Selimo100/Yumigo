import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import { StarRating } from './CommentComponents';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';

export const RatingModal = ({ visible, onClose, onRating, userRating, recipeTitle, theme }) => {
  const [selectedRating, setSelectedRating] = useState(userRating);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setSelectedRating(userRating);
  }, [userRating]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  const handleRatingPress = (rating) => {
    setSelectedRating(rating);
    // Kleine Animation für das ausgewählte Rating
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleSubmit = () => {
    if (selectedRating > 0) {
      onRating(selectedRating);
    }
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "Rate this recipe";
    }
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: 24,
      padding: 32,
      width: '100%',
      maxWidth: 340,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    headerIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    recipeTitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
      fontStyle: 'italic',
    },
    ratingText: {
      fontSize: 18,
      color: theme.colors.primary,
      fontWeight: '600',
      marginBottom: 24,
      textAlign: 'center',
      minHeight: 24,
    },
    starsContainer: {
      marginBottom: 32,
      padding: 8,
    },
    modalButtons: {
      flexDirection: 'row',
      width: '100%',
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cancelButtonText: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      fontWeight: '600',
    },
    submitButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    submitButtonDisabled: {
      backgroundColor: theme.colors.surface,
      shadowOpacity: 0,
      elevation: 0,
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    submitButtonTextDisabled: {
      color: theme.colors.textSecondary,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.modalOverlay,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          {/* Header Icon */}
          <View style={styles.headerIcon}>
            <Ionicons 
              name="star" 
              size={32} 
              color={theme.colors.primary} 
            />
          </View>

          {/* Title */}
          <Text style={styles.modalTitle}>Rate Recipe</Text>
          
          {/* Recipe Title */}
          <Text style={styles.recipeTitle} numberOfLines={2}>
            "{recipeTitle}"
          </Text>

          {/* Rating Text */}
          <Text style={styles.ratingText}>
            {getRatingText(selectedRating)}
          </Text>
          
          {/* Stars */}
          <View style={styles.starsContainer}>
            <StarRating 
              rating={selectedRating} 
              onRatingPress={handleRatingPress} 
              editable={true} 
              size={44}
            />
          </View>
          
          {/* Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.submitButton,
                selectedRating === 0 && styles.submitButtonDisabled
              ]} 
              onPress={handleSubmit}
              disabled={selectedRating === 0}
            >
              <Text style={[
                styles.submitButtonText,
                selectedRating === 0 && styles.submitButtonTextDisabled
              ]}>
                Submit
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};