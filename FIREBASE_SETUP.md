# Configuration de Firebase Authentication

Ce document explique comment configurer Firebase Authentication pour votre application.

## Étape 1: Créer un projet Firebase

1. Accédez à la [console Firebase](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet"
3. Donnez un nom à votre projet et suivez les étapes de configuration
4. Une fois le projet créé, accédez à la page d'accueil du projet

## Étape 2: Activer l'authentification par email/mot de passe

1. Dans le menu de gauche, cliquez sur "Authentication"
2. Cliquez sur "Get started" ou "Commencer"
3. Dans l'onglet "Sign-in method", activez "Email/Password"
4. Cliquez sur "Save" ou "Enregistrer"

## Étape 3: Ajouter Firebase à votre application web

1. Sur la page d'accueil du projet Firebase, cliquez sur l'icône "</>" (Ajouter une application web)
2. Donnez un nom à votre application et cliquez sur "Register app" ou "Enregistrer l'application"
3. Copiez les informations de configuration Firebase qui s'affichent

## Étape 4: Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine de votre projet avec les informations suivantes:

```
VITE_FIREBASE_API_KEY=votre_api_key_firebase
VITE_FIREBASE_AUTH_DOMAIN=votre_auth_domain_firebase
VITE_FIREBASE_PROJECT_ID=votre_project_id_firebase
VITE_FIREBASE_STORAGE_BUCKET=votre_storage_bucket_firebase
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id_firebase
VITE_FIREBASE_APP_ID=votre_app_id_firebase
```

Remplacez les valeurs par celles que vous avez copiées à l'étape précédente.

## Étape 5: Créer un premier utilisateur administrateur

1. Lancez votre application
2. Accédez à la page de connexion
3. Cliquez sur "Créer un nouveau compte"
4. Créez un compte avec votre email et un mot de passe sécurisé
5. Une fois connecté, vous pouvez accéder à la page d'administration pour gérer les utilisateurs

## Dépannage

### Problèmes de connexion

Si vous rencontrez des problèmes de connexion:

1. Vérifiez que les variables d'environnement sont correctement configurées
2. Assurez-vous que l'authentification par email/mot de passe est activée dans Firebase
3. Vérifiez les règles CORS dans la console Firebase
4. Essayez de nettoyer le cache du navigateur

### Problèmes de session

Si vous rencontrez des problèmes de session:

1. Utilisez le bouton "Résoudre les problèmes de connexion" sur la page de connexion
2. Vérifiez que le service worker ne bloque pas les requêtes d'authentification
3. Assurez-vous que les cookies tiers ne sont pas bloqués par votre navigateur

## Ressources utiles

- [Documentation Firebase Auth](https://firebase.google.com/docs/auth)
- [Guide d'intégration avec React](https://firebase.google.com/docs/auth/web/start)
- [Gestion des utilisateurs Firebase](https://firebase.google.com/docs/auth/web/manage-users)
