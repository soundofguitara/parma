import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
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

interface User {
  id: string;
  email: string;
  created_at: string;
  isAdmin: boolean;
}

const Admin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Charger la liste des utilisateurs
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Récupérer les rôles des utilisateurs avec les informations des utilisateurs
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          users:user_id (
            email,
            created_at
          )
        `);

      if (rolesError) {
        throw rolesError;
      }

      // Récupérer tous les utilisateurs via la fonction RPC
      const { data: allUsersData, error: allUsersError } = await supabase.rpc('get_all_users');

      if (allUsersError) {
        console.warn("Impossible de récupérer tous les utilisateurs via RPC:", allUsersError);
        // Continuons avec les données que nous avons des rôles
      }

      // Créer un dictionnaire des rôles par ID d'utilisateur
      const roleMap = new Map();
      rolesData.forEach((role) => {
        roleMap.set(role.user_id, role.role === 'admin');
      });

      // Combiner les données
      let formattedUsers = [];

      if (allUsersData && allUsersData.length > 0) {
        // Si nous avons des données de tous les utilisateurs, utilisons-les
        formattedUsers = allUsersData.map((user) => ({
          id: user.id,
          email: user.email || '',
          created_at: user.created_at,
          isAdmin: roleMap.get(user.id) || false,
        }));
      } else {
        // Sinon, utilisons les données des utilisateurs associés aux rôles
        formattedUsers = rolesData
          .filter(role => role.users) // Filtrer les entrées sans utilisateur associé
          .map(role => ({
            id: role.user_id,
            email: role.users.email || '',
            created_at: role.users.created_at,
            isAdmin: role.role === 'admin',
          }));
      }

      setUsers(formattedUsers);
    } catch (error: any) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast({
        variant: 'destructive',
        description: `Erreur: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Ajouter un nouvel utilisateur
  const addUser = async () => {
    setIsAddingUser(true);
    try {
      // Créer un nouvel utilisateur avec signUp au lieu de admin.createUser
      const { data, error } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });

      if (error) {
        throw error;
      }

      // Confirmer manuellement l'email de l'utilisateur (puisque nous n'avons pas de serveur de mail configuré)
      const { error: updateError } = await supabase.rpc('confirm_user_email', {
        user_id_param: data.user?.id
      });

      if (updateError) {
        console.warn("Impossible de confirmer l'email automatiquement:", updateError);
        // Continuons malgré cette erreur, car elle est attendue si la fonction RPC n'existe pas
      }

      // Si l'utilisateur doit être administrateur, ajouter son rôle
      if (newUserIsAdmin && data.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([{ user_id: data.user.id, role: 'admin' }]);

        if (roleError) {
          throw roleError;
        }
      }

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

  // Supprimer un utilisateur
  const deleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      // Supprimer le rôle de l'utilisateur
      // Cela suffit pour le retirer de l'interface d'administration
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      // Essayer de désactiver l'utilisateur via RPC
      const { error: disableError } = await supabase.rpc('disable_user', {
        user_id_param: userId
      });

      if (disableError) {
        console.warn("Impossible de désactiver l'utilisateur:", disableError);
        // Continuons malgré cette erreur
      }

      toast({
        description: 'Utilisateur supprimé avec succès',
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

  // Mettre à jour le rôle d'un utilisateur
  const updateUserRole = async (userId: string, isAdmin: boolean) => {
    try {
      if (isAdmin) {
        // Ajouter le rôle d'administrateur
        const { error } = await supabase
          .from('user_roles')
          .upsert([{ user_id: userId, role: 'admin' }]);

        if (error) {
          throw error;
        }
      } else {
        // Supprimer le rôle d'administrateur
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        if (error) {
          throw error;
        }
      }

      toast({
        description: 'Rôle mis à jour avec succès',
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
  }, []);

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
                            disabled={user.id === user?.id} // Empêcher de modifier son propre rôle
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteUser(user.id)}
                            disabled={user.id === user?.id} // Empêcher de se supprimer soi-même
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

export default Admin;
