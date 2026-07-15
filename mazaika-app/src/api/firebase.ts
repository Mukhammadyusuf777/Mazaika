import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAQXndUS0jF5b6qVySLHbCUrz57pbiucrk",
  authDomain: "mazaika-uz.firebaseapp.com",
  projectId: "mazaika-uz",
  storageBucket: "mazaika-uz.firebasestorage.app",
  messagingSenderId: "659288037602",
  appId: "1:659288037602:web:53302c069dc9002d9466bb",
  measurementId: "G-M2N5CZC75R"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
// Build trigger comment for Cloudflare Pages root directory update
