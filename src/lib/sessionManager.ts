import { supabase } from './supabaseClient';

/**
 * Service pour gérer la session utilisateur et le rafraîchissement automatique du token
 */
class SessionManager {
  private refreshInterval: number | null = null;
  private readonly REFRESH_INTERVAL_MS = 60 * 60 * 1000; // 1 heure en millisecondes
  private readonly SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

  /**
   * Initialise le gestionnaire de session
   */
  public initialize(): void {
    // Vérifier s'il y a une session active au démarrage
    this.checkSession();

    // Configurer un intervalle pour rafraîchir le token périodiquement
    this.startRefreshInterval();

    // Écouter les changements d'état d'authentification
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Événement d\'authentification:', event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Démarrer l'intervalle de rafraîchissement si ce n'est pas déjà fait
        this.startRefreshInterval();
      } else if (event === 'SIGNED_OUT') {
        // Arrêter l'intervalle de rafraîchissement
        this.stopRefreshInterval();
      }
    });
  }

  /**
   * Vérifie s'il y a une session active
   */
  private async checkSession(): Promise<void> {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        console.log('Session active détectée');
      } else {
        console.log('Aucune session active');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la session:', error);
    }
  }

  /**
   * Démarre l'intervalle de rafraîchissement du token
   */
  private startRefreshInterval(): void {
    // Arrêter l'intervalle existant s'il y en a un
    this.stopRefreshInterval();

    // Créer un nouvel intervalle
    this.refreshInterval = window.setInterval(async () => {
      try {
        console.log('Rafraîchissement du token...');
        const { error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('Erreur lors du rafraîchissement du token:', error);
        } else {
          console.log('Token rafraîchi avec succès');
        }
      } catch (error) {
        console.error('Erreur lors du rafraîchissement du token:', error);
      }
    }, this.REFRESH_INTERVAL_MS);

    console.log('Intervalle de rafraîchissement du token démarré');
  }

  /**
   * Arrête l'intervalle de rafraîchissement du token
   */
  private stopRefreshInterval(): void {
    if (this.refreshInterval !== null) {
      window.clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('Intervalle de rafraîchissement du token arrêté');
    }
  }

  /**
   * Force le rafraîchissement du token
   */
  public async refreshToken(): Promise<void> {
    try {
      console.log('Rafraîchissement manuel du token...');
      const { error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Erreur lors du rafraîchissement manuel du token:', error);
      } else {
        console.log('Token rafraîchi manuellement avec succès');
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement manuel du token:', error);
    }
  }
}

// Exporter une instance unique du gestionnaire de session
export const sessionManager = new SessionManager();
