import { useState, useEffect } from 'react';
import { auth } from '../lib/firebaseconfig';
import { getUserProfile, getUserRecipes } from '../services/userService';
import { onAuthStateChanged } from 'firebase/auth';

export const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadUserData = async (user) => {
    try {
      console.log('[useUserProfile] Loading data for user:', user.uid);
      setIsLoading(true);
      setError(null);
      
      // Load user profile
      const userProfile = await getUserProfile(user.uid);
      if (userProfile) {
        console.log('[useUserProfile] Profile loaded:', userProfile.username, userProfile.bio);
        setProfile(userProfile);
      } else {
        // Fallback to auth user data if no profile found
        const fallbackProfile = {
          uid: user.uid,
          email: user.email,
          username: user.email?.split('@')[0] || 'User',
          bio: 'Food enthusiast | Making cooking simple',
          avatar: null,
          followerCount: 0,
          followingCount: 0,
          recipeCount: 0,
        };
        setProfile(fallbackProfile);
      }      // Load user recipes
      try {
        const userRecipes = await getUserRecipes(user.uid);
        console.log('[useUserProfile] Recipes loaded:', userRecipes.length);
        setRecipes(userRecipes);
      } catch (recipeError) {
        console.error('Error loading user recipes:', recipeError);
        setRecipes([]);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(err);
      // Fallback profile
      setProfile({
        uid: user.uid,
        email: user.email,
        username: user.email?.split('@')[0] || 'User',
        bio: 'Food enthusiast | Making cooking simple',
        avatar: null,
        followerCount: 0,
        followingCount: 0,
        recipeCount: 0,
      });
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await loadUserData(user);
      } else {
        setProfile(null);
        setRecipes([]);
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);
  const refreshProfile = async () => {
    console.log('[useUserProfile] Manual refresh triggered');
    const user = auth.currentUser;
    if (user) {
      console.log('[useUserProfile] Reloading data for user:', user.uid);
      await loadUserData(user);
    } else {
      console.log('[useUserProfile] No current user found for refresh');
    }
  };

  return { profile, recipes, isLoading, error, refreshProfile };
};
