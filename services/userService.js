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
    if (!userId) {
      throw new Error('User ID required');
    }
    
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Prüfen ob username existiert und nicht der E-Mail-Teil ist
      let username = userData.username;
      
      // Falls username fehlt oder gleich dem E-Mail-Teil ist, versuche displayName zu verwenden
      if (!username || (userData.email && username === userData.email.split('@')[0])) {
        // Versuche displayName aus Firebase Auth zu holen
        try {
          const { auth } = await import('../lib/firebaseconfig');
          const currentUser = auth.currentUser;
          
          if (currentUser && currentUser.uid === userId && currentUser.displayName) {
            username = currentUser.displayName;
            
            // Update username in Firestore für zukünftige Verwendung
            try {
              await updateDoc(doc(db, 'users', userId), {
                username: currentUser.displayName,
                displayName: currentUser.displayName,
                updatedAt: serverTimestamp(),
              });
            } catch (updateError) {
              // Update error handled silently
            }
          }
        } catch (authError) {
          // Auth error handled silently
        }
      }
      
      return {
        ...userData,
        username: username || userData.email?.split('@')[0] || 'Unknown User'
      };
    }
    
    return null;
  } catch (error) {
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

    // Username verwenden oder aus E-Mail extrahieren als Fallback
    const displayUsername = username || email.split('@')[0];

    // Create new profile with default values
    const defaultProfile = {
      uid: userId,
      email: email,
      username: displayUsername,
      displayName: displayUsername, // Zusätzlich hier speichern
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
    throw error;
  }
};

// Sync user recipe count with actual recipes in database
export const syncUserRecipeCount = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Get actual count of recipes from database
    const recipesQuery = query(
      collection(db, 'recipes'),
      where('authorId', '==', userId)
    );
    
    const querySnapshot = await getDocs(recipesQuery);
    const actualCount = querySnapshot.size;
    
    // Update user profile with correct count
    await updateDoc(userRef, {
      recipeCount: actualCount,
      updatedAt: serverTimestamp(),
    });
    
    return actualCount;
  } catch (error) {
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
        const newFollowerCount = (targetUserData.followerCount || 0) + 1;
        await updateDoc(targetUserRef, {
          followerCount: newFollowerCount,
          updatedAt: serverTimestamp(),
        });
        
        return true;
      }
    }
    return false;
  } catch (error) {
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
        const newFollowerCount = Math.max(0, (targetUserData.followerCount || 0) - 1);
        await updateDoc(targetUserRef, {
          followerCount: newFollowerCount,
          updatedAt: serverTimestamp(),
        });
        
        return true;
      }
    }
    return false;
  } catch (error) {
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
    throw error;
  }
};

// Get recipes created by a specific user
export const getUserRecipes = async (userId, currentUserId = null) => {
  try {
    // Simple query without orderBy to avoid index issues
    const recipesQuery = query(
      collection(db, 'recipes'),
      where('authorId', '==', userId)
    );
    
    const querySnapshot = await getDocs(recipesQuery);
    
    // Fetch likes and ratings data for each recipe (same logic as in home.js)
    const recipesWithLikesAndStatus = await Promise.all(
      querySnapshot.docs.map(async (docSnapshot) => {
        const recipeData = { id: docSnapshot.id, ...docSnapshot.data() };

        // Get likes count and user like status
        const likesCollectionRef = collection(db, 'recipes', docSnapshot.id, 'likes');
        const likesSnapshot = await getDocs(likesCollectionRef);
        const likesCount = likesSnapshot.size;

        let isLikedByCurrentUser = false;
        if (currentUserId) {
          const userLikeDocRef = doc(db, 'recipes', docSnapshot.id, 'likes', currentUserId);
          const userLikeDoc = await getDoc(userLikeDocRef);
          isLikedByCurrentUser = userLikeDoc.exists();
        }

        // Get ratings count and average
        const ratingsCollectionRef = collection(db, 'recipes', docSnapshot.id, 'ratings');
        const ratingsSnapshot = await getDocs(ratingsCollectionRef);
        const reviewsCount = ratingsSnapshot.size;
        
        let averageRating = recipeData.rating || 0;
        if (reviewsCount > 0 && !recipeData.rating) {
          // Calculate average if not stored in recipe document
          let totalRating = 0;
          ratingsSnapshot.docs.forEach(doc => {
            totalRating += doc.data().rating;
          });
          averageRating = Math.round((totalRating / reviewsCount) * 10) / 10;
        }

        return { 
          ...recipeData, 
          likesCount, 
          isLikedByCurrentUser,
          rating: averageRating,
          reviews: reviewsCount,
          // Keep old 'likes' property for backward compatibility
          likes: likesCount
        };
      })
    );
    
    // Sort by createdAt in JavaScript instead
    recipesWithLikesAndStatus.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.seconds - a.createdAt.seconds;
      }
      return 0;
    });
    
    return recipesWithLikesAndStatus;
  } catch (error) {
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
    throw error;
  }
};

// Get users that the current user is following
export const getFollowingUsers = async (userId) => {
  try {
    const userProfile = await getUserProfile(userId);
    if (!userProfile || !userProfile.following || userProfile.following.length === 0) {
      return [];
    }

    // Get profiles of all following users
    const followingProfiles = await Promise.all(
      userProfile.following.map(async (followingId) => {
        const profile = await getUserProfile(followingId);
        return profile ? { ...profile, id: followingId } : null;
      })
    );

    return followingProfiles.filter(profile => profile !== null);
  } catch (error) {
    throw error;
  }
};

// Get users who are following the current user
export const getFollowers = async (userId) => {
  try {
    const followersQuery = query(
      collection(db, 'users'),
      where('following', 'array-contains', userId)
    );
    
    const querySnapshot = await getDocs(followersQuery);
    const followers = [];
    
    querySnapshot.forEach((doc) => {
      followers.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return followers;
  } catch (error) {
    throw error;
  }
};

// Check if current user is following target user
export const isFollowing = async (currentUserId, targetUserId) => {
  try {
    const currentUserProfile = await getUserProfile(currentUserId);
    if (!currentUserProfile || !currentUserProfile.following) {
      return false;
    }
    return currentUserProfile.following.includes(targetUserId);
  } catch (error) {
    return false;
  }
};

// Get suggested users to follow (intelligent recommendations)
export const getSuggestedUsers = async (currentUserId, limit = 10) => {
  try {
    const currentUserProfile = await getUserProfile(currentUserId);
    const following = currentUserProfile?.following || [];
    
    // Get all users except current user and already following
    // Simple query without orderBy to avoid index issues
    const usersQuery = query(collection(db, 'users'));
    
    const querySnapshot = await getDocs(usersQuery);
    const allUsers = [];
    
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      if (doc.id !== currentUserId && !following.includes(doc.id)) {
        allUsers.push({
          id: doc.id,
          ...userData
        });
      }
    });

    // Sort by intelligent criteria: recipe count, follower count, recent activity
    const suggestedUsers = allUsers
      .sort((a, b) => {
        const scoreA = (a.recipeCount || 0) * 2 + (a.followerCount || 0);
        const scoreB = (b.recipeCount || 0) * 2 + (b.followerCount || 0);
        return scoreB - scoreA;
      })
      .slice(0, limit);

    return suggestedUsers;
  } catch (error) {
    return [];
  }
};

// Get user activity feed from followed users
export const getFollowingFeed = async (userId) => {
  try {
    const followingUsers = await getFollowingUsers(userId);
    const followingIds = followingUsers.map(user => user.id);
    
    if (followingIds.length === 0) {
      return [];
    }

    // Get recent recipes from followed users
    // Simple query without orderBy to avoid index issues
    const recipesQuery = query(
      collection(db, 'recipes'),
      where('authorId', 'in', followingIds)
    );
    
    const querySnapshot = await getDocs(recipesQuery);
    const feedRecipes = [];
    
    querySnapshot.forEach((doc) => {
      feedRecipes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by createdAt in JavaScript instead
    feedRecipes.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.seconds - a.createdAt.seconds;
      }
      return 0;
    });
    
    return feedRecipes;
  } catch (error) {
    return [];
  }
};

// Search users by username or email
export const searchUsers = async (searchTerm, limit = 20) => {
  try {
    if (!searchTerm.trim()) {
      return [];
    }

    const usersQuery = query(collection(db, 'users'));
    const querySnapshot = await getDocs(usersQuery);
    const users = [];
    
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      const searchLower = searchTerm.toLowerCase();
      
      if (
        userData.username?.toLowerCase().includes(searchLower) ||
        userData.email?.toLowerCase().includes(searchLower)
      ) {
        users.push({
          id: doc.id,
          ...userData
        });
      }
    });
    
    return users.slice(0, limit);
  } catch (error) {
    return [];
  }
};

// Shopping list functions
export const getShoppingList = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      const shoppingList = data.shoppingList || [];
      return shoppingList;
    }
    return [];
  } catch (error) {
    throw error;
  }
};

export const updateShoppingList = async (userId, shoppingList) => {
  try {
    // Ensure we have valid data
    if (!userId) {
      const error = new Error('Invalid userId');
      throw error;
    }

    // Ensure shoppingList is always an array and filter out invalid items
    const safeShoppingList = Array.isArray(shoppingList) ? 
      shoppingList.filter(item => item && item.text && item.id) : [];

    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      shoppingList: safeShoppingList,
      updatedAt: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    throw error;
  }
};

export const addShoppingListItem = async (userId, item) => {
  try {
    // Ensure we have valid input
    if (!userId || !item || (!item.text && typeof item !== 'string')) {
      const error = new Error('Invalid input: userId and item with text are required');
      throw error;
    }

    const currentList = await getShoppingList(userId);
    
    // Handle both string and object input for backward compatibility
    const itemText = typeof item === 'string' ? item : item.text;
    
    const newItem = {
      id: Date.now().toString(),
      text: itemText,
      completed: false,
      addedAt: new Date().toISOString(),
    };
    
    // Ensure currentList is always an array
    const safeCurrentList = Array.isArray(currentList) ? currentList : [];
    const updatedList = [...safeCurrentList, newItem];
    
    await updateShoppingList(userId, updatedList);
    
    return newItem;
  } catch (error) {
    throw error;
  }
};

export const toggleShoppingListItem = async (userId, itemId) => {
  try {
    if (!userId || !itemId) {
      throw new Error('Invalid userId or itemId');
    }

    const currentList = await getShoppingList(userId);
    const safeCurrentList = Array.isArray(currentList) ? currentList : [];
    
    const updatedList = safeCurrentList.map(item => 
      item && item.id === itemId ? { ...item, completed: !item.completed } : item
    ).filter(item => item); // Remove any invalid items
    
    await updateShoppingList(userId, updatedList);
    return updatedList;
  } catch (error) {
    throw error;
  }
};

export const removeShoppingListItem = async (userId, itemId) => {
  try {
    if (!userId || !itemId) {
      throw new Error('Invalid userId or itemId');
    }

    const currentList = await getShoppingList(userId);
    const safeCurrentList = Array.isArray(currentList) ? currentList : [];
    
    const updatedList = safeCurrentList.filter(item => item && item.id !== itemId);
    await updateShoppingList(userId, updatedList);
    return updatedList;
  } catch (error) {
    throw error;
  }
};
