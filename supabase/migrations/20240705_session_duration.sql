-- Configuration de la durée de session dans Supabase
-- Ce script doit être exécuté dans l'interface SQL de Supabase

-- Définir la durée de vie du token JWT à 24 heures (86400 secondes)
UPDATE auth.config
SET value = '{"accessTokenExpirySeconds": 86400}'::jsonb
WHERE name = 'jwt';

-- Définir la durée de vie de la session à 24 heures (86400 secondes)
UPDATE auth.config
SET value = '{"inactivityTimeout": 86400}'::jsonb
WHERE name = 'session';

-- Vérifier les configurations
SELECT name, value FROM auth.config WHERE name IN ('jwt', 'session');
