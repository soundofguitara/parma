# Guide de dépannage pour les problèmes de connexion

Ce guide vous aidera à résoudre les problèmes de connexion courants dans l'application.

## Erreur "Failed to fetch"

Cette erreur indique un problème de communication avec le serveur Supabase. Voici les solutions possibles :

### 1. Vérifier votre connexion internet

- Assurez-vous d'être connecté à internet
- Essayez d'ouvrir d'autres sites web pour vérifier que votre connexion fonctionne
- Si vous utilisez un VPN, essayez de le désactiver temporairement

### 2. Vérifier la configuration de l'application

- Assurez-vous que les variables d'environnement Supabase sont correctement configurées
- Vérifiez le fichier `.env.local` à la racine du projet et assurez-vous qu'il contient :
  ```
  VITE_SUPABASE_URL=votre_url_supabase
  VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
  ```

### 3. Nettoyer le cache et les cookies

- Cliquez sur le bouton "Résoudre les problèmes de connexion" sur la page de connexion
- Alternativement, vous pouvez :
  - Ouvrir les outils de développement (F12)
  - Aller dans l'onglet "Application"
  - Cliquer sur "Clear storage" et cocher toutes les options
  - Cliquer sur "Clear site data"

### 4. Utiliser un autre navigateur

- Essayez d'utiliser un autre navigateur (Chrome, Firefox, Edge, etc.)
- Assurez-vous que votre navigateur est à jour

### 5. Désactiver les extensions

- Certaines extensions de navigateur peuvent bloquer les requêtes
- Essayez de désactiver temporairement vos extensions, en particulier les bloqueurs de publicités

## Erreur "La connexion a expiré"

Cette erreur indique que la connexion au serveur prend trop de temps. Voici les solutions possibles :

1. Vérifiez votre connexion internet (débit et latence)
2. Essayez de vous reconnecter plus tard
3. Si le problème persiste, contactez l'administrateur

## Erreur "Cet email est déjà utilisé"

Cette erreur indique que l'email que vous essayez d'utiliser pour l'inscription est déjà associé à un compte. Voici les solutions possibles :

1. Utilisez l'option "Se connecter" au lieu de "S'inscrire"
2. Utilisez une autre adresse email pour créer un nouveau compte
3. Si vous avez oublié votre mot de passe, contactez l'administrateur

## Problèmes persistants

Si les problèmes persistent malgré ces solutions :

1. Notez les messages d'erreur exacts qui s'affichent
2. Prenez une capture d'écran de l'erreur
3. Contactez l'administrateur en fournissant ces informations

## Informations techniques pour les administrateurs

### Vérification de la configuration Supabase

1. Vérifiez que le projet Supabase est actif et en ligne
2. Vérifiez que les clés API sont correctes
3. Vérifiez les journaux d'erreur dans la console Supabase

### Vérification des paramètres d'authentification

1. Dans la console Supabase, allez dans "Authentication" > "Settings"
2. Vérifiez que le mode d'inscription est activé (si nécessaire)
3. Vérifiez les paramètres de confirmation d'email

### Vérification des règles de sécurité

1. Vérifiez les règles CORS dans la console Supabase
2. Assurez-vous que le domaine de l'application est autorisé
