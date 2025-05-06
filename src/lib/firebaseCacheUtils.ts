/**
 * Utilitaires pour gérer le cache Firebase
 */

import { auth } from './firebaseClient';
import { signOut } from 'firebase/auth';

/**
 * Nettoie le cache Firebase et du navigateur
 */
export const clearFirebaseCache = async (): Promise<void> => {
  try {
    // Nettoyer le cache du service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_CACHE'
      });
    }
    
    // Nettoyer le stockage local
    localStorage.clear();
    sessionStorage.clear();
    
    // Nettoyer les cookies Firebase
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (name.includes('firebase')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
    
    console.log('Cache Firebase nettoyé avec succès');
  } catch (error) {
    console.error('Erreur lors du nettoyage du cache Firebase:', error);
  }
};

/**
 * Déconnecte l'utilisateur et nettoie le cache
 */
export const forceFirebaseSignOut = async (): Promise<void> => {
  try {
    // Nettoyer le cache
    await clearFirebaseCache();
    
    // Déconnecter l'utilisateur
    await signOut(auth);
    
    console.log('Déconnexion Firebase forcée avec succès');
  } catch (error) {
    console.error('Erreur lors de la déconnexion forcée Firebase:', error);
    
    // En cas d'erreur, recharger la page
    window.location.reload();
  }
};
