/**
 * Script pour migrer les utilisateurs de Supabase vers Firebase
 * 
 * Ce script est un exemple et doit être adapté à votre environnement spécifique.
 * Il nécessite les SDK Admin de Supabase et Firebase, qui doivent être installés séparément.
 * 
 * Pour l'utiliser :
 * 1. npm install firebase-admin @supabase/supabase-js dotenv
 * 2. Configurez les variables d'environnement dans un fichier .env
 * 3. Exécutez le script avec Node.js : node migrate-users.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');
const fs = require('fs');

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Configuration Firebase
const serviceAccount = require('../firebase-service-account.json');

// Initialisation des clients
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * Récupère tous les utilisateurs de Supabase
 */
async function getSupabaseUsers() {
  try {
    // Récupérer les utilisateurs via l'API Supabase
    const { data, error } = await supabase.from('auth.users').select('*');
    
    if (error) {
      throw new Error(`Erreur lors de la récupération des utilisateurs Supabase: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Erreur:', error);
    return [];
  }
}

/**
 * Importe les utilisateurs dans Firebase
 */
async function importUsersToFirebase(users) {
  try {
    // Préparer les utilisateurs pour l'importation Firebase
    const firebaseUsers = users.map(user => ({
      uid: user.id,
      email: user.email,
      emailVerified: user.email_confirmed_at !== null,
      displayName: user.raw_user_meta_data?.full_name || '',
      photoURL: user.raw_user_meta_data?.avatar_url || '',
      disabled: user.banned_until !== null,
      metadata: {
        creationTime: user.created_at,
        lastSignInTime: user.last_sign_in_at || user.created_at
      },
      // Note: Les mots de passe ne peuvent pas être migrés directement
      // Les utilisateurs devront réinitialiser leur mot de passe
    }));

    // Importer les utilisateurs par lots de 1000 (limite Firebase)
    const batchSize = 1000;
    for (let i = 0; i < firebaseUsers.length; i += batchSize) {
      const batch = firebaseUsers.slice(i, i + batchSize);
      await admin.auth().importUsers(batch, {
        hash: {
          algorithm: 'BCRYPT'
        }
      });
      console.log(`Importé ${Math.min(i + batchSize, firebaseUsers.length)} / ${firebaseUsers.length} utilisateurs`);
    }

    return firebaseUsers.length;
  } catch (error) {
    console.error('Erreur lors de l\'importation des utilisateurs:', error);
    throw error;
  }
}

/**
 * Migre les rôles utilisateurs
 */
async function migrateUserRoles(users) {
  try {
    // Récupérer les rôles depuis Supabase
    const { data: roles, error } = await supabase.from('user_roles').select('*');
    
    if (error) {
      throw new Error(`Erreur lors de la récupération des rôles: ${error.message}`);
    }

    // Créer un fichier de mapping des rôles pour référence future
    const roleMapping = {};
    
    for (const role of roles) {
      roleMapping[role.user_id] = role.role;
      
      // Pour les administrateurs, définir une claim personnalisée dans Firebase
      if (role.role === 'admin') {
        await admin.auth().setCustomUserClaims(role.user_id, { admin: true });
        console.log(`Défini le rôle admin pour l'utilisateur ${role.user_id}`);
      }
    }

    // Sauvegarder le mapping des rôles dans un fichier JSON
    fs.writeFileSync('user-roles-mapping.json', JSON.stringify(roleMapping, null, 2));
    
    return roles.length;
  } catch (error) {
    console.error('Erreur lors de la migration des rôles:', error);
    throw error;
  }
}

/**
 * Fonction principale
 */
async function migrateUsers() {
  try {
    console.log('Début de la migration des utilisateurs...');
    
    // Récupérer les utilisateurs de Supabase
    const supabaseUsers = await getSupabaseUsers();
    console.log(`Récupéré ${supabaseUsers.length} utilisateurs de Supabase`);
    
    // Sauvegarder les utilisateurs dans un fichier JSON pour référence
    fs.writeFileSync('supabase-users-backup.json', JSON.stringify(supabaseUsers, null, 2));
    console.log('Sauvegarde des utilisateurs Supabase effectuée');
    
    // Importer les utilisateurs dans Firebase
    const importedCount = await importUsersToFirebase(supabaseUsers);
    console.log(`${importedCount} utilisateurs importés dans Firebase`);
    
    // Migrer les rôles utilisateurs
    const rolesCount = await migrateUserRoles(supabaseUsers);
    console.log(`${rolesCount} rôles utilisateurs migrés`);
    
    console.log('Migration terminée avec succès!');
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
  } finally {
    // Fermer les connexions
    admin.app().delete();
    process.exit(0);
  }
}

// Exécuter la migration
migrateUsers();
