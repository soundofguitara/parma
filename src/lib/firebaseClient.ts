import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

// Configuration Firebase
// Remplacez ces valeurs par vos propres valeurs de configuration Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Obtenir l'instance d'authentification
const auth = getAuth(app);

// Configurer la persistance pour éviter les déconnexions
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Persistance Firebase configurée avec succès');
  })
  .catch((error) => {
    console.error('Erreur lors de la configuration de la persistance Firebase:', error);
  });

export { auth };
