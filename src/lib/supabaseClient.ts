
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Erreur: Les variables d'environnement Supabase ne sont pas définies." +
    "\nAssurez-vous d'avoir créé un fichier .env.local avec:" +
    "\nVITE_SUPABASE_URL=votre_url_supabase" +
    "\nVITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase"
  );
  throw new Error("Supabase environment variables missing.");
}

// On utilise uniquement les variables d'environement (plus de valeurs par défaut !)
// Cela évite toute mauvaise connexion si jamais accidentellement les valeurs sont absentes
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

