import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { sessionManager } from '@/lib/sessionManager';

// Définir les types pour le contexte d'authentification
type AuthContextType = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any, data?: any }>;
  signOut: () => Promise<void>;
};

// Créer le contexte avec des valeurs par défaut
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isAdmin: false,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

// Fournisseur du contexte d'authentification
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Vérifier si l'utilisateur est un administrateur
  const checkUserRole = async (userId: string) => {
    try {
      console.log('Vérification du rôle pour l\'utilisateur:', userId);

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Erreur lors de la vérification du rôle:', error);
        return false;
      }

      console.log('Données du rôle récupérées:', data);
      const isAdmin = data?.role === 'admin';
      console.log('L\'utilisateur est-il admin?', isAdmin);

      return isAdmin;
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle:', error);
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

      // Options de session selon le choix "Rester connecté"
      const sessionOptions = {
        expiresIn: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 jours ou 24 heures en secondes
      };

      console.log(`Connexion avec l'option "Rester connecté": ${rememberMe}, durée: ${sessionOptions.expiresIn} secondes`);

      // Ajouter un timeout pour éviter que la requête ne reste bloquée indéfiniment
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('La connexion a expiré. Veuillez réessayer.')), 15000);
      });

      // Créer la promesse de connexion
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      }, sessionOptions);

      // Utiliser Promise.race pour implémenter un timeout
      const result = await Promise.race([
        signInPromise,
        timeoutPromise
      ]) as { data: any, error: any };

      if (result.error) {
        console.error('Erreur lors de la connexion:', result.error);
        return { error: result.error };
      }

      // Initialiser le gestionnaire de session après la connexion
      try {
        sessionManager.initialize();
      } catch (sessionError) {
        console.warn('Erreur lors de l\'initialisation du gestionnaire de session:', sessionError);
        // On continue malgré cette erreur
      }

      return { error: null };
    } catch (error: any) {
      console.error('Exception lors de la connexion:', error);

      // Améliorer les messages d'erreur
      let errorMessage = 'Erreur lors de la connexion';

      if (error.message === 'Failed to fetch') {
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
      const signUpPromise = supabase.auth.signUp({
        email,
        password,
      });

      // Utiliser Promise.race pour implémenter un timeout
      const result = await Promise.race([
        signUpPromise,
        timeoutPromise
      ]) as { data: any, error: any };

      if (result.error) {
        console.error('Erreur lors de l\'inscription:', result.error);
        return { error: result.error };
      }

      console.log('Inscription réussie, données:', result.data);

      // Vérifier si l'utilisateur a besoin de confirmer son email
      if (result.data?.user?.identities?.length === 0) {
        return {
          error: {
            message: 'Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.'
          }
        };
      }

      return { error: null, data: result.data };
    } catch (error: any) {
      console.error('Exception lors de l\'inscription:', error);

      // Améliorer les messages d'erreur
      let errorMessage = 'Erreur lors de l\'inscription';

      if (error.message === 'Failed to fetch') {
        errorMessage = 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet et réessayer.';
      } else if (error.message.includes('timeout') || error.message.includes('expiré')) {
        errorMessage = 'L\'inscription a pris trop de temps. Veuillez réessayer.';
      } else if (error.message.includes('NetworkError')) {
        errorMessage = 'Erreur réseau. Veuillez vérifier votre connexion et réessayer.';
      } else if (error.message.includes('password')) {
        errorMessage = 'Le mot de passe ne respecte pas les critères de sécurité. Il doit contenir au moins 6 caractères.';
      } else if (error.message.includes('email')) {
        errorMessage = 'L\'adresse email n\'est pas valide.';
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
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
        throw error;
      }

      // Réinitialiser l'état local
      setSession(null);
      setUser(null);
      setIsAdmin(false);

      console.log('Déconnexion réussie');
      return { error: null };
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      return { error };
    }
  };

  // Écouter les changements de session
  useEffect(() => {
    // Définir un délai d'expiration pour éviter les chargements infinis
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log('Délai d\'expiration de chargement atteint, forçage de l\'état non authentifié');
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setIsLoading(false);

        // Nettoyer le stockage local pour éviter les problèmes futurs
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('supabase.auth.token');
      }
    }, 5000); // 5 secondes de délai maximum pour le chargement

    // Initialiser le gestionnaire de session pour maintenir la session active
    sessionManager.initialize();

    // S'abonner aux changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Événement d\'authentification:', event, 'Session:', !!session);

        // Gérer les différents événements d'authentification
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          setSession(session);
          setUser(session?.user || null);

          if (session?.user) {
            const isUserAdmin = await checkUserRole(session.user.id);
            setIsAdmin(isUserAdmin);
          } else {
            setIsAdmin(false);
          }

          setIsLoading(false);
          return;
        }
      }
    );

    // Vérifier la session actuelle au chargement
    const checkCurrentSession = async () => {
      try {
        console.log('Vérification de la session actuelle...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
          throw error;
        }

        console.log('Session récupérée:', !!session);
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          const isUserAdmin = await checkUserRole(session.user.id);
          setIsAdmin(isUserAdmin);

          // Rafraîchir manuellement le token pour s'assurer qu'il est à jour
          await sessionManager.refreshToken();
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la session:', error);
        // En cas d'erreur, réinitialiser l'état
        setSession(null);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkCurrentSession();

    // Nettoyer l'abonnement et le délai d'expiration lors du démontage
    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  // Valeur du contexte
  const value = {
    session,
    user,
    isAdmin,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
