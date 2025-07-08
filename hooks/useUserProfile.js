// Use User Profile Hook - Hook für Benutzerprofilverwaltung und Rezept-Synchronisation
import {useEffect, useState} from 'react';
import {auth} from '../lib/firebaseconfig';
import {getUserProfile, getUserRecipes} from '../services/userService';
import {onAuthStateChanged} from 'firebase/auth';
import {profileUpdateEmitter} from '../utils/profileUpdateEmitter';

export const useUserProfile = () => {
    const [profile, setProfile] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const loadUserData = async (user) => {
        try {
            setIsLoading(true);
            setError(null);
            const userProfile = await getUserProfile(user.uid);
            if (userProfile) {
                setProfile(userProfile);
            } else {
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
            }
            try {
                const userRecipes = await getUserRecipes(user.uid, user.uid);
                setRecipes(userRecipes);
            } catch (recipeError) {
                setRecipes([]);
            }
        } catch (err) {
            setError(err);
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
    useEffect(() => {
        const unsubscribe = profileUpdateEmitter.subscribe(async () => {
            const user = auth.currentUser;
            if (user && !isLoading) {
                try {
                    setIsLoading(true);
                    const userProfile = await getUserProfile(user.uid);
                    if (userProfile) {
                        setProfile(userProfile);
                    }
                    const userRecipes = await getUserRecipes(user.uid, user.uid);
                    setRecipes(userRecipes);
                } catch (error) {
                } finally {
                    setIsLoading(false);
                }
            }
        });
        return unsubscribe;
    }, [isLoading]);
    const refreshProfile = async () => {
        const user = auth.currentUser;
        if (user) {
            await loadUserData(user);
        }
    };
    return {profile, recipes, isLoading, error, refreshProfile};
};
