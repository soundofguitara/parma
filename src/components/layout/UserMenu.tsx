import React from 'react';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Shield, User, RefreshCw, Settings } from 'lucide-react';
import { clearFirebaseCache, forceFirebaseSignOut } from '@/lib/firebaseCacheUtils';
import { useNavigate } from 'react-router-dom';

const UserMenu = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      // Nettoyer le cache avant la déconnexion
      await clearFirebaseCache();

      // Déconnexion
      await signOut();

      // Forcer un rechargement de la page après la déconnexion
      window.location.href = '/login';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);

      // En cas d'erreur, essayer de forcer la déconnexion
      await forceFirebaseSignOut();

      // Rediriger vers la page de connexion
      window.location.href = '/login';
    }
  };

  // Fonction pour rafraîchir le cache
  const handleRefreshCache = async () => {
    try {
      // Nettoyer uniquement le cache Firebase sans se déconnecter
      await clearFirebaseCache();

      // Recharger la page
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du cache:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pharma-accent-blue">
            <User className="h-4 w-4 text-white" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-pharma-blue-dark border-pharma-blue-light" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-white">{user?.email}</p>
            {isAdmin && (
              <p className="text-xs leading-none text-pharma-text-light flex items-center gap-1 mt-1">
                <Shield className="h-3 w-3" />
                Administrateur
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-pharma-blue-light/50" />
        <DropdownMenuItem
          className="text-pharma-text-light cursor-pointer hover:text-white hover:bg-pharma-blue-light/30"
          onClick={() => navigate('/settings')}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-pharma-text-light cursor-pointer hover:text-white hover:bg-pharma-blue-light/30"
          onClick={handleRefreshCache}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          <span>Rafraîchir le cache</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-pharma-blue-light/50" />
        <DropdownMenuItem
          className="text-red-400 cursor-pointer hover:text-red-300 hover:bg-red-900/20"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
