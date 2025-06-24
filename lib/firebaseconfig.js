// Import the functions you need from the SDKs you need
import AsyncStorage from "@react-native-async-storage/async-storage"
import { initializeApp, getApps } from "firebase/app"
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage";
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
// Diese Funktion überprüft, ob bereits eine Firebase-App initialisiert wurde. 
// Falls nicht, wird eine neue Firebase - App mit den Konfigurationsdaten aus firebaseConfig initialisiert.

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
export const database = initializeFirestore()
export const storage = initializeStorage()
