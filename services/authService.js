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
    console.log('Starting registration process for:', email);
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User created successfully:', userCredential.user.uid);
        
        // Send verification email immediately after registration
        try {
            console.log('Sending verification email to newly registered user:', userCredential.user.email);
            console.log('Current auth.currentUser:', auth.currentUser?.email);
            
            // Small delay to ensure user is properly authenticated
            await new Promise(resolve => setTimeout(resolve, 100));
            
            await sendEmailVerification(userCredential.user);
            console.log('Verification email sent successfully');
        } catch (emailError) {
            console.error('Error sending verification email during registration:', emailError);
            console.error('Error code:', emailError.code);
            console.error('Error message:', emailError.message);
            // Don't throw here, registration was successful
        }
        
        // Create user profile in Firestore after successful registration
        try {
            await initializeUserProfile(userCredential.user.uid, email, username);
            console.log('User profile created successfully');
        } catch (error) {
            console.error('Error creating user profile:', error);
            // Registration was successful, but profile creation failed
            // You might want to handle this differently based on your needs
        }
        
        return userCredential.user;
    } catch (registrationError) {
        console.error('Registration failed:', registrationError);
        throw registrationError;
    }
};

export const sendVerificationEmail = async () => {
    if (auth.currentUser) {
        try {
            console.log('Attempting to send verification email to:', auth.currentUser.email);
            console.log('User emailVerified status:', auth.currentUser.emailVerified);
            
            await sendEmailVerification(auth.currentUser);
            console.log('Verification email sent successfully to:', auth.currentUser.email);
            
            return true;
        } catch (error) {
            console.error('Error sending verification email:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            throw new Error('Fehler beim Senden der Bestätigungs-E-Mail: ' + error.message);
        }
    } else {
        console.error('No current user found when trying to send verification email');
        throw new Error('Kein Benutzer angemeldet');
    }
};

export const checkEmailVerification = async () => {
    if (auth.currentUser) {
        await auth.currentUser.reload();
        return auth.currentUser.emailVerified;
    }
    return false;
};

export const logout = async () => {
    await signOut(auth);
};
