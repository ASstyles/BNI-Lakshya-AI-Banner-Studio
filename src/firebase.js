import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyAvIoCYNYw_v0N8ef0Z70-PEdZoeZrHa-Q",
  authDomain: "bni-lakshya-ai-banner-st-bba77.firebaseapp.com",
  projectId: "bni-lakshya-ai-banner-st-bba77",
  storageBucket: "bni-lakshya-ai-banner-st-bba77.firebasestorage.app",
  messagingSenderId: "597621457915",
  appId: "1:597621457915:web:79fa83a5ccec064715c15e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);