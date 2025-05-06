# Guide de configuration de l'authentification et de l'administration

Ce guide vous explique comment configurer l'authentification et la page d'administration dans votre application.

## Prérequis

- Un projet Supabase existant
- Accès à l'interface d'administration de Supabase

## Étapes de configuration

### 1. Créer la table des rôles utilisateurs

1. Connectez-vous à votre projet Supabase
2. Allez dans la section "SQL Editor"
3. Exécutez le script SQL suivant :

```sql
-- Création de la table des rôles utilisateurs
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Création d'une politique RLS pour la table user_roles
-- Seuls les administrateurs peuvent voir et modifier les rôles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux administrateurs de voir tous les rôles
CREATE POLICY "Les administrateurs peuvent voir tous les rôles" ON user_roles
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Politique pour permettre aux administrateurs de créer des rôles
CREATE POLICY "Les administrateurs peuvent créer des rôles" ON user_roles
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Politique pour permettre aux administrateurs de mettre à jour des rôles
CREATE POLICY "Les administrateurs peuvent mettre à jour des rôles" ON user_roles
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Politique pour permettre aux administrateurs de supprimer des rôles
CREATE POLICY "Les administrateurs peuvent supprimer des rôles" ON user_roles
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    )
  );

-- Politique pour permettre à tous les utilisateurs de voir leur propre rôle
CREATE POLICY "Les utilisateurs peuvent voir leur propre rôle" ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);
```

### 2. Créer des fonctions RPC pour la gestion des utilisateurs

Exécutez les scripts SQL suivants pour créer les fonctions nécessaires :

```sql
-- Fonction pour confirmer l'email d'un utilisateur
CREATE OR REPLACE FUNCTION confirm_user_email(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  -- Mettre à jour la date de confirmation de l'email
  UPDATE auth.users
  SET email_confirmed_at = NOW(),
      updated_at = NOW()
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour récupérer tous les utilisateurs
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Cette fonction ne retourne que les utilisateurs qui ont un rôle dans la table user_roles
  -- pour des raisons de sécurité
  RETURN QUERY
  SELECT au.id, au.email, au.created_at
  FROM auth.users au
  JOIN user_roles ur ON au.id = ur.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour désactiver un utilisateur
CREATE OR REPLACE FUNCTION disable_user(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  -- Mettre à jour le statut de l'utilisateur pour le désactiver
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{disabled}',
    'true'
  ),
  updated_at = NOW()
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Créer le premier utilisateur administrateur

1. Allez dans la section "Authentication" > "Users" de Supabase
2. Cliquez sur "Invite new user"
3. Entrez l'adresse e-mail et le mot de passe de l'administrateur
4. Cliquez sur "Invite"
5. Une fois l'utilisateur créé, notez son ID (UUID)
6. Allez dans la section "Table Editor"
7. Sélectionnez la table "user_roles"
8. Cliquez sur "Insert row"
9. Remplissez les champs suivants :
   - user_id: [UUID de l'utilisateur créé]
   - role: "admin"
10. Cliquez sur "Save"

### 4. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine de votre projet avec les informations suivantes :

```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon-supabase
```

Remplacez les valeurs par celles de votre projet Supabase, que vous pouvez trouver dans la section "Settings" > "API" de Supabase.

### 5. Tester l'authentification

1. Démarrez votre application avec `npm run dev`
2. Accédez à l'URL de votre application
3. Vous devriez être redirigé vers la page de connexion
4. Connectez-vous avec les identifiants de l'administrateur que vous avez créé
5. Après la connexion, vous devriez voir l'option "Administration" dans le menu latéral

## Fonctionnalités d'administration

Une fois connecté en tant qu'administrateur, vous pouvez :

1. **Gérer les utilisateurs**
   - Voir tous les utilisateurs de l'application
   - Ajouter de nouveaux utilisateurs
   - Attribuer ou retirer des droits d'administrateur
   - Supprimer des utilisateurs

2. **Contrôler l'accès aux fonctionnalités**
   - Seuls les administrateurs ont accès à la page d'administration
   - Les utilisateurs normaux n'ont pas accès aux fonctionnalités d'administration

## Dépannage

Si vous rencontrez des problèmes lors de la configuration :

1. **Erreur de connexion**
   - Vérifiez que les variables d'environnement sont correctement configurées
   - Assurez-vous que l'utilisateur existe dans Supabase

2. **Pas d'accès à l'administration**
   - Vérifiez que l'utilisateur a bien le rôle "admin" dans la table "user_roles"
   - Vérifiez les politiques RLS dans Supabase

3. **Erreurs lors de la gestion des utilisateurs**
   - Vérifiez les journaux de la console pour identifier les erreurs spécifiques
   - Assurez-vous que les politiques RLS sont correctement configurées
