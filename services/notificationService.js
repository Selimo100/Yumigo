import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseconfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  NOTIFICATIONS: 'notification_settings',
};

// Check if notifications are enabled for a specific type
const areNotificationsEnabled = async (notificationType) => {
  try {
    const savedNotifications = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (savedNotifications) {
      const settings = JSON.parse(savedNotifications);
      return settings[notificationType] !== false; // Default to true if not set
    }
    return true; // Default to enabled
  } catch (error) {
    console.error('Error checking notification settings:', error);
    return true; // Default to enabled on error
  }
};

// Create a notification
export const createNotification = async (notificationData) => {
  try {
    console.log('Creating notification in Firestore:', notificationData);
    
    const notification = {
      ...notificationData,
      createdAt: serverTimestamp(),
      read: false,
    };

    const docRef = await addDoc(collection(db, 'notifications'), notification);
    console.log('Notification created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Create notification when someone likes a recipe
export const createLikeNotification = async (recipeId, likerUserId, recipeOwnerId) => {
  if (likerUserId === recipeOwnerId) return; // Don't notify yourself

  // Check if like notifications are enabled
  const likeNotificationsEnabled = await areNotificationsEnabled('likeNotifications');
  if (!likeNotificationsEnabled) {
    console.log('Like notifications are disabled');
    return;
  }

  try {
    console.log('Creating like notification (fallback service):', { recipeId, likerUserId, recipeOwnerId });
    
    // Get liker's info
    const likerDoc = await getDoc(doc(db, 'users', likerUserId));
    const likerData = likerDoc.exists() ? likerDoc.data() : {};
    
    // Get recipe info
    const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
    const recipeData = recipeDoc.exists() ? recipeDoc.data() : {};

    const notificationId = await createNotification({
      type: 'like',
      recipientId: recipeOwnerId,
      senderId: likerUserId,
      senderName: likerData.displayName || likerData.username || likerData.email || 'Someone',
      senderAvatar: likerData.avatar || null,
      title: 'New Like! ❤️',
      message: `${likerData.displayName || likerData.username || 'Someone'} liked your recipe "${recipeData.title || 'your recipe'}"`,
      recipeId,
      recipeTitle: recipeData.title,
      actionUrl: `/recipe/${recipeId}`,
    });
    
    console.log('Like notification created successfully (fallback):', notificationId);
  } catch (error) {
    console.error('Error creating like notification (fallback):', error);
  }
};

// Create notification when someone comments on a recipe
export const createCommentNotification = async (recipeId, commenterUserId, recipeOwnerId, commentText) => {
  if (commenterUserId === recipeOwnerId) return; 

  try {
    // Get commenter's info
    const commenterDoc = await getDoc(doc(db, 'users', commenterUserId));
    const commenterData = commenterDoc.exists() ? commenterDoc.data() : {};
    
    // Get recipe info
    const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
    const recipeData = recipeDoc.exists() ? recipeDoc.data() : {};

    await createNotification({
      type: 'comment',
      recipientId: recipeOwnerId,
      senderId: commenterUserId,
      senderName: commenterData.displayName || commenterData.email || 'Someone',
      senderAvatar: commenterData.avatar || null,
      title: 'New Comment! 💬',
      message: `${commenterData.displayName || 'Someone'} commented on your recipe "${recipeData.title || 'your recipe'}"`,
      recipeId,
      recipeTitle: recipeData.title,
      commentText: commentText.substring(0, 100), 
      actionUrl: `/recipe/${recipeId}?scrollToComments=true`,
    });
  } catch (error) {
    console.error('Error creating comment notification:', error);
  }
};

// Create notification when someone follows you
export const createFollowNotification = async (followerId, followedUserId) => {
  if (followerId === followedUserId) return; // Don't notify yourself

  // Check if follow notifications are enabled
  const followNotificationsEnabled = await areNotificationsEnabled('followNotifications');
  if (!followNotificationsEnabled) {
    console.log('Follow notifications are disabled');
    return;
  }

  try {
    // Get follower's info
    const followerDoc = await getDoc(doc(db, 'users', followerId));
    const followerData = followerDoc.exists() ? followerDoc.data() : {};

    await createNotification({
      type: 'follow',
      recipientId: followedUserId,
      senderId: followerId,
      senderName: followerData.displayName || followerData.email || 'Someone',
      senderAvatar: followerData.avatar || null,
      title: 'New Follower! 👥',
      message: `${followerData.displayName || 'Someone'} started following you`,
      actionUrl: `/profile/user-profile?userId=${followerId}`,
    });
  } catch (error) {
    console.error('Error creating follow notification:', error);
  }
};

// Create notification when someone publishes a new recipe (for followers)
export const createNewRecipeNotification = async (recipeId, authorId, authorFollowers) => {
  try {
    // Get author's info
    const authorDoc = await getDoc(doc(db, 'users', authorId));
    const authorData = authorDoc.exists() ? authorDoc.data() : {};
    
    // Get recipe info
    const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
    const recipeData = recipeDoc.exists() ? recipeDoc.data() : {};

    // Create notifications for all followers
    const notificationPromises = authorFollowers.map(followerId => 
      createNotification({
        type: 'recipe',
        recipientId: followerId,
        senderId: authorId,
        senderName: authorData.displayName || authorData.email || 'Someone',
        senderAvatar: authorData.avatar || null,
        title: 'New Recipe! 🍽️',
        message: `${authorData.displayName || 'Someone'} shared a new recipe: "${recipeData.title}"`,
        recipeId,
        recipeTitle: recipeData.title,
        actionUrl: `/recipe/${recipeId}`,
      })
    );

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error creating new recipe notifications:', error);
  }
};
