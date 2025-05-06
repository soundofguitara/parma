/**
 * Utilitaires pour gérer le cache du navigateur et du service worker
 */

/**
 * Nettoie le cache du navigateur et du service worker
 */
export const clearBrowserCache = async (): Promise<void> => {
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
    
    console.log('Cache du navigateur nettoyé avec succès');
  } catch (error) {
    console.error('Erreur lors du nettoyage du cache:', error);
  }
};

/**
 * Nettoie le cache spécifique à Supabase
 */
export const clearSupabaseCache = (): void => {
  try {
    // Supprimer les jetons d'authentification Supabase
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('supabase.auth.token');
    
    // Supprimer d'autres éléments potentiels du cache Supabase
    const keysToRemove = [];
    
    // Parcourir le localStorage pour trouver les clés liées à Supabase
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('supabase')) {
        keysToRemove.push(key);
      }
    }
    
    // Supprimer les clés trouvées
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    console.log('Cache Supabase nettoyé avec succès');
  } catch (error) {
    console.error('Erreur lors du nettoyage du cache Supabase:', error);
  }
};
