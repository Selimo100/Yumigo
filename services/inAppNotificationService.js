// In-App Notification Service - Service für das Erstellen und Verwalten von In-App-Benachrichtigungen
import {addDoc, collection, serverTimestamp} from 'firebase/firestore';
import {db} from '../lib/firebaseconfig';

// keine doppelten Notifications
const activeNotifications = new Set();

export const createInAppNotification = async (notificationData) => {
    
    try {
        // Schlüssel für diese Notification
        const notificationKey = `${notificationData.recipientId}-${notificationData.type}-${notificationData.recipeId || notificationData.metadata?.followerId || 'general'}-${Date.now()}`;
        
        // keine doppelten Notifications innerhalb von 1 Sekunde => spam schutz
        const baseKey = notificationKey.substring(0, notificationKey.lastIndexOf('-'));
        const existingKey = Array.from(activeNotifications).find(key => key.startsWith(baseKey));
        
        if (existingKey) {
            return null; // Notification bereits im Prozess
        }
        
        activeNotifications.add(notificationKey);
        
        const notification = {
            ...notificationData,
            createdAt: serverTimestamp(), // Firebase Server Timestamp
            read: false,
            // NICHT type überschreiben! Behalte den originalen type (like, rating, follow, etc.)
        };

        // Speichert in Firebase Collection 'notifications'
        const docRef = await addDoc(collection(db, 'notifications'), notification);
        
        // Entferne den Schlüssel nach 2 Sekunden
        setTimeout(() => {
            activeNotifications.delete(notificationKey);
        }, 2000);
        
        return docRef.id;
    } catch (error) {
        
        // Entferne den Schlüssel bei Fehlern
        const keys = Array.from(activeNotifications).filter(key => 
            key.includes(notificationData.recipientId) && 
            key.includes(notificationData.type)
        );
        keys.forEach(key => activeNotifications.delete(key));
        
        throw error; // Re-throw für bessere Debugging
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



export const notifyRecipeComment = async (recipeId, recipeTitle, commenterName, commentText, recipeAuthorId) => {
    if (!recipeAuthorId) return;

    try {
        await createInAppNotification({
            recipientId: recipeAuthorId,
            type: 'comment',
            title: 'New Comment! 💬',
            message: `${commenterName} commented on your recipe "${recipeTitle}": "${commentText.length > 50 ? commentText.substring(0, 50) + '...' : commentText}"`,
            recipeId: recipeId,
            actionUrl: `/recipe/${recipeId}?scrollToComments=true`,
            metadata: {
                commenterName,
                recipeTitle,
                commentText: commentText.substring(0, 100) // Speichere ersten Teil des Kommentars
            }
        });
    } catch (error) {
    }
};