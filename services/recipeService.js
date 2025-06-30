import { 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  collection,
  getDocs,
  serverTimestamp,
  addDoc,
  setDoc,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebaseconfig';
import { updateUserRecipeCount } from './userService';
import { createLikeNotification } from './notificationService';

// Get a specific recipe by ID
export const getRecipe = async (recipeId) => {
  try {
    const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
    if (recipeDoc.exists()) {
      return { id: recipeDoc.id, ...recipeDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    throw error;
  }
};

// Update an existing recipe
export const updateRecipe = async (recipeId, recipeData, imageUri = null) => {
  try {
    let imageUrl = recipeData.imageUrl;

    // If a new image is provided, upload it
    if (imageUri && imageUri !== recipeData.imageUrl) {
      try {
        // Delete old image if it exists and is different
        if (recipeData.imageUrl) {
          const oldImageRef = ref(storage, recipeData.imageUrl);
          await deleteObject(oldImageRef).catch(console.warn);
        }

        // Upload new image
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const imageRef = ref(storage, `recipes/${recipeId}_${Date.now()}`);
        const snapshot = await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(snapshot.ref);
      } catch (imageError) {
        console.warn('Error handling image update:', imageError);
        // Continue with the update even if image handling fails
      }
    }

    const updatedData = {
      ...recipeData,
      imageUrl,
      updatedAt: serverTimestamp(),
    };

    const recipeRef = doc(db, 'recipes', recipeId);
    await updateDoc(recipeRef, updatedData);
    
    return { id: recipeId, ...updatedData };
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
};

// Delete a recipe and all its associated data
export const deleteRecipe = async (recipeId, authorId) => {
  try {
    const recipeRef = doc(db, 'recipes', recipeId);
    const recipeDoc = await getDoc(recipeRef);
    
    if (!recipeDoc.exists()) {
      throw new Error('Recipe not found');
    }

    const recipeData = recipeDoc.data();

    // Delete the recipe image from storage
    if (recipeData.imageUrl) {
      try {
        const imageRef = ref(storage, recipeData.imageUrl);
        await deleteObject(imageRef);
      } catch (imageError) {
        console.warn('Error deleting recipe image:', imageError);
      }
    }

    // Delete all comments associated with the recipe
    const commentsCollection = collection(db, 'recipes', recipeId, 'comments');
    const commentsSnapshot = await getDocs(commentsCollection);
    
    const deleteCommentPromises = commentsSnapshot.docs.map(async (commentDoc) => {
      // Delete comment likes
      const likesCollection = collection(db, 'recipes', recipeId, 'comments', commentDoc.id, 'likes');
      const likesSnapshot = await getDocs(likesCollection);
      const deleteLikePromises = likesSnapshot.docs.map(likeDoc => deleteDoc(likeDoc.ref));
      await Promise.all(deleteLikePromises);
      
      // Delete the comment itself
      await deleteDoc(commentDoc.ref);
    });
    
    await Promise.all(deleteCommentPromises);

    // Delete all likes associated with the recipe
    const likesCollection = collection(db, 'recipes', recipeId, 'likes');
    const likesSnapshot = await getDocs(likesCollection);
    const deleteLikePromises = likesSnapshot.docs.map(likeDoc => deleteDoc(likeDoc.ref));
    await Promise.all(deleteLikePromises);

    // Delete the recipe document
    await deleteDoc(recipeRef);

    // Update user's recipe count
    if (authorId) {
      await updateUserRecipeCount(authorId, false);
    }

    return true;
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};

// Check if user is the owner of a recipe
export const isRecipeOwner = (recipe, userId) => {
  return recipe && recipe.authorId === userId;
};

// Get all recipes by a specific user
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
    console.error('Error fetching user recipes:', error);
    throw error;
  }
};

// Like/Unlike a recipe
export const toggleRecipeLike = async (recipeId, userId) => {
  try {
    const likeDocRef = doc(db, 'recipes', recipeId, 'likes', userId);
    const likeDoc = await getDoc(likeDocRef);
    
    if (likeDoc.exists()) {
      // Unlike - remove the like document
      await deleteDoc(likeDocRef);
      return false; // Not liked anymore
    } else {
      // Like - create the like document
      await setDoc(likeDocRef, {
        userId,
        timestamp: serverTimestamp()
      });
      
      // Create notification for the recipe owner
      try {
        const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
        if (recipeDoc.exists()) {
          const recipeData = recipeDoc.data();
          const recipeOwnerId = recipeData.authorId;
          
          if (recipeOwnerId && recipeOwnerId !== userId) {
            await createLikeNotification(recipeId, userId, recipeOwnerId);
          }
        }
      } catch (notificationError) {
        console.error('Error creating like notification:', notificationError);
        // Don't throw here to avoid breaking the like functionality
      }
      
      return true; // Now liked
    }
  } catch (error) {
    console.error('Error toggling recipe like:', error);
    throw error;
  }
};

// Rate a recipe
export const rateRecipe = async (recipeId, userId, rating) => {
  try {
    const ratingDocRef = doc(db, 'recipes', recipeId, 'ratings', userId);
    await setDoc(ratingDocRef, {
      userId,
      rating,
      timestamp: serverTimestamp()
    });
    
    // Update the recipe's average rating
    await updateRecipeAverageRating(recipeId);
    
    return true;
  } catch (error) {
    console.error('Error rating recipe:', error);
    throw error;
  }
};

// Get user's rating for a recipe
export const getUserRating = async (recipeId, userId) => {
  try {
    const ratingDocRef = doc(db, 'recipes', recipeId, 'ratings', userId);
    const ratingDoc = await getDoc(ratingDocRef);
    
    if (ratingDoc.exists()) {
      return ratingDoc.data().rating;
    }
    return 0;
  } catch (error) {
    console.error('Error getting user rating:', error);
    return 0;
  }
};

// Update recipe's average rating
const updateRecipeAverageRating = async (recipeId) => {
  try {
    const ratingsCollection = collection(db, 'recipes', recipeId, 'ratings');
    const ratingsSnapshot = await getDocs(ratingsCollection);
    
    if (ratingsSnapshot.size === 0) {
      // No ratings yet
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
    const roundedRating = Math.round(averageRating * 10) / 10; // Round to 1 decimal place
    
    const recipeRef = doc(db, 'recipes', recipeId);
    await updateDoc(recipeRef, {
      rating: roundedRating,
      reviews: ratingsSnapshot.size
    });
  } catch (error) {
    console.error('Error updating recipe average rating:', error);
  }
};
