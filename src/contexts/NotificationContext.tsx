import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Batch } from '@/types';
import { notificationService, ServerNotification } from '@/services/notificationService';
import { useAuth } from '@/contexts/FirebaseAuthContext';

// Types pour les notifications
export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
  data?: any; // Données supplémentaires (comme les détails d'un lot)
  action?: {
    label: string;
    onClick: () => void;
  };
  serverId?: string; // ID de la notification dans la base de données
  userId?: string | null; // ID de l'utilisateur ou null pour les notifications globales
}

// Types pour les préférences de notification
export interface NotificationPreferences {
  enabled: boolean;
  batchCompleted: boolean;
  batchDelayed: boolean;
  newPlanning: boolean;
  maxNotifications: number; // Nombre maximum de notifications à conserver
}

// Valeurs par défaut pour les préférences
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  batchCompleted: true,
  batchDelayed: true,
  newPlanning: true,
  maxNotifications: 50,
};

// Interface pour le contexte
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'serverId' | 'userId'>, type?: string) => void;
  addGlobalNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'serverId' | 'userId'>, type?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updatePreferences: (newPreferences: Partial<NotificationPreferences>) => void;
  syncNotifications: () => Promise<void>;
}

// Clés pour le localStorage
const STORAGE_KEYS = {
  NOTIFICATIONS: 'pharma-vignette-notifications',
  PREFERENCES: 'pharma-vignette-notification-preferences',
};

// Fonction pour sérialiser les notifications pour le localStorage
const serializeNotifications = (notifications: Notification[]): string => {
  return JSON.stringify(notifications.map(notification => ({
    ...notification,
    timestamp: notification.timestamp.toISOString(),
    // Supprimer la fonction onClick qui ne peut pas être sérialisée
    action: notification.action ? { label: notification.action.label } : undefined,
  })));
};

// Fonction pour désérialiser les notifications depuis le localStorage
const deserializeNotifications = (data: string): Notification[] => {
  try {
    const parsed = JSON.parse(data);
    return parsed.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp),
      // Recréer une fonction vide pour onClick
      action: item.action ? { ...item.action, onClick: () => {} } : undefined,
    }));
  } catch (error) {
    console.error('Erreur lors de la désérialisation des notifications:', error);
    return [];
  }
};

// Créer le contexte avec des valeurs par défaut
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  preferences: DEFAULT_NOTIFICATION_PREFERENCES,
  addNotification: () => {},
  addGlobalNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  removeNotification: () => {},
  clearAllNotifications: () => {},
  updatePreferences: () => {},
  syncNotifications: async () => {},
});

// Hook personnalisé pour utiliser le contexte
export const useNotifications = () => useContext(NotificationContext);

// Fournisseur du contexte
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const { user } = useAuth();

  // Charger les notifications et les préférences depuis le localStorage au démarrage
  useEffect(() => {
    // Charger les préférences
    const savedPreferences = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (savedPreferences) {
      try {
        const parsedPreferences = JSON.parse(savedPreferences);
        setPreferences(prev => ({ ...prev, ...parsedPreferences }));
      } catch (error) {
        console.error('Erreur lors du chargement des préférences de notification:', error);
      }
    }

    // Charger les notifications locales
    const savedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (savedNotifications) {
      const loadedNotifications = deserializeNotifications(savedNotifications);
      setNotifications(loadedNotifications);
    }
  }, []);

  // Synchroniser les notifications avec le serveur lorsque l'utilisateur se connecte
  useEffect(() => {
    if (user) {
      syncNotifications();
    }
  }, [user]);

  // Mettre à jour le compteur de notifications non lues
  useEffect(() => {
    const count = notifications.filter(notification => !notification.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Sauvegarder les notifications dans le localStorage lorsqu'elles changent
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, serializeNotifications(notifications));
    } else {
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    }
  }, [notifications]);

  // Sauvegarder les préférences dans le localStorage lorsqu'elles changent
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  }, [preferences]);

  // Synchroniser les notifications avec le serveur
  const syncNotifications = async () => {
    if (!user) return;

    try {
      const serverNotifications = await notificationService.getUserNotifications(user.uid);

      // Convertir les notifications du serveur au format local
      const convertedNotifications: Notification[] = serverNotifications.map((serverNotif: any) => {
        return {
          id: `server-${serverNotif.id}`,
          serverId: serverNotif.id,
          userId: serverNotif.user_id,
          title: serverNotif.title,
          message: serverNotif.message,
          type: serverNotif.type as NotificationType,
          timestamp: new Date(serverNotif.timestamp),
          read: serverNotif.read,
          data: serverNotif.data,
          action: serverNotif.action_label ? {
            label: serverNotif.action_label,
            onClick: () => {} // Fonction vide, sera remplacée dans le composant NotificationMenu
          } : undefined
        };
      });

      // Fusionner avec les notifications locales
      // On garde les notifications locales qui n'ont pas d'équivalent serveur
      const localOnlyNotifications = notifications.filter(
        notification => !notification.serverId
      );

      // Combiner et trier par date
      const mergedNotifications = [...convertedNotifications, ...localOnlyNotifications]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, preferences.maxNotifications);

      setNotifications(mergedNotifications);
    } catch (error) {
      console.error('Erreur lors de la synchronisation des notifications:', error);
    }
  };

  // Ajouter une nouvelle notification pour l'utilisateur courant
  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'serverId' | 'userId'>, type?: string) => {
    // Vérifier si les notifications sont activées
    if (!preferences.enabled) return;

    // Vérifier si ce type spécifique de notification est activé
    if (type) {
      const prefKey = type as keyof NotificationPreferences;
      if (prefKey in preferences && !preferences[prefKey]) return;
    }

    // Créer une notification locale temporaire
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false,
    };

    // Ajouter la notification localement
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      return updated.slice(0, preferences.maxNotifications);
    });

    // Si l'utilisateur est connecté, ajouter également la notification au serveur
    if (user) {
      try {
        // Extraire les données pour le serveur
        const serverNotification: ServerNotification = {
          title: notification.title,
          message: notification.message,
          type: notification.type,
          data: notification.data,
          action_label: notification.action?.label,
          action_route: notification.action?.label ? '/batches' : undefined // Route par défaut pour les actions
        };

        await notificationService.createNotification(serverNotification, user.uid);

        // Synchroniser pour obtenir l'ID du serveur
        await syncNotifications();
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la notification au serveur:', error);
      }
    }
  };

  // Ajouter une notification globale pour tous les utilisateurs
  const addGlobalNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'serverId' | 'userId'>, type?: string) => {
    // Vérifier si les notifications sont activées
    if (!preferences.enabled) return;

    // Vérifier si ce type spécifique de notification est activé
    if (type) {
      const prefKey = type as keyof NotificationPreferences;
      if (prefKey in preferences && !preferences[prefKey]) return;
    }

    // Créer une notification locale temporaire
    const id = `global-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false,
      userId: null // Marquer comme notification globale
    };

    // Ajouter la notification localement
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      return updated.slice(0, preferences.maxNotifications);
    });

    try {
      // Extraire les données pour le serveur
      const serverNotification: ServerNotification = {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        data: notification.data,
        action_label: notification.action?.label,
        action_route: notification.action?.label ? '/batches' : undefined // Route par défaut pour les actions
      };

      await notificationService.createGlobalNotification(serverNotification);

      // Synchroniser pour obtenir l'ID du serveur si l'utilisateur est connecté
      if (user) {
        await syncNotifications();
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la notification globale:', error);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (id: string) => {
    // Trouver la notification
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;

    // Mettre à jour localement
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );

    // Si c'est une notification du serveur et que l'utilisateur est connecté, mettre à jour sur le serveur
    if (notification.serverId && user) {
      try {
        await notificationService.markAsRead(notification.serverId, user.uid);
      } catch (error) {
        console.error('Erreur lors du marquage de la notification comme lue sur le serveur:', error);
      }
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    // Mettre à jour localement
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );

    // Si l'utilisateur est connecté, mettre à jour sur le serveur
    if (user) {
      try {
        await notificationService.markAllAsRead(user.uid);
      } catch (error) {
        console.error('Erreur lors du marquage de toutes les notifications comme lues sur le serveur:', error);
      }
    }
  };

  // Supprimer une notification
  const removeNotification = async (id: string) => {
    // Trouver la notification
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;

    // Supprimer localement
    setNotifications(prev => prev.filter(n => n.id !== id));

    // Si c'est une notification du serveur et que l'utilisateur est connecté, supprimer sur le serveur
    if (notification.serverId && user) {
      try {
        await notificationService.deleteNotification(notification.serverId, user.uid);
      } catch (error) {
        console.error('Erreur lors de la suppression de la notification sur le serveur:', error);
      }
    }
  };

  // Supprimer toutes les notifications
  const clearAllNotifications = async () => {
    // Supprimer localement
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);

    // Si l'utilisateur est connecté, supprimer sur le serveur
    if (user) {
      try {
        await notificationService.deleteAllNotifications(user.uid);
      } catch (error) {
        console.error('Erreur lors de la suppression de toutes les notifications sur le serveur:', error);
      }
    }
  };

  // Mettre à jour les préférences de notification
  const updatePreferences = (newPreferences: Partial<NotificationPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPreferences };
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
      return updated;
    });
  };

  // Valeur du contexte
  const value = {
    notifications,
    unreadCount,
    preferences,
    addNotification,
    addGlobalNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    updatePreferences,
    syncNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
