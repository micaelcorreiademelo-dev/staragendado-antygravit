import React from 'react';
import { Bell } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { NotificationsPopover } from './NotificationsPopover';
import { Notification } from '../types';

interface ContextType {
    notifications: Notification[];
    isNotificationsOpen: boolean;
    setIsNotificationsOpen: (value: boolean | ((val: boolean) => boolean)) => void;
    setNotifications: (notifications: Notification[]) => void;
}

export const AdminNotificationBell: React.FC = () => {
    const context = useOutletContext<ContextType>();

    // Se o componente for usado fora do Outlet context (ex: debug), evitar crash
    if (!context) return null;

    const { notifications, isNotificationsOpen, setIsNotificationsOpen, setNotifications } = context;

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAllAsRead = () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsNotificationsOpen((o) => !o)}
                className="text-text-muted relative p-2.5 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-border/50"
                title="Notificações"
            >
                <Bell size={20} />
                {unreadCount > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500/50" />}
            </button>
            {isNotificationsOpen && (
                <NotificationsPopover
                    notifications={notifications}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    onNotificationClick={() => { }}
                    onClose={() => setIsNotificationsOpen(false)}
                />
            )}
        </div>
    );
};
