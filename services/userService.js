import { auth, db, storage } from '../lib/firebaseconfig';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Get user profile data from Firestore
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Create a new user profile in Firestore
export const createUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Update user profile in Firestore
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Get current user profile (using auth.currentUser)
export const getCurrentUserProfile = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }
    
    return await getUserProfile(currentUser.uid);
  } catch (error) {
    console.error('Error getting current user profile:', error);
    throw error;
  }
};

// Initialize user profile with default values
export const initializeUserProfile = async (userId, email, username = null) => {
  try {
    // Check if profile already exists
    const existingProfile = await getUserProfile(userId);
    if (existingProfile) {
      return existingProfile;
    }

    // Create new profile with default values
    const defaultProfile = {
      uid: userId,
      email: email,
      username: username || email.split('@')[0], // Use email prefix as default username
      bio: 'Food enthusiast | Making cooking simple',
      avatar: null,
      followerCount: 0,
      followingCount: 0,
      recipeCount: 0,
      following: [],
      savedRecipes: [],
    };

    await createUserProfile(userId, defaultProfile);
    return defaultProfile;
  } catch (error) {
    console.error('Error initializing user profile:', error);
    throw error;
  }
};

// Update user recipe count
export const updateUserRecipeCount = async (userId, increment = true) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentCount = userDoc.data().recipeCount || 0;
      const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);
      
      await updateDoc(userRef, {
        recipeCount: newCount,
        updatedAt: serverTimestamp(),
      });
      return newCount;
    }
    return 0;
  } catch (error) {
    console.error('Error updating recipe count:', error);
    throw error;
  }
};

// Follow/Unfollow user functionality
export const followUser = async (currentUserId, targetUserId) => {
  try {
    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);
    
    // Get current user data
    const currentUserDoc = await getDoc(currentUserRef);
    const targetUserDoc = await getDoc(targetUserRef);
    
    if (currentUserDoc.exists() && targetUserDoc.exists()) {
      const currentUserData = currentUserDoc.data();
      const targetUserData = targetUserDoc.data();
      
      const following = currentUserData.following || [];
      const isAlreadyFollowing = following.includes(targetUserId);
      
      if (!isAlreadyFollowing) {
        // Add to following list
        following.push(targetUserId);
        
        // Update current user
        await updateDoc(currentUserRef, {
          following: following,
          followingCount: following.length,
          updatedAt: serverTimestamp(),
        });
        
        // Update target user follower count
        await updateDoc(targetUserRef, {
          followerCount: (targetUserData.followerCount || 0) + 1,
          updatedAt: serverTimestamp(),
        });
        
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const unfollowUser = async (currentUserId, targetUserId) => {
  try {
    const currentUserRef = doc(db, 'users', currentUserId);
    const targetUserRef = doc(db, 'users', targetUserId);
    
    // Get current user data
    const currentUserDoc = await getDoc(currentUserRef);
    const targetUserDoc = await getDoc(targetUserRef);
    
    if (currentUserDoc.exists() && targetUserDoc.exists()) {
      const currentUserData = currentUserDoc.data();
      const targetUserData = targetUserDoc.data();
      
      const following = currentUserData.following || [];
      const followingIndex = following.indexOf(targetUserId);
      
      if (followingIndex > -1) {
        // Remove from following list
        following.splice(followingIndex, 1);
        
        // Update current user
        await updateDoc(currentUserRef, {
          following: following,
          followingCount: following.length,
          updatedAt: serverTimestamp(),
        });
        
        // Update target user follower count
        await updateDoc(targetUserRef, {
          followerCount: Math.max(0, (targetUserData.followerCount || 0) - 1),
          updatedAt: serverTimestamp(),
        });
        
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

// Upload profile image to Firebase Storage
export const uploadProfileImage = async (uri, userId) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = `profile_${userId}_${Date.now()}.jpg`;
    const imageRef = ref(storage, `profileImages/${fileName}`);
    
    await uploadBytes(imageRef, blob);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

// Get recipes created by a specific user
export const getUserRecipes = async (userId) => {
  try {
    // Simple query without orderBy to avoid index issues
    const recipesQuery = query(
      collection(db, 'recipes'),
      where('authorId', '==', userId)
    );
    
    const querySnapshot = await getDocs(recipesQuery);
    const recipes = [];
    
    querySnapshot.forEach((doc) => {
      recipes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by createdAt in JavaScript instead
    recipes.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.seconds - a.createdAt.seconds;
      }
      return 0;
    });
    
    return recipes;
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    throw error;
  }
};

// Get saved recipes for a user
export const getUserSavedRecipes = async (userId) => {
  try {
    const userProfile = await getUserProfile(userId);
    if (!userProfile || !userProfile.savedRecipes) {
      return [];
    }

    const { collection, query, where, getDocs } = await import('firebase/firestore');
    
    const recipesQuery = query(
      collection(db, 'recipes'),
      where('__name__', 'in', userProfile.savedRecipes)
    );
    
    const querySnapshot = await getDocs(recipesQuery);
    const savedRecipes = [];
    
    querySnapshot.forEach((doc) => {
      savedRecipes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return savedRecipes;
  } catch (error) {
    console.error('Error fetching saved recipes:', error);
    throw error;
  }
};

// Save/unsave a recipe for a user
export const toggleSaveRecipe = async (userId, recipeId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const savedRecipes = userData.savedRecipes || [];
      const recipeIndex = savedRecipes.indexOf(recipeId);
      
      if (recipeIndex > -1) {
        // Remove from saved recipes
        savedRecipes.splice(recipeIndex, 1);
      } else {
        // Add to saved recipes
        savedRecipes.push(recipeId);
      }
      
      await updateDoc(userRef, {
        savedRecipes: savedRecipes,
        updatedAt: serverTimestamp(),
      });
      
      return savedRecipes.includes(recipeId);
    }
    return false;
  } catch (error) {
    console.error('Error toggling save recipe:', error);
    throw error;
  }
};
