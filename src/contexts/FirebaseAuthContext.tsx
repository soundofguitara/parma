import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  UserCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';

// Définir les types pour le contexte d'authentification
type FirebaseAuthContextType = {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any, data?: any }>;
  signOut: () => Promise<void>;
};

// Créer le contexte avec des valeurs par défaut
const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  user: null,
  isAdmin: false,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(FirebaseAuthContext);

// Fournisseur du contexte d'authentification
export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Vérifier si l'utilisateur est un administrateur
  const checkUserRole = async (userId: string): Promise<boolean> => {
    try {
      // Vous pouvez implémenter votre propre logique pour vérifier si l'utilisateur est un administrateur
      // Par exemple, en vérifiant une collection "user_roles" dans Firestore
      // Pour l'instant, nous retournons false par défaut
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle utilisateur:', error);
      return false;
    }
  };

  // Fonction de connexion
  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      // Vérifier la connectivité réseau
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return {
          error: {
            message: 'Vous semblez être hors ligne. Veuillez vérifier votre connexion internet.'
          }
        };
      }

      console.log(`Tentative de connexion pour l'email: ${email}`);

      // Ajouter un timeout pour éviter que la requête ne reste bloquée indéfiniment
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('La connexion a expiré. Veuillez réessayer.')), 15000);
      });

      // Créer la promesse de connexion
      const signInPromise = signInWithEmailAndPassword(auth, email, password);

      // Utiliser Promise.race pour implémenter un timeout
      const result = await Promise.race([
        signInPromise,
        timeoutPromise
      ]) as UserCredential;

      console.log('Connexion réussie');
      return { error: null };
    } catch (error: any) {
      console.error('Exception lors de la connexion:', error);

      // Améliorer les messages d'erreur
      let errorMessage = 'Erreur lors de la connexion';

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Email ou mot de passe incorrect.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives de connexion. Veuillez réessayer plus tard.';
      } else if (error.message === 'Failed to fetch') {
        errorMessage = 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet et réessayer.';
      } else if (error.message.includes('timeout') || error.message.includes('expiré')) {
        errorMessage = 'La connexion au serveur a pris trop de temps. Veuillez réessayer.';
      } else if (error.message.includes('NetworkError')) {
        errorMessage = 'Erreur réseau. Veuillez vérifier votre connexion et réessayer.';
      }

      return {
        error: {
          message: errorMessage,
          originalError: error
        }
      };
    }
  };

  // Fonction d'inscription
  const signUp = async (email: string, password: string) => {
    try {
      // Vérifier la connectivité réseau
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return {
          error: {
            message: 'Vous semblez être hors ligne. Veuillez vérifier votre connexion internet.'
          }
        };
      }

      console.log(`Tentative d'inscription pour l'email: ${email}`);

      // Ajouter un timeout pour éviter que la requête ne reste bloquée indéfiniment
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('L\'inscription a expiré. Veuillez réessayer.')), 15000);
      });

      // Créer la promesse d'inscription
      const signUpPromise = createUserWithEmailAndPassword(auth, email, password);

      // Utiliser Promise.race pour implémenter un timeout
      const result = await Promise.race([
        signUpPromise,
        timeoutPromise
      ]) as UserCredential;

      console.log('Inscription réussie');
      return { error: null, data: { user: result.user } };
    } catch (error: any) {
      console.error('Exception lors de l\'inscription:', error);

      // Améliorer les messages d'erreur
      let errorMessage = 'Erreur lors de l\'inscription';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Cet email est déjà utilisé.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'L\'email fourni n\'est pas valide.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe est trop faible.';
      } else if (error.message === 'Failed to fetch') {
        errorMessage = 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet et réessayer.';
      } else if (error.message.includes('timeout') || error.message.includes('expiré')) {
        errorMessage = 'L\'inscription au serveur a pris trop de temps. Veuillez réessayer.';
      }

      return {
        error: {
          message: errorMessage,
          originalError: error
        }
      };
    }
  };

  // Fonction de déconnexion
  const signOut = async () => {
    try {
      console.log('Tentative de déconnexion...');
      await firebaseSignOut(auth);

      // Réinitialiser l'état local
      setUser(null);
      setIsAdmin(false);

      console.log('Déconnexion réussie');
      return { error: null };
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      return { error };
    }
  };

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    // Définir un délai d'expiration pour éviter les chargements infinis
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log('Délai d\'expiration de chargement atteint, forçage de l\'état non authentifié');
        setUser(null);
        setIsAdmin(false);
        setIsLoading(false);
      }
    }, 5000); // 5 secondes de délai maximum pour le chargement

    // S'abonner aux changements d'état d'authentification
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Événement d\'authentification Firebase:', !!currentUser);

      setUser(currentUser);

      if (currentUser) {
        const isUserAdmin = await checkUserRole(currentUser.uid);
        setIsAdmin(isUserAdmin);
      } else {
        setIsAdmin(false);
      }

      setIsLoading(false);
    });

    // Nettoyer l'abonnement et le délai d'expiration lors du démontage
    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  // Valeur du contexte
  const value = {
    user,
    isAdmin,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <FirebaseAuthContext.Provider value={value}>{children}</FirebaseAuthContext.Provider>;
};
