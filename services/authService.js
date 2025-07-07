import { auth } from '../lib/firebaseconfig';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signOut,
    updateProfile
} from 'firebase/auth';
import { initializeUserProfile } from './userService';

export const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Prüfen ob displayName gesetzt ist, wenn nicht aus Firestore laden
    if (!userCredential.user.displayName) {
        try {
            const { getDoc, doc } = await import('firebase/firestore');
            const { db } = await import('../lib/firebaseconfig');
            
            const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.username) {
                    await updateProfile(userCredential.user, {
                        displayName: userData.username
                    });
                }
            }
        } catch (error) {
        }
    }
    
    return userCredential.user;
};

export const register = async (email, password, username = null) => {
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Username als displayName in Firebase Auth setzen
        if (username) {
            try {
                await updateProfile(userCredential.user, {
                    displayName: username
                });
            } catch (error) {
            }
        }
        
        // Send verification email immediately after registration
        try {
            
            // Small delay to ensure user is properly authenticated
            await new Promise(resolve => setTimeout(resolve, 100));
            
            await sendEmailVerification(userCredential.user);
        } catch (emailError) {
            // Don't throw here, registration was successful
        }
        
        // Create user profile in Firestore after successful registration
        try {
            await initializeUserProfile(userCredential.user.uid, email, username);
        } catch (error) {
            // Registration was successful, but profile creation failed
            // You might want to handle this differently based on your needs
        }
        
        return userCredential.user;
    } catch (registrationError) {
        throw registrationError;
    }
};

// export const sendVerificationEmail = async () => {
//     if (auth.currentUser) {
//         try {
//
//             await sendEmailVerification(auth.currentUser);
//
//             return true;
//         } catch (error) {
//             throw new Error('Fehler beim Senden der Bestätigungs-E-Mail: ' + error.message);
//         }
//     } else {
//         throw new Error('Kein Benutzer angemeldet');
//     }
// };

export const sendVerificationEmail = async (user = null) => {
    const currentUser = user || auth.currentUser;
    if (currentUser) {
        try {
            await sendEmailVerification(currentUser);
            return true;
        } catch (error) {
            throw new Error('Fehler beim Senden der Bestätigungs-E-Mail: ' + error.message);
        }
    } else {
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