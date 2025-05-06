-- Supprimer les politiques existantes pour la table user_roles
DROP POLICY IF EXISTS "Les administrateurs peuvent voir tous les rôles" ON user_roles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre rôle" ON user_roles;

-- Créer une politique simplifiée pour permettre à tous les utilisateurs de voir tous les rôles
-- Cette politique est temporaire pour le débogage
CREATE POLICY "Tous les utilisateurs peuvent voir tous les rôles" ON user_roles
  FOR SELECT
  USING (true);

-- Politique pour permettre à tous les utilisateurs de voir leur propre rôle
-- Cette politique est redondante avec la précédente, mais sera utile quand vous voudrez restreindre l'accès
CREATE POLICY "Les utilisateurs peuvent voir leur propre rôle" ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Vérifier les rôles existants
SELECT * FROM user_roles;
