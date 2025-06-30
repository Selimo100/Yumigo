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
      console.log("Error initializing app: " + error)
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
        console.error('Error uploading image:', error);
        throw error;
    }
};

export const saveRecipe = async (recipeData) => {
    try {
        const currentUser = getAuth().currentUser;

        if (!currentUser) {
            console.error("[saveRecipe ERROR] Kein authentifizierter Benutzer gefunden.");
            throw new Error("Kein authentifizierter Benutzer gefunden. Rezept kann nicht gespeichert werden.");
        }

        console.log(`[saveRecipe DEBUG] Aktueller Benutzer UID: ${currentUser.uid}`);
        console.log(`[saveRecipe DEBUG] currentUser.displayName (von Auth): ${currentUser.displayName}`);
        console.log(`[saveRecipe DEBUG] currentUser.email (von Auth): ${currentUser.email}`);

        let authorName = 'Unbekannt'; // Standard-Fallback

        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                console.log(`[saveRecipe DEBUG] Benutzerdokumentdaten gefunden:`, userData);
                // Use username from Firestore user profile
                authorName = userData.username || currentUser.displayName || currentUser.email || 'Unbekannt';
                console.log(`[saveRecipe DEBUG] AuthorName ermittelt (aus Firestore-Daten/Fallback): ${authorName}`);
            } else {
                console.warn(`[saveRecipe WARNING] Benutzerdokument für UID ${currentUser.uid} nicht in 'users'-Collection gefunden.`);
                authorName = currentUser.displayName || currentUser.email || 'Unbekannt';
            }
        } catch (fetchError) {
            console.error('[saveRecipe ERROR] Fehler beim Abrufen des Benutzernamens aus der Users-Collection:', fetchError);
            authorName = currentUser.displayName || currentUser.email || 'Unbekannt';
        }

        console.log(`[saveRecipe DEBUG] Endgültiger AuthorName vor dem Speichern: ${authorName}`);

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
        } catch (countError) {
            console.error('Error updating user recipe count:', countError);
            // Don't throw error here, recipe was saved successfully
        }
        
        console.log(`[saveRecipe DEBUG] Rezept erfolgreich gespeichert mit ID: ${docRef.id}`);
        return docRef.id;
    } catch (error) {
        console.error('Fehler beim Speichern des Rezepts:', error);
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