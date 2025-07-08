// In-App Notification Service - Service für das Erstellen und Verwalten von In-App-Benachrichtigungen
import {addDoc, collection, serverTimestamp} from 'firebase/firestore';
import {db} from '../lib/firebaseconfig';

export const createInAppNotification = async (notificationData) => {
    try {
        const notification = {
            ...notificationData,
            createdAt: serverTimestamp(), // Firebase Server Timestamp
            read: false,
            type: 'in-app'
        };

        // Speichert in Firebase Collection 'notifications'
        const docRef = await addDoc(collection(db, 'notifications'), notification);
        return docRef.id;
    } catch (error) {

        return null;
    }
};

// Verschiedene Notification-Types (Like, Follow, Comment)
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

    }
};

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

    }
};

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

    }
};