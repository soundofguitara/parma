import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCcw, UserPlus, LogIn } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { auth } from '@/lib/firebaseClient';
import { signOut } from 'firebase/auth';

const FirebaseLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Vérifier l'état de l'authentification au chargement
  useEffect(() => {
    if (user) {
      console.log('Utilisateur déjà connecté:', user);
      console.log('Est-il admin?', isAdmin);
    }
  }, [user, isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setDebugInfo(null);

    try {
      // Vérifier la connectivité réseau
      if (!navigator.onLine) {
        setError('Vous semblez être hors ligne. Veuillez vérifier votre connexion internet.');
        setIsLoading(false);
        return;
      }

      // Vérifier que les variables d'environnement Firebase sont définies
      if (!import.meta.env.VITE_FIREBASE_API_KEY || !import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) {
        setError('Configuration incorrecte. Veuillez contacter l\'administrateur.');
        setDebugInfo('Variables d\'environnement Firebase manquantes ou incorrectes.');
        setIsLoading(false);
        return;
      }

      // Forcer la déconnexion avant de se connecter pour éviter les conflits
      try {
        await signOut(auth);
        setDebugInfo('Déconnexion préalable effectuée.');
      } catch (signOutErr: any) {
        setDebugInfo(`Erreur lors de la déconnexion préalable: ${signOutErr.message}`);
        // On continue malgré cette erreur
      }

      if (isSignUp) {
        // Tenter de s'inscrire
        try {
          setDebugInfo(`Tentative d'inscription pour l'email: ${email.substring(0, 3)}...`);
          const { error, data } = await signUp(email, password);

          if (error) {
            setError(error.message || 'Erreur lors de l\'inscription');
            setDebugInfo(`Erreur d'inscription: ${JSON.stringify(error)}`);
            setIsLoading(false);
            return;
          }

          setDebugInfo(`Inscription réussie, tentative de connexion automatique...`);

          // Si l'inscription est réussie, connecter automatiquement
          const { error: signInError } = await signIn(email, password, rememberMe);

          if (signInError) {
            setError(signInError.message || 'Inscription réussie mais erreur lors de la connexion automatique');
            setDebugInfo(`Erreur de connexion après inscription: ${JSON.stringify(signInError)}`);
            setIsLoading(false);
            return;
          }
        } catch (signUpErr: any) {
          setError('Erreur inattendue lors de l\'inscription');
          setDebugInfo(`Exception lors de l'inscription: ${signUpErr.message}`);
          setIsLoading(false);
          return;
        }
      } else {
        // Tenter de se connecter
        try {
          setDebugInfo(`Tentative de connexion avec l'email: ${email.substring(0, 3)}...`);
          const { error } = await signIn(email, password, rememberMe);

          if (error) {
            setError(error.message || 'Erreur lors de la connexion');
            setDebugInfo(`Erreur de connexion: ${JSON.stringify(error)}`);
            setIsLoading(false);
            return;
          }

          setDebugInfo(`Connexion réussie!`);
        } catch (signInErr: any) {
          setError('Erreur inattendue lors de la connexion');
          setDebugInfo(`Exception lors de la connexion: ${signInErr.message}`);
          setIsLoading(false);
          return;
        }
      }

      // Redirection vers la page d'accueil en cas de succès
      setDebugInfo(`Redirection vers la page d'accueil...`);
      navigate('/');
    } catch (err: any) {
      setError('Une erreur inattendue est survenue');
      setDebugInfo(`Exception générale: ${err.message}\nStack: ${err.stack}`);
      setIsLoading(false);
    }
  };

  // Basculer entre connexion et inscription
  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setError(null);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-pharma-blue-dark p-4">
      <Card className="w-full max-w-md bg-pharma-blue-light border-pharma-blue-dark">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-pharma-accent-blue flex items-center justify-center">
              <span className="text-white text-xl font-bold">LDM</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-white">
            {isSignUp ? 'Créer un compte' : 'Connexion'}
          </CardTitle>
          <CardDescription className="text-center text-pharma-text-light">
            {isSignUp
              ? 'Créez un compte pour accéder à l\'application'
              : 'Entrez vos identifiants pour accéder à l\'application'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-900/50 text-red-300">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-pharma-text-light">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-pharma-blue-dark border-pharma-blue-dark text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-pharma-text-light">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-pharma-blue-dark border-pharma-blue-dark text-white"
              />
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                className="data-[state=checked]:bg-pharma-accent-blue data-[state=checked]:border-pharma-accent-blue"
              />
              <label
                htmlFor="rememberMe"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-pharma-text-light"
              >
                Rester connecté
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-pharma-accent-blue hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? 'Inscription en cours...' : 'Connexion en cours...'}
                </>
              ) : (
                <>
                  {isSignUp ? <UserPlus className="mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />}
                  {isSignUp ? 'S\'inscrire' : 'Se connecter'}
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4">
          <div className="flex flex-col items-center space-y-2 w-full">
            <Button
              variant="link"
              className="text-pharma-accent-blue hover:text-blue-400"
              onClick={toggleSignUp}
            >
              {isSignUp ? 'Déjà un compte ? Se connecter' : 'Créer un nouveau compte'}
            </Button>

            <p className="text-sm text-pharma-text-light">
              {isSignUp
                ? 'Vous recevrez un email de confirmation après l\'inscription'
                : 'Contactez l\'administrateur si vous avez perdu vos identifiants'
              }
            </p>
          </div>

          {/* Bouton de récupération */}
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-pharma-blue-dark border-pharma-blue-dark text-pharma-text-light hover:bg-pharma-blue-light/30"
            onClick={async () => {
              try {
                // Nettoyer complètement le stockage local
                localStorage.clear();
                sessionStorage.clear();

                // Forcer la déconnexion
                await signOut(auth);

                // Recharger la page
                window.location.reload();

                setDebugInfo('Nettoyage effectué. La page va se recharger...');
              } catch (err: any) {
                console.error('Erreur lors du nettoyage:', err);
                setDebugInfo(`Erreur: ${err.message}`);
              }
            }}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Résoudre les problèmes de connexion
          </Button>

          {/* Afficher les informations de débogage */}
          {debugInfo && (
            <div className="mt-4 p-3 bg-pharma-blue-dark/50 border border-pharma-blue-light rounded-md w-full">
              <pre className="text-xs text-pharma-text-light whitespace-pre-wrap">
                {debugInfo}
              </pre>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default FirebaseLogin;
