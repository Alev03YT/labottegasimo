import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyABHJn6ooogyYou8U75wBzFmHaMyFjk278",
  authDomain: "labottegasimo.firebaseapp.com",
  projectId: "labottegasimo",
  storageBucket: "labottegasimo.firebasestorage.app",
  messagingSenderId: "869674101293",
  appId: "1:869674101293:web:493b0004fd598600f3a6a4",
  measurementId: "G-JYVJ0LF5YE"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
