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

// Configuration des options de persistance pour une session de 24 heures
const persistSessionOptions = {
  persistSession: true,
  autoRefreshToken: true,
  // Définir la durée de vie du cookie à 24 heures (en secondes)
  cookieOptions: {
    maxAge: 86400, // 24 heures en secondes
    sameSite: 'lax' as 'lax',
    secure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : false
  }
};

// On utilise uniquement les variables d'environement avec les options de persistance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: persistSessionOptions
});
