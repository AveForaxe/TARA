import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  exiting?: boolean;
}

interface NotificationContextType {
  showNotification: (type: NotificationType, title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, exiting: true } : n));
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 300); // Match CSS animation duration
  }, []);

  const showNotification = useCallback((type: NotificationType, title: string, message: string) => {
    // Prevent duplicate active notifications with the same message
    setNotifications((prev) => {
      if (prev.some(n => n.message === message && !n.exiting)) return prev;
      
      const id = Math.random().toString(36).substring(2, 9);
      const newNotif = { id, type, title, message };
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        removeNotification(id);
      }, 5000);

      return [...prev, newNotif];
    });
  }, [removeNotification]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'notifications';
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="notification-container">
        {notifications.map((n) => (
          <div key={n.id} className={`tara-toast toast-${n.type} ${n.exiting ? 'fade-out' : ''}`}>
            <div className="toast-icon">
              <span className="material-icons-round">{getIcon(n.type)}</span>
            </div>
            <div className="toast-content">
              <span className="toast-title">{n.title}</span>
              <span className="toast-message">{n.message}</span>
            </div>
            <button className="toast-close" onClick={() => removeNotification(n.id)}>
              <span className="material-icons-round" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
