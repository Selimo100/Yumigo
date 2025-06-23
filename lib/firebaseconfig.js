// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_UO__PZeb160VIfqJvDzMp-LZuQ_neeo",
  authDomain: "yumigo-cef4b.firebaseapp.com",
  projectId: "yumigo-cef4b",
  storageBucket: "yumigo-cef4b.firebasestorage.app",
  messagingSenderId: "97250821647",
  appId: "1:97250821647:web:ab0a62fe67547660f3057a",
  measurementId: "G-0MFPM2RWR3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving recipe:', error);
    throw error;
  }
};