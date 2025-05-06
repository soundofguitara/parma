import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Trash2, UserPlus, Users } from 'lucide-react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  deleteUser as firebaseDeleteUser,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';

interface User {
  id: string;
  email: string;
  created_at: string;
  isAdmin: boolean;
}

const FirebaseAdmin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fonction simulée pour charger les utilisateurs
  // Dans une implémentation réelle, vous utiliseriez Firebase Admin SDK ou Firestore
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Simuler le chargement des utilisateurs
      // Dans une implémentation réelle, vous récupéreriez les utilisateurs depuis Firebase
      setTimeout(() => {
        // Pour l'instant, nous n'affichons que l'utilisateur actuel
        if (user) {
          setUsers([
            {
              id: user.uid,
              email: user.email || 'Aucun email',
              created_at: new Date().toISOString(),
              isAdmin: true
            }
          ]);
        } else {
          setUsers([]);
        }
        setIsLoading(false);
      }, 1000);
    } catch (error: any) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast({
        variant: 'destructive',
        description: `Erreur: ${error.message}`,
      });
      setIsLoading(false);
    }
  };

  // Ajouter un nouvel utilisateur
  const addUser = async () => {
    setIsAddingUser(true);
    try {
      // Créer un nouvel utilisateur avec Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUserEmail,
        newUserPassword
      );

      toast({
        description: 'Utilisateur créé avec succès',
      });

      // Réinitialiser le formulaire et rafraîchir la liste
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserIsAdmin(false);
      setIsDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      toast({
        variant: 'destructive',
        description: `Erreur: ${error.message}`,
      });
    } finally {
      setIsAddingUser(false);
    }
  };

  // Supprimer un utilisateur (simulé)
  const deleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      // Dans une implémentation réelle, vous utiliseriez Firebase Admin SDK
      // Pour l'instant, nous simulons la suppression
      toast({
        description: 'Cette fonctionnalité nécessite Firebase Admin SDK',
      });

      // Rafraîchir la liste
      fetchUsers();
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      toast({
        variant: 'destructive',
        description: `Erreur: ${error.message}`,
      });
    }
  };

  // Mettre à jour le rôle d'un utilisateur (simulé)
  const updateUserRole = async (userId: string, isAdmin: boolean) => {
    try {
      // Dans une implémentation réelle, vous utiliseriez Firestore ou une base de données
      // Pour l'instant, nous simulons la mise à jour
      toast({
        description: 'Cette fonctionnalité nécessite Firestore ou une base de données',
      });

      // Mettre à jour la liste locale
      setUsers(users.map(u =>
        u.id === userId ? { ...u, isAdmin } : u
      ));
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      toast({
        variant: 'destructive',
        description: `Erreur: ${error.message}`,
      });
    }
  };

  // Charger les utilisateurs au chargement de la page
  useEffect(() => {
    fetchUsers();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Administration</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus size={18} />
              <span>Nouvel utilisateur</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-pharma-blue-dark border-pharma-blue-dark text-white">
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
              <DialogDescription className="text-pharma-text-light">
                Créez un compte pour un nouvel utilisateur de l'application.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="utilisateur@exemple.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="bg-pharma-blue-light border-pharma-blue-light text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="bg-pharma-blue-light border-pharma-blue-light text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAdmin"
                  checked={newUserIsAdmin}
                  onCheckedChange={(checked) => setNewUserIsAdmin(checked as boolean)}
                />
                <Label htmlFor="isAdmin" className="cursor-pointer">
                  Administrateur
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={addUser}
                disabled={isAddingUser || !newUserEmail || !newUserPassword}
              >
                {isAddingUser ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer l\'utilisateur'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="bg-pharma-blue-light">
          <TabsTrigger value="users" className="data-[state=active]:bg-pharma-accent-blue">
            <Users className="mr-2 h-4 w-4" />
            Utilisateurs
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-4">
          <Card className="bg-pharma-blue-dark border-pharma-blue-dark">
            <CardHeader>
              <CardTitle className="text-white">Gestion des utilisateurs</CardTitle>
              <CardDescription className="text-pharma-text-light">
                Gérez les utilisateurs qui ont accès à l'application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-pharma-accent-blue" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-pharma-blue-light hover:bg-transparent">
                      <TableHead className="text-pharma-text-light">Email</TableHead>
                      <TableHead className="text-pharma-text-light">Date de création</TableHead>
                      <TableHead className="text-pharma-text-light">Administrateur</TableHead>
                      <TableHead className="text-pharma-text-light text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-pharma-blue-light hover:bg-pharma-blue-light/10">
                        <TableCell className="text-white">{user.email}</TableCell>
                        <TableCell className="text-pharma-text-light">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={user.isAdmin}
                            onCheckedChange={(checked) => updateUserRole(user.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteUser(user.id)}
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FirebaseAdmin;
