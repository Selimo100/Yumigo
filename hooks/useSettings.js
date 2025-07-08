import {useState, useEffect} from 'react';
import {auth} from '../lib/firebaseconfig';
import {getUserProfile, updateUserProfile} from '../services/userService';

export const useSettings = () => {
    const [profile, setProfile] = useState({
        username: '',
        bio: '',
        email: '',
        avatar: null,
    });
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        loadSettings();
    }, []);
    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const currentUser = auth.currentUser;
            if (currentUser) {
                try {
                    const userProfile = await getUserProfile(currentUser.uid);
                    if (userProfile) {
                        setProfile({
                            username: userProfile.username || '',
                            bio: userProfile.bio || '',
                            email: userProfile.email || currentUser.email || '',
                            avatar: userProfile.avatar || null,
                        });
                    } else {
                        setProfile({
                            username: currentUser.email?.split('@')[0] || '',
                            bio: 'Food enthusiast | Making cooking simple',
                            email: currentUser.email || '',
                            avatar: null,
                        });
                    }
                } catch (error) {
                    setProfile({
                        username: currentUser.email?.split('@')[0] || '',
                        bio: 'Food enthusiast | Making cooking simple',
                        email: currentUser.email || '',
                        avatar: null,
                    });
                }
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };
    const updateProfile = (updates) => {
        const newProfile = {...profile, ...updates};
        setProfile(newProfile);
    };
    const saveAllSettings = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('No authenticated user found');
            }
            await updateUserProfile(currentUser.uid, {
                username: profile.username,
                bio: profile.bio,
                email: profile.email,
                avatar: profile.avatar,
            });
            await loadSettings();
            return true;
        } catch (error) {
            return false;
        }
    };
    return {
        profile,
        isLoading,
        updateProfile,
        saveAllSettings,
    };
};
