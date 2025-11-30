import { Platform } from "react-native";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBwXGUJy4l01-aoyQ-7ggGAk1X2sKSSzbo",
  authDomain: "m355-to-do-app.firebaseapp.com",
  databaseURL: "https://m355-to-do-app-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "m355-to-do-app",
  storageBucket: "m355-to-do-app.firebasestorage.app",
  messagingSenderId: "1029399667592",
  appId: "1:1029399667592:web:52905ca2bf1c9f5f7b903d"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;
if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };
export const db = getFirestore(app);
