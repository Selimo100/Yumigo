// firebaseconfig.js
import AsyncStorage from "@react-native-async-storage/async-storage"
import { initializeApp, getApps } from "firebase/app"
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth"
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp,
  doc, // <-- Importiere 'doc'
  getDoc // <-- Importiere 'getDoc'
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA_UO__PZeb160VIfqJvDzMp-LZuQ_neeo",
  authDomain: "yumigo-cef4b.firebaseapp.com",
  projectId: "yumigo-cef4b",
  storageBucket: "yumigo-cef4b.firebasestorage.app",
  messagingSenderId: "97250821647",
  appId: "1:97250821647:web:ab0a62fe67547660f3057a",
  measurementId: "G-0MFPM2RWR3"
};

const config = {}

const initialize = () => {
  if (!getApps().length) {
    try {
      config.app = initializeApp(firebaseConfig)
      config.auth = initializeAuth(config.app, {
        persistence: getReactNativePersistence(AsyncStorage),
      })
    } catch (error) {
    }
  } else {
    config.app = getApps()[0]
    config.auth = getAuth(config.app)
  }
}

export const uploadImage = async (uri, fileName) => {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const imageRef = ref(storage, `recipes/${fileName}`);
        await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(imageRef);
        return downloadURL;
    } catch (error) {
        throw error;
    }
};

export const saveRecipe = async (recipeData) => {
    try {
        const currentUser = getAuth().currentUser;

        if (!currentUser) {
            throw new Error("Kein authentifizierter Benutzer gefunden. Rezept kann nicht gespeichert werden.");
        }


        let authorName = 'Unbekannt'; // Standard-Fallback

        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                // Priorität: username aus Firestore > displayName > email
                authorName = userData.username || userData.displayName || currentUser.displayName || currentUser.email || 'Unbekannt';
            } else {
                authorName = currentUser.displayName || currentUser.email || 'Unbekannt';
            }
        } catch (fetchError) {
            authorName = currentUser.displayName || currentUser.email || 'Unbekannt';
        }


        const docRef = await addDoc(collection(db, 'recipes'), {
            ...recipeData,
            authorId: currentUser.uid,
            authorName: authorName, // Now uses username from Firestore
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        
        // Update user's recipe count
        try {
            const { updateUserRecipeCount } = await import('../services/userService');
            await updateUserRecipeCount(currentUser.uid, true);
            
            // Emit profile update to refresh UI (with small delay to prevent flicker)
            setTimeout(async () => {
                const { profileUpdateEmitter } = await import('../utils/profileUpdateEmitter');
                profileUpdateEmitter.emit();
            }, 100);
        } catch (countError) {
            // Don't throw error here, recipe was saved successfully
        }
        
        return docRef.id;
    } catch (error) {
        throw error;
    }
};

const initializeAuthentication = () => {
  initialize()
  return config.auth
}

const initializeFirestore = () => {
  initialize()
  return getFirestore(config.app)
}

const initializeStorage = () => {
  initialize()
  return getStorage(config.app)
}

export const auth = initializeAuthentication()
export const db = initializeFirestore();
export const storage = initializeStorage();