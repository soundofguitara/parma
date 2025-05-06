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
