// Import the functions you need from the SDKs you need
import AsyncStorage from "@react-native-async-storage/async-storage"
import { initializeApp, getApps } from "firebase/app"
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth"
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
        const docRef = await addDoc(collection(db, 'recipes'), {
            ...recipeData,
            authorId: 'test_user',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error saving recipe:', error);
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
export const db = getFirestore(app);
export const storage = getStorage(app);