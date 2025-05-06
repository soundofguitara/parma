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
