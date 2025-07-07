import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebaseconfig';
import useAuth from '../lib/useAuth';
const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  useEffect(() => {
    if (!user?.uid) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const favoritesCollectionRef = collection(db, 'users', user.uid, 'favorites');
    const favoritesQuery = query(favoritesCollectionRef, orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(
      favoritesQuery, 
      async (snapshot) => {
        try {
          const favoriteRecipes = await Promise.all(
            snapshot.docs.map(async (favoriteDoc) => {
              const favoriteData = favoriteDoc.data();
              const recipeRef = doc(db, 'recipes', favoriteDoc.id);
              const recipeSnap = await getDoc(recipeRef);
              if (recipeSnap.exists()) {
                const recipeData = {
                  id: recipeSnap.id,
                  ...recipeSnap.data(),
                  favoritedAt: favoriteData.timestamp
                };
                return recipeData;
              } else {
                return null;
              }
            })
          );
          const validFavorites = favoriteRecipes.filter(recipe => recipe !== null);
          setFavorites(validFavorites);
        } catch (error) {
          if (error.code === 'permission-denied') {
            setFavorites([]);
          }
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        if (error.code === 'permission-denied') {
          setFavorites([]);
        }
        setIsLoading(false);
      }
    );
    return unsubscribe;
  }, [user?.uid]);
  const addFavorite = async (recipeId) => {
    if (!user?.uid) {
      throw new Error('User must be logged in to add favorites');
    }
    try {
      const favoriteDocRef = doc(db, 'users', user.uid, 'favorites', recipeId);
      await setDoc(favoriteDocRef, {
        timestamp: serverTimestamp()
      });
    } catch (error) {
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check Firestore security rules for favorites.');
      }
      throw error;
    }
  };
  const removeFavorite = async (recipeId) => {
    if (!user?.uid) {
      throw new Error('User must be logged in to remove favorites');
    }
    try {
      const favoriteDocRef = doc(db, 'users', user.uid, 'favorites', recipeId);
      await deleteDoc(favoriteDocRef);
    } catch (error) {
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check Firestore security rules for favorites.');
      }
      throw error;
    }
  };
  const isFavorite = useCallback((recipeId) => {
    return favorites.some(favorite => favorite.id === recipeId);
  }, [favorites]);
  const toggleFavorite = async (recipeId) => {
    if (isFavorite(recipeId)) {
      await removeFavorite(recipeId);
    } else {
      await addFavorite(recipeId);
    }
  };
  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
};
export default useFavorites;