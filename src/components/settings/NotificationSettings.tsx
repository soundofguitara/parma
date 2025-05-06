import React from 'react';
import { useNotifications, NotificationPreferences } from '@/contexts/NotificationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Bell, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

const NotificationSettings: React.FC = () => {
  const { 
    preferences, 
    updatePreferences, 
    notifications, 
    clearAllNotifications, 
    markAllAsRead,
    unreadCount
  } = useNotifications();

  const handleToggleChange = (key: keyof NotificationPreferences) => {
    updatePreferences({ [key]: !preferences[key] });
    
    // Afficher un toast de confirmation
    toast.info(
      <div className="flex flex-col gap-1">
        <h3 className="font-bold">Préférences mises à jour</h3>
        <p className="text-sm">
          Les notifications {key === 'enabled' ? 'ont été' : `pour "${getNotificationTypeName(key)}" ont été`} {preferences[key] ? 'désactivées' : 'activées'}.
        </p>
      </div>
    );
  };

  const handleMaxNotificationsChange = (value: number[]) => {
    updatePreferences({ maxNotifications: value[0] });
  };

  const handleMaxNotificationsCommit = () => {
    toast.info(
      <div className="flex flex-col gap-1">
        <h3 className="font-bold">Préférences mises à jour</h3>
        <p className="text-sm">
          Le nombre maximum de notifications a été défini à {preferences.maxNotifications}.
        </p>
      </div>
    );
  };

  const handleClearAllNotifications = () => {
    if (notifications.length === 0) {
      toast.info("Il n'y a aucune notification à effacer.");
      return;
    }
    
    clearAllNotifications();
    toast.success("Toutes les notifications ont été effacées.");
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) {
      toast.info("Il n'y a aucune notification non lue.");
      return;
    }
    
    markAllAsRead();
    toast.success("Toutes les notifications ont été marquées comme lues.");
  };

  // Fonction pour obtenir le nom lisible du type de notification
  const getNotificationTypeName = (key: keyof NotificationPreferences): string => {
    switch (key) {
      case 'batchCompleted':
        return 'Lots complétés';
      case 'batchDelayed':
        return 'Lots en retard';
      case 'newPlanning':
        return 'Nouvelles planifications';
      case 'enabled':
        return 'Toutes les notifications';
      default:
        return key;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Préférences de notification
          </CardTitle>
          <CardDescription>
            Configurez vos préférences pour les notifications dans l'application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Activer/désactiver toutes les notifications */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications-enabled" className="text-base">Activer les notifications</Label>
              <p className="text-sm text-pharma-text-muted">
                Activer ou désactiver toutes les notifications dans l'application
              </p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={preferences.enabled}
              onCheckedChange={() => handleToggleChange('enabled')}
            />
          </div>

          <div className="border-t border-pharma-blue-light/30 pt-4">
            <h3 className="text-sm font-medium mb-4">Types de notifications</h3>
            
            {/* Notifications de lots complétés */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label htmlFor="batch-completed" className="text-base">Lots complétés</Label>
                <p className="text-sm text-pharma-text-muted">
                  Notifications lorsqu'un lot est complété
                </p>
              </div>
              <Switch
                id="batch-completed"
                checked={preferences.batchCompleted}
                onCheckedChange={() => handleToggleChange('batchCompleted')}
                disabled={!preferences.enabled}
              />
            </div>
            
            {/* Notifications de lots en retard */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label htmlFor="batch-delayed" className="text-base">Lots en retard</Label>
                <p className="text-sm text-pharma-text-muted">
                  Notifications lorsqu'un lot est en retard
                </p>
              </div>
              <Switch
                id="batch-delayed"
                checked={preferences.batchDelayed}
                onCheckedChange={() => handleToggleChange('batchDelayed')}
                disabled={!preferences.enabled}
              />
            </div>
            
            {/* Notifications de nouvelles planifications */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="new-planning" className="text-base">Nouvelles planifications</Label>
                <p className="text-sm text-pharma-text-muted">
                  Notifications lorsqu'une nouvelle planification est créée
                </p>
              </div>
              <Switch
                id="new-planning"
                checked={preferences.newPlanning}
                onCheckedChange={() => handleToggleChange('newPlanning')}
                disabled={!preferences.enabled}
              />
            </div>
          </div>

          <div className="border-t border-pharma-blue-light/30 pt-4">
            <h3 className="text-sm font-medium mb-4">Paramètres avancés</h3>
            
            {/* Nombre maximum de notifications */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="max-notifications" className="text-base">Nombre maximum de notifications</Label>
                <span className="text-sm font-medium">{preferences.maxNotifications}</span>
              </div>
              <Slider
                id="max-notifications"
                defaultValue={[preferences.maxNotifications]}
                min={10}
                max={100}
                step={5}
                onValueChange={handleMaxNotificationsChange}
                onValueCommit={handleMaxNotificationsCommit}
                disabled={!preferences.enabled}
              />
              <p className="text-sm text-pharma-text-muted mt-2">
                Définir le nombre maximum de notifications à conserver
              </p>
            </div>
            
            {/* Actions sur les notifications */}
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="flex items-center gap-1"
              >
                <Check size={16} />
                Marquer tout comme lu
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearAllNotifications}
                disabled={notifications.length === 0}
                className="flex items-center gap-1 text-pharma-accent-red hover:text-pharma-accent-red"
              >
                <Trash2 size={16} />
                Effacer toutes les notifications
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
