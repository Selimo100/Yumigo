import { auth } from '../lib/firebaseconfig';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signOut
} from 'firebase/auth';
import { initializeUserProfile } from './userService';

export const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const register = async (email, password, username = null) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore after successful registration
    try {
        await initializeUserProfile(userCredential.user.uid, email, username);
    } catch (error) {
        console.error('Error creating user profile:', error);
        // Registration was successful, but profile creation failed
        // You might want to handle this differently based on your needs
    }
    
    return userCredential.user;
};

export const sendVerificationEmail = async () => {
    if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
    }
};

export const logout = async () => {
    await signOut(auth);
};
