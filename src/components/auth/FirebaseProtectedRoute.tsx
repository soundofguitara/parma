import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebaseClient';
import { signOut } from 'firebase/auth';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

const FirebaseProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAdmin = false }) => {
  const { user, isAdmin, isLoading } = useAuth();
  const [showRecoveryOptions, setShowRecoveryOptions] = useState(false);
  const navigate = useNavigate();

  // Afficher les options de récupération après un certain délai
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setShowRecoveryOptions(true);
      }
    }, 5000); // 5 secondes

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Fonction pour forcer la déconnexion et rediriger vers la page de connexion
  const handleForceLogout = async () => {
    try {
      // Forcer la déconnexion via Firebase
      await signOut(auth);

      // Rediriger vers la page de connexion
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erreur lors de la déconnexion forcée:', error);
      // En cas d'erreur, recharger la page
      window.location.href = '/login';
    }
  };

  // Fonction pour recharger la page
  const handleRefresh = () => {
    window.location.reload();
  };

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-pharma-blue-dark">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-pharma-accent-blue mx-auto" />
          <p className="mt-4 text-white">Chargement...</p>

          {showRecoveryOptions && (
            <div className="mt-8 space-y-4">
              <p className="text-pharma-text-light text-sm">
                Le chargement prend plus de temps que prévu. Essayez les options suivantes :
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="bg-pharma-blue-light border-pharma-blue-light text-white hover:bg-pharma-blue-light/80"
                  onClick={handleRefresh}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Actualiser la page
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleForceLogout}
                >
                  Se déconnecter et revenir à la page de connexion
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Rediriger vers la page d'accueil si l'utilisateur n'est pas administrateur
  // mais que la route nécessite des privilèges d'administrateur
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Rendre les routes enfants si l'utilisateur est authentifié et a les privilèges nécessaires
  return <Outlet />;
};

export default FirebaseProtectedRoute;
