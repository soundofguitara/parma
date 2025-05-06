# Guide de migration de Supabase Auth vers Firebase Auth

Ce guide explique comment migrer de Supabase Auth vers Firebase Auth pour résoudre les problèmes de session persistants.

## Pourquoi migrer ?

Supabase Auth présente plusieurs problèmes dans notre application :
- Déconnexions aléatoires des utilisateurs
- Problèmes de persistance de session
- Nécessité de nettoyer manuellement le stockage local
- Complexité de la gestion des tokens

Firebase Auth offre une solution plus stable avec :
- Une meilleure persistance des sessions
- Un plan gratuit généreux
- Une intégration simple avec React
- Un support pour l'authentification par email/mot de passe et SSO

## Étapes de migration

### 1. Configuration de Firebase

1. Créez un projet Firebase sur [console.firebase.google.com](https://console.firebase.google.com/)
2. Activez l'authentification par email/mot de passe dans la section "Authentication"
3. Copiez les informations de configuration de votre projet Firebase

### 2. Configuration des variables d'environnement

Créez ou modifiez le fichier `.env.local` à la racine du projet avec les variables suivantes :

```
VITE_FIREBASE_API_KEY=votre_api_key_firebase
VITE_FIREBASE_AUTH_DOMAIN=votre_auth_domain_firebase
VITE_FIREBASE_PROJECT_ID=votre_project_id_firebase
VITE_FIREBASE_STORAGE_BUCKET=votre_storage_bucket_firebase
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id_firebase
VITE_FIREBASE_APP_ID=votre_app_id_firebase
```

### 3. Utilisation des nouveaux composants

Pour utiliser Firebase Auth au lieu de Supabase Auth, vous avez deux options :

#### Option 1 : Remplacer complètement Supabase Auth

1. Renommez `src/App.tsx` en `src/App.supabase.tsx` (sauvegarde)
2. Renommez `src/App.firebase.tsx` en `src/App.tsx`

#### Option 2 : Tester Firebase Auth sans modifier l'application existante

1. Créez une nouvelle route dans `src/App.tsx` pour tester Firebase Auth :

```jsx
<Route path="/firebase-login" element={<FirebaseLogin />} />
```

### 4. Migration des utilisateurs

Pour migrer les utilisateurs existants de Supabase vers Firebase, vous pouvez :

1. Exporter les utilisateurs de Supabase via la console Supabase ou une requête SQL
2. Importer les utilisateurs dans Firebase à l'aide de l'API Admin Firebase
3. Demander aux utilisateurs de réinitialiser leur mot de passe lors de leur première connexion

## Fonctionnement de Firebase Auth

### Persistance des sessions

Firebase Auth offre trois modes de persistance :
- `LOCAL` : La session persiste même après la fermeture du navigateur (par défaut)
- `SESSION` : La session est effacée à la fermeture du navigateur
- `NONE` : La session est effacée dès que l'utilisateur quitte la page

Notre implémentation utilise le mode `LOCAL` pour éviter les déconnexions intempestives.

### Gestion des tokens

Firebase Auth gère automatiquement le rafraîchissement des tokens, sans nécessiter de code personnalisé comme avec Supabase.

### Synchronisation avec la base de données

Pour synchroniser les utilisateurs Firebase avec votre base de données, vous pouvez :
1. Utiliser les fonctions Firebase Cloud Functions pour réagir aux événements d'authentification
2. Mettre à jour votre base de données lorsqu'un utilisateur s'inscrit ou modifie ses informations

## Dépannage

Si vous rencontrez des problèmes lors de la migration :

1. Vérifiez que les variables d'environnement Firebase sont correctement configurées
2. Assurez-vous que l'authentification par email/mot de passe est activée dans la console Firebase
3. Nettoyez le stockage local du navigateur pour éviter les conflits avec les anciennes sessions Supabase
4. Vérifiez les règles CORS dans la console Firebase si vous rencontrez des problèmes d'accès

## Ressources utiles

- [Documentation Firebase Auth](https://firebase.google.com/docs/auth)
- [Guide d'intégration avec React](https://firebase.google.com/docs/auth/web/start)
- [Migration d'utilisateurs vers Firebase](https://firebase.google.com/docs/auth/admin/import-users)
