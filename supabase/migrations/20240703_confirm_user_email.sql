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
