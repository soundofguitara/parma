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

-- Fonction pour créer le premier administrateur
CREATE OR REPLACE FUNCTION create_first_admin(admin_email TEXT, admin_password TEXT)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Créer un nouvel utilisateur
  INSERT INTO auth.users (email, password, email_confirmed_at)
  VALUES (admin_email, crypt(admin_password, gen_salt('bf')), NOW())
  RETURNING id INTO new_user_id;

  -- Ajouter le rôle d'administrateur
  INSERT INTO user_roles (user_id, role)
  VALUES (new_user_id, 'admin');

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
