import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseconfig';

// Configure how notifications should be handled when the app is running
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications and get the Expo push token
export const registerForPushNotificationsAsync = async (userId) => {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0D6159',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    try {
      // Get the Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      
      token = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;
      
      console.log('Push token:', token);
      
      // Save token to user's document in Firestore
      if (userId && token) {
        await setDoc(doc(db, 'users', userId), {
          expoPushToken: token,
          lastTokenUpdate: serverTimestamp()
        }, { merge: true });
        console.log('Push token saved to Firestore');
      }
      
    } catch (error) {
      console.error('Error getting push token:', error);
      token = null;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
};

// Create a notification in Firestore
export const createNotification = async (notificationData) => {
  try {
    const notification = {
      ...notificationData,
      createdAt: serverTimestamp(),
      read: false,
    };

    const docRef = await addDoc(collection(db, 'notifications'), notification);
    console.log('Notification created with ID:', docRef.id);

    // Send push notification to recipient
    await sendPushNotification(notificationData.recipientId, {
      title: notificationData.title,
      body: notificationData.message,
      data: {
        notificationId: docRef.id,
        type: notificationData.type,
        actionUrl: notificationData.actionUrl || null,
        recipeId: notificationData.recipeId || null,
      }
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Send push notification using Expo's push service
export const sendPushNotification = async (userId, notification) => {
  try {
    // Get user's push token from Firestore
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      console.log('User document not found for push notification');
      return;
    }

    const userData = userDoc.data();
    const pushToken = userData.expoPushToken;

    if (!pushToken) {
      console.log('No push token found for user:', userId);
      return;
    }

    // Send push notification via Expo's push service
    const message = {
      to: pushToken,
      sound: 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data,
      badge: 1,
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const responseData = await response.json();
    console.log('Push notification sent:', responseData);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

// Create notification when someone likes a recipe
export const createLikeNotification = async (recipeId, likerUserId, recipeOwnerId) => {
  if (likerUserId === recipeOwnerId) return; // Don't notify yourself

  try {
    console.log('Creating like notification:', { recipeId, likerUserId, recipeOwnerId });
    
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
    
    console.log('Like notification created successfully:', notificationId);
  } catch (error) {
    console.error('Error creating like notification:', error);
  }
};

// Create notification when someone comments on a recipe
export const createCommentNotification = async (recipeId, commenterUserId, recipeOwnerId, commentText) => {
  if (commenterUserId === recipeOwnerId) return; 

  try {
    console.log('Creating comment notification:', { recipeId, commenterUserId, recipeOwnerId });
    
    // Get commenter's info
    const commenterDoc = await getDoc(doc(db, 'users', commenterUserId));
    const commenterData = commenterDoc.exists() ? commenterDoc.data() : {};
    
    // Get recipe info
    const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
    const recipeData = recipeDoc.exists() ? recipeDoc.data() : {};

    const notificationId = await createNotification({
      type: 'comment',
      recipientId: recipeOwnerId,
      senderId: commenterUserId,
      senderName: commenterData.displayName || commenterData.username || commenterData.email || 'Someone',
      senderAvatar: commenterData.avatar || null,
      title: 'New Comment! 💬',
      message: `${commenterData.displayName || commenterData.username || 'Someone'} commented on your recipe "${recipeData.title || 'your recipe'}"`,
      recipeId,
      recipeTitle: recipeData.title,
      commentText: commentText.substring(0, 100), 
      actionUrl: `/recipe/${recipeId}?scrollToComments=true`,
    });
    
    console.log('Comment notification created successfully:', notificationId);
  } catch (error) {
    console.error('Error creating comment notification:', error);
  }
};

// Create notification when someone follows you
export const createFollowNotification = async (followerId, followedUserId) => {
  if (followerId === followedUserId) return; // Don't notify yourself

  try {
    console.log('Creating follow notification:', { followerId, followedUserId });
    
    // Get follower's info
    const followerDoc = await getDoc(doc(db, 'users', followerId));
    const followerData = followerDoc.exists() ? followerDoc.data() : {};

    const notificationId = await createNotification({
      type: 'follow',
      recipientId: followedUserId,
      senderId: followerId,
      senderName: followerData.displayName || followerData.username || followerData.email || 'Someone',
      senderAvatar: followerData.avatar || null,
      title: 'New Follower! 👥',
      message: `${followerData.displayName || followerData.username || 'Someone'} started following you`,
      actionUrl: `/profile/user-profile?userId=${followerId}`,
    });
    
    console.log('Follow notification created successfully:', notificationId);
  } catch (error) {
    console.error('Error creating follow notification:', error);
  }
};

// Create notification when someone publishes a new recipe (for followers)
export const createNewRecipeNotification = async (recipeId, authorId, authorFollowers) => {
  try {
    console.log('Creating new recipe notifications:', { recipeId, authorId, followerCount: authorFollowers.length });
    
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
        senderName: authorData.displayName || authorData.username || authorData.email || 'Someone',
        senderAvatar: authorData.avatar || null,
        title: 'New Recipe! 🍽️',
        message: `${authorData.displayName || authorData.username || 'Someone'} shared a new recipe: "${recipeData.title}"`,
        recipeId,
        recipeTitle: recipeData.title,
        actionUrl: `/recipe/${recipeId}`,
      })
    );

    await Promise.all(notificationPromises);
    console.log(`Created ${authorFollowers.length} new recipe notifications`);
  } catch (error) {
    console.error('Error creating new recipe notifications:', error);
  }
};

// Handle notification interactions when app is foregrounded
export const handleNotificationResponse = (response) => {
  const data = response.notification.request.content.data;
  console.log('Notification tapped:', data);
  
  // You can handle navigation here based on the notification data
  if (data.actionUrl) {
    // Navigate to the specified URL
    // This would typically be handled in your main app component
    return data.actionUrl;
  }
  
  return null;
};
