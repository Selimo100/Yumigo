import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import useAuth from '../lib/useAuth';

export const CommentItem = ({ comment, onLike, theme }) => {
  const router = useRouter();
  const { user } = useAuth();

  const handleUserPress = () => {
    if (comment.userId && comment.userId !== user?.uid) {
      router.push(`/profile/user-profile?userId=${comment.userId}`);
    }
  };
  const styles = StyleSheet.create({
    commentContainer: {
      flexDirection: 'row',
      paddingVertical: 8,
      paddingHorizontal: 0,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.button,
      marginRight: 12,
    },
    commentContent: {
      flex: 1,
    },
    commentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
    },
    username: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginRight: 8,
    },
    time: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    commentText: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 18,
      marginBottom: 4,
    },
    commentActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    likeButton: {
      marginRight: 16,
    },
    likesText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
  });
  return (
    <View style={styles.commentContainer}>
      <View style={styles.avatar}>
        {comment.avatar ? (
          <Image source={{ uri: comment.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="person" size={16} color={theme.colors.textSecondary} />
          </View>
        )}
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <TouchableOpacity onPress={handleUserPress}>
            <Text style={styles.username}>{comment.user}</Text>
          </TouchableOpacity>
          <Text style={styles.time}>{comment.time}</Text>
        </View>
        <Text style={styles.commentText}>{comment.comment}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity onPress={() => onLike(comment.id)} style={styles.likeButton}>
            <Text style={styles.likesText}>
              {comment.likes > 0 ? `${comment.likes} ${comment.likes === 1 ? 'like' : 'likes'}` : 'Like'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => onLike(comment.id)} style={{ marginLeft: 8 }}>
        <Ionicons 
          name={comment.isLiked ? "heart" : "heart-outline"} 
          size={16} 
          color={comment.isLiked ? "#FF6B6B" : theme.colors.textSecondary} 
        />
      </TouchableOpacity>
    </View>
  );
};

export const StarRating = ({ rating, onRatingPress, editable = false, size = 20 }) => {
  const starStyles = StyleSheet.create({
    starContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    starButton: {
      padding: 2,
    },
  });

  return (
    <View style={starStyles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => editable && onRatingPress(star)}
          disabled={!editable}
          style={starStyles.starButton}
        >
          <Ionicons
            name={star <= rating ? "star" : "star-outline"}
            size={size}
            color="#F5A623"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};