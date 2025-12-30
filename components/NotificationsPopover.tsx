import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Notification } from '../types';

interface NotificationsPopoverProps {
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onNotificationClick: (id: string) => void;
  onClose: () => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  notifications,
  onMarkAllAsRead,
  onNotificationClick,
  onClose
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute top-full mt-2 right-0 w-80 bg-surface border border-border rounded-xl shadow-lg z-50 animate-in fade-in-0 zoom-in-95">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h3 className="font-bold text-white">Notificações</h3>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
          >
            <CheckCheck size={14} />
            Marcar todas como lidas
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => onNotificationClick(notif.id)}
              className="p-4 border-b border-border/50 hover:bg-white/5 cursor-pointer flex items-start gap-3 transition-colors"
            >
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
              )}
              <div className={`flex-1 ${notif.read ? 'ml-5' : ''}`}>
                <p className="font-semibold text-white text-sm">{notif.title}</p>
                <p className="text-xs text-text-muted mt-1 line-clamp-2">{notif.message}</p>
                <p className="text-xs text-text-muted/50 mt-2">{new Date(notif.timestamp).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-text-muted text-sm">
            <Bell size={32} className="mx-auto mb-2 opacity-50" />
            Nenhuma notificação por aqui.
          </div>
        )}
      </div>
    </div>
  );
};
