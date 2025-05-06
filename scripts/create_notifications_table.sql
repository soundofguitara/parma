-- Création de la table des notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('success', 'info', 'warning', 'error')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  user_id TEXT, -- NULL pour les notifications globales
  data JSONB,
  action_label TEXT,
  action_route TEXT
);

-- Index pour accélérer les requêtes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_timestamp_idx ON public.notifications(timestamp);

-- Politique de sécurité RLS (Row Level Security)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tous les utilisateurs authentifiés de lire les notifications globales
-- et leurs propres notifications
CREATE POLICY "Users can read their own notifications and global notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid()::text OR user_id IS NULL);

-- Politique pour permettre aux utilisateurs authentifiés de mettre à jour leurs propres notifications
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid()::text);

-- Politique pour permettre aux utilisateurs authentifiés de supprimer leurs propres notifications
CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (user_id = auth.uid()::text);

-- Politique pour permettre aux utilisateurs authentifiés d'insérer des notifications
CREATE POLICY "Users can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (user_id = auth.uid()::text OR user_id IS NULL);

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE public.notifications IS 'Table pour stocker les notifications des utilisateurs';
COMMENT ON COLUMN public.notifications.id IS 'Identifiant unique de la notification';
COMMENT ON COLUMN public.notifications.title IS 'Titre de la notification';
COMMENT ON COLUMN public.notifications.message IS 'Message de la notification';
COMMENT ON COLUMN public.notifications.type IS 'Type de notification (success, info, warning, error)';
COMMENT ON COLUMN public.notifications.timestamp IS 'Date et heure de création de la notification';
COMMENT ON COLUMN public.notifications.read IS 'Indique si la notification a été lue';
COMMENT ON COLUMN public.notifications.user_id IS 'ID de l''utilisateur (NULL pour les notifications globales)';
COMMENT ON COLUMN public.notifications.data IS 'Données supplémentaires au format JSON';
COMMENT ON COLUMN public.notifications.action_label IS 'Libellé du bouton d''action';
COMMENT ON COLUMN public.notifications.action_route IS 'Route pour la navigation lors du clic sur l''action';
