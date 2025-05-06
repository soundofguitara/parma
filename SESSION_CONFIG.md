# Configuration de la durée de session

Ce guide explique comment configurer la durée de session utilisateur à 24 heures dans votre application.

## Modifications côté client

Les modifications suivantes ont déjà été apportées au code de l'application :

1. **Configuration du client Supabase** : Le client Supabase a été configuré pour utiliser une durée de session de 24 heures.

2. **Gestionnaire de session** : Un gestionnaire de session a été créé pour rafraîchir automatiquement le token toutes les heures.

3. **Contexte d'authentification** : Le contexte d'authentification a été mis à jour pour utiliser le gestionnaire de session.

4. **Service worker** : Le service worker a été configuré pour ne pas interférer avec les tokens d'authentification.

## Configuration côté serveur

Pour que la durée de session soit effective, vous devez également configurer Supabase côté serveur. Suivez ces étapes :

1. Connectez-vous à votre projet Supabase
2. Allez dans la section "SQL Editor"
3. Exécutez le script SQL suivant :

```sql
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
```

## Vérification

Pour vérifier que la configuration fonctionne correctement :

1. Connectez-vous à l'application
2. Laissez l'application inactive pendant quelques heures
3. Revenez à l'application et vérifiez que vous êtes toujours connecté

Si vous êtes toujours connecté après plusieurs heures d'inactivité, la configuration fonctionne correctement.

## Dépannage

Si vous rencontrez des problèmes avec la durée de session :

1. **Vérifiez les logs** : Ouvrez la console du navigateur et vérifiez les logs pour voir si le token est correctement rafraîchi.

2. **Vérifiez la configuration Supabase** : Exécutez la requête suivante pour vérifier la configuration :

```sql
SELECT name, value FROM auth.config WHERE name IN ('jwt', 'session');
```

3. **Vérifiez le stockage local** : Ouvrez les outils de développement du navigateur, allez dans l'onglet "Application" > "Local Storage" et vérifiez que les tokens Supabase sont présents.

4. **Forcer le rafraîchissement du token** : Si nécessaire, vous pouvez forcer le rafraîchissement du token en appelant `sessionManager.refreshToken()` dans la console du navigateur.
