import {auth} from '../lib/firebaseconfig';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signOut,
    updateProfile
} from 'firebase/auth';
import {initializeUserProfile} from './userService';

export const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    if (!userCredential.user.displayName) {
        try {
            const {getDoc, doc} = await import('firebase/firestore');
            const {db} = await import('../lib/firebaseconfig');

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

        if (username) {
            try {
                await updateProfile(userCredential.user, {
                    displayName: username
                });
            } catch (error) {
            }
        }

        try {

            await new Promise(resolve => setTimeout(resolve, 100));

            await sendEmailVerification(userCredential.user);
        } catch (emailError) {

        }

        try {
            await initializeUserProfile(userCredential.user.uid, email, username);
        } catch (error) {

        }

        return userCredential.user;
    } catch (registrationError) {
        throw registrationError;
    }
};

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