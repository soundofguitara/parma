import React from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNotifications, Notification, NotificationType } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NotificationMenu: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  } = useNotifications();
  const navigate = useNavigate();

  // Fonction pour formater la date
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return 'À l\'instant';
    } else if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} h`;
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return format(date, 'dd MMM yyyy', { locale: fr });
    }
  };

  // Fonction pour obtenir la couleur en fonction du type de notification
  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'info':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'error':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  // Fonction pour obtenir l'icône en fonction du type de notification
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <div className="h-2 w-2 rounded-full bg-green-500" />;
      case 'info':
        return <div className="h-2 w-2 rounded-full bg-blue-500" />;
      case 'warning':
        return <div className="h-2 w-2 rounded-full bg-yellow-500" />;
      case 'error':
        return <div className="h-2 w-2 rounded-full bg-red-500" />;
      default:
        return <div className="h-2 w-2 rounded-full bg-gray-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative cursor-pointer">
          <Bell size={20} className="text-pharma-text-muted hover:text-white transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-pharma-accent-red rounded-full text-[10px] flex items-center justify-center text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-pharma-blue-dark border-pharma-blue-light" align="end">
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel className="text-white font-medium">Notifications</DropdownMenuLabel>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-pharma-text-light hover:text-white"
                onClick={markAllAsRead}
              >
                <Check size={14} className="mr-1" />
                Tout marquer comme lu
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-pharma-text-light hover:text-white"
                onClick={clearAllNotifications}
              >
                <Trash2 size={14} className="mr-1" />
                Effacer tout
              </Button>
            )}
          </div>
        </div>
        <DropdownMenuSeparator className="bg-pharma-blue-light/50" />

        <div className="max-h-[300px] overflow-y-auto py-1">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-pharma-text-light">
              <p>Aucune notification</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-2 m-1 rounded-md border text-sm relative",
                  notification.read ? "opacity-70" : "",
                  getNotificationColor(notification.type)
                )}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="font-medium">{notification.title}</div>
                    <p className="text-xs mt-1">{notification.message}</p>
                    {notification.action && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 mt-1 text-xs"
                        onClick={() => {
                          markAsRead(notification.id);
                          // Si la notification a un serverId, elle vient du serveur et a une route d'action
                          if (notification.serverId && notification.action?.label) {
                            // Utiliser la route stockée dans la notification ou une route par défaut
                            const route = notification.data?.action_route || '/batches';
                            navigate(route);
                          } else {
                            // Sinon, utiliser la fonction onClick définie localement
                            notification.action?.onClick();
                          }
                        }}
                      >
                        {notification.action.label}
                      </Button>
                    )}
                    <div className="text-[10px] mt-1 opacity-70">
                      {formatTimestamp(notification.timestamp)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check size={14} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => removeNotification(notification.id)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationMenu;
