// Recipe Service - CRUD-Operationen für Rezepte, Likes, Kommentare und Bildupload

import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import {deleteObject, getDownloadURL, ref, uploadBytes} from 'firebase/storage';
import {db, storage} from '../lib/firebaseconfig';
import {updateUserRecipeCount} from './userService';
import {notifyRecipeLike} from './inAppNotificationService';
import {profileUpdateEmitter} from '../utils/profileUpdateEmitter';

export const getRecipe = async (recipeId) => {
    try {
        const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
        if (recipeDoc.exists()) {
            return {id: recipeDoc.id, ...recipeDoc.data()};
        }
        return null;
    } catch (error) {
        throw error;
    }
};

export const updateRecipe = async (recipeId, recipeData, imageUri = null) => {
    try {
        let imageUrl = recipeData.imageUrl;

        if (imageUri && imageUri !== recipeData.imageUrl) {
            try {

                if (recipeData.imageUrl) {
                    const oldImageRef = ref(storage, recipeData.imageUrl);
                    await deleteObject(oldImageRef).catch(() => {

                    });
                }

                const response = await fetch(imageUri);
                const blob = await response.blob();
                const imageRef = ref(storage, `recipes/${recipeId}_${Date.now()}`);
                const snapshot = await uploadBytes(imageRef, blob);
                imageUrl = await getDownloadURL(snapshot.ref);
            } catch (imageError) {

            }
        }

        const updatedData = {
            ...recipeData,
            imageUrl,
            updatedAt: serverTimestamp(),
        };

        const recipeRef = doc(db, 'recipes', recipeId);
        await updateDoc(recipeRef, updatedData);

        return {id: recipeId, ...updatedData};
    } catch (error) {
        throw error;
    }
};

// KOMPLEXE LÖSCH-OPERATION: Cascading Delete für komplettes Rezept-Ökosystem
// Entfernt Rezept, Bilder, Kommentare, Likes und aktualisiert User-Statistiken
export const deleteRecipe = async (recipeId, authorId) => {
    try {
        const recipeRef = doc(db, 'recipes', recipeId);
        const recipeDoc = await getDoc(recipeRef);

        if (!recipeDoc.exists()) {
            throw new Error('Recipe not found');
        }

        const recipeData = recipeDoc.data();

        // BILD-VERWALTUNG: Entferne gespeicherte Bilder aus Storage
        if (recipeData.imageUrl) {
            try {
                const imageRef = ref(storage, recipeData.imageUrl);
                await deleteObject(imageRef);
            } catch (imageError) {

            }
        }

        // CASCADE DELETE: Entferne alle zugehörigen Kommentare und deren Likes
        const commentsCollection = collection(db, 'recipes', recipeId, 'comments');
        const commentsSnapshot = await getDocs(commentsCollection);

        const deleteCommentPromises = commentsSnapshot.docs.map(async (commentDoc) => {

            const likesCollection = collection(db, 'recipes', recipeId, 'comments', commentDoc.id, 'likes');
            const likesSnapshot = await getDocs(likesCollection);
            const deleteLikePromises = likesSnapshot.docs.map(likeDoc => deleteDoc(likeDoc.ref));
            await Promise.all(deleteLikePromises);

            await deleteDoc(commentDoc.ref);
        });

        await Promise.all(deleteCommentPromises);

        const likesCollection = collection(db, 'recipes', recipeId, 'likes');
        const likesSnapshot = await getDocs(likesCollection);
        const deleteLikePromises = likesSnapshot.docs.map(likeDoc => deleteDoc(likeDoc.ref));
        await Promise.all(deleteLikePromises);

        await deleteDoc(recipeRef);

        if (authorId) {
            await updateUserRecipeCount(authorId, false);

            setTimeout(() => {
                profileUpdateEmitter.emit();
            }, 100);
        }

        return true;
    } catch (error) {
        throw error;
    }
};

export const isRecipeOwner = (recipe, userId) => {
    return recipe && recipe.authorId === userId;
};

export const getUserRecipes = async (userId) => {
    try {
        const recipesCollection = collection(db, 'recipes');
        const userRecipesQuery = query(
            recipesCollection,
            where('authorId', '==', userId)
        );

        const snapshot = await getDocs(userRecipesQuery);
        const recipes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return recipes;
    } catch (error) {
        throw error;
    }
};

export const toggleRecipeLike = async (recipeId, userId) => {
    try {
        const likeDocRef = doc(db, 'recipes', recipeId, 'likes', userId);
        const likeDoc = await getDoc(likeDocRef);

        if (likeDoc.exists()) {

            await deleteDoc(likeDocRef);
            return false;
        } else {

            await setDoc(likeDocRef, {
                userId,
                timestamp: serverTimestamp()
            });

            try {
                const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
                if (recipeDoc.exists()) {
                    const recipeData = recipeDoc.data();
                    const recipeOwnerId = recipeData.authorId;

                    if (recipeOwnerId && recipeOwnerId !== userId) {

                        const userDoc = await getDoc(doc(db, 'users', userId));
                        const userData = userDoc.exists() ? userDoc.data() : {};
                        const userName = userData.username || userData.email?.split('@')[0] || 'Someone';

                        await notifyRecipeLike(recipeId, recipeData.title, userName, recipeOwnerId);
                    }
                }
            } catch (notificationError) {

            }

            return true;
        }
    } catch (error) {
        throw error;
    }
};

export const rateRecipe = async (recipeId, userId, rating) => {
    try {
        const ratingDocRef = doc(db, 'recipes', recipeId, 'ratings', userId);
        await setDoc(ratingDocRef, {
            userId,
            rating,
            timestamp: serverTimestamp()
        });

        await updateRecipeAverageRating(recipeId);

        return true;
    } catch (error) {
        throw error;
    }
};

export const getUserRating = async (recipeId, userId) => {
    try {
        const ratingDocRef = doc(db, 'recipes', recipeId, 'ratings', userId);
        const ratingDoc = await getDoc(ratingDocRef);

        if (ratingDoc.exists()) {
            return ratingDoc.data().rating;
        }
        return 0;
    } catch (error) {
        return 0;
    }
};

const updateRecipeAverageRating = async (recipeId) => {
    try {
        const ratingsCollection = collection(db, 'recipes', recipeId, 'ratings');
        const ratingsSnapshot = await getDocs(ratingsCollection);

        if (ratingsSnapshot.size === 0) {

            const recipeRef = doc(db, 'recipes', recipeId);
            await updateDoc(recipeRef, {
                rating: 0,
                reviews: 0
            });
            return;
        }

        let totalRating = 0;
        ratingsSnapshot.docs.forEach(doc => {
            totalRating += doc.data().rating;
        });

        const averageRating = totalRating / ratingsSnapshot.size;
        const roundedRating = Math.round(averageRating * 10) / 10;

        const recipeRef = doc(db, 'recipes', recipeId);
        await updateDoc(recipeRef, {
            rating: roundedRating,
            reviews: ratingsSnapshot.size
        });
    } catch (error) {

    }
};

export const getRecipeLikesCount = async (recipeId) => {
  try {
    const likesCollection = collection(db, 'recipes', recipeId, 'likes');
    const likesSnapshot = await getDocs(likesCollection);
    return likesSnapshot.size;
  } catch (error) {
    return 0;
  }
};

export const getRecipeCommentsCount = async (recipeId) => {
  try {
    const commentsCollection = collection(db, 'recipes', recipeId, 'comments');
    const commentsSnapshot = await getDocs(commentsCollection);
    return commentsSnapshot.size;
  } catch (error) {
    return 0;
  }
};
