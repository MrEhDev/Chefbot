import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCRQfuPtYK-pFjJXlHBcMpAbYpzMqPQRlY",
  authDomain: "chefbot-db.firebaseapp.com",
  projectId: "chefbot-db",
  storageBucket: "chefbot-db.firebasestorage.app",
  messagingSenderId: "1041375017825",
  appId: "1:1041375017825:web:00c24c90c57d7e5e826320"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
