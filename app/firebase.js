import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { ReactNativeAsyncStorage } from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBt7UaeXZTcVEShN3jTu01fyErYKR-OU-A",
  authDomain: "agroai-c5d64.firebaseapp.com",
  projectId: "agroai-c5d64",
  storageBucket: "agroai-c5d64.firebasestorage.app",
  messagingSenderId: "274185516449",
  appId: "1:274185516449:web:f3e8d112c4e494d3f347e0",
  measurementId: "G-K2HVDZK660"
};




const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);