import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseconfig';

// Create a simple in-app notification in Firestore
// No external push notifications - only visible when user opens the app
export const createInAppNotification = async (notificationData) => {
  try {
    const notification = {
      ...notificationData,
      createdAt: serverTimestamp(),
      read: false,
      type: 'in-app' // Mark as in-app only
    };    
    
    const docRef = await addDoc(collection(db, 'notifications'), notification);
    return docRef.id;
  } catch (error) {
    // Silent error handling - notifications are optional
    return null;
  }
};

// Notify when someone likes a recipe
export const notifyRecipeLike = async (recipeId, recipeTitle, likerName, recipeAuthorId) => {
  if (!recipeAuthorId) return;
  
  try {
    await createInAppNotification({
      recipientId: recipeAuthorId,
      type: 'like',
      title: 'Recipe Liked! ❤️',
      message: `${likerName} liked your recipe "${recipeTitle}"`,
      recipeId: recipeId,
      actionUrl: `/recipe/${recipeId}`,
      metadata: {
        likerName,
        recipeTitle
      }
    });
  } catch (error) {
    // Silent error handling
  }
};

// Notify when someone follows a user
export const notifyUserFollow = async (followedUserId, followerName, followerId) => {
  if (!followedUserId) return;
  
  try {
    await createInAppNotification({
      recipientId: followedUserId,
      type: 'follow',
      title: 'New Follower! 👥',
      message: `${followerName} started following you`,
      actionUrl: `/profile/user-profile?userId=${followerId}`,
      metadata: {
        followerName,
        followerId
      }
    });
  } catch (error) {
    // Silent error handling
  }
};

// Notify when someone rates a recipe
export const notifyRecipeRating = async (recipeId, recipeTitle, raterName, rating, recipeAuthorId) => {
  if (!recipeAuthorId) return;
  
  try {
    await createInAppNotification({
      recipientId: recipeAuthorId,
      type: 'rating',
      title: 'Recipe Rated! ⭐',
      message: `${raterName} gave your recipe "${recipeTitle}" ${rating} star${rating !== 1 ? 's' : ''}`,
      recipeId: recipeId,
      actionUrl: `/recipe/${recipeId}`,
      metadata: {
        raterName,
        recipeTitle,
        rating
      }
    });
  } catch (error) {
    // Silent error handling
  }
};

// Clean up old notifications (older than 30 days)
export const cleanupOldNotifications = async (userId) => {
  // This could be implemented as a periodic cleanup
  // For now, we'll let them accumulate
  // In production, you might want to implement this with Cloud Functions
};
