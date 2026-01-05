import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export type Notification = {
  id: string;
  title: string;
  description?: string;
  isRead?: boolean;
  time?: string;
};

type NotificationsContextValue = {
  notifications: Notification[];
  markAllRead: () => void;
  markRead: (id: string) => void;
  addNotification: (n: Omit<Notification, 'id'|'time'|'isRead'>) => void;
  clearNotifications: () => void;
  unreadCount: number;
};

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  // Load notifications from Supabase
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const loadNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('taskday_notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedNotifications: Notification[] = data.map(notification => ({
          id: notification.id,
          title: notification.title,
          description: notification.description,
          isRead: notification.is_read,
          time: formatTime(notification.created_at),
        }));

        setNotifications(formattedNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'taskday_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotification: Notification = {
              id: payload.new.id,
              title: payload.new.title,
              description: payload.new.description,
              isRead: payload.new.is_read,
              time: formatTime(payload.new.created_at),
            };
            setNotifications(prev => [newNotification, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev => prev.map(notification =>
              notification.id === payload.new.id
                ? {
                    ...notification,
                    title: payload.new.title,
                    description: payload.new.description,
                    isRead: payload.new.is_read,
                    time: formatTime(payload.new.created_at),
                  }
                : notification
            ));
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => prev.filter(notification => notification.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('taskday_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const markRead = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('taskday_notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const addNotification = async (n: Omit<Notification, 'id'|'time'|'isRead'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('taskday_notifications')
        .insert({
          user_id: user.id,
          title: n.title,
          description: n.description,
          is_read: false,
        })
        .select()
        .single();

      if (error) throw error;

      const newNotification: Notification = {
        id: data.id,
        title: data.title,
        description: data.description,
        isRead: data.is_read,
        time: formatTime(data.created_at),
      };

      setNotifications(prev => [newNotification, ...prev]);
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const clearNotifications = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('taskday_notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationsContext.Provider value={{ notifications, markAllRead, markRead, addNotification, clearNotifications, unreadCount }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    // Return default values if not within provider
    return {
      notifications: [],
      markAllRead: () => {},
      markRead: () => {},
      addNotification: () => {},
      clearNotifications: () => {},
      unreadCount: 0,
    };
  }
  return ctx;
}

// Helper function to format time
function formatTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  if (diffInHours < 1) {
    return 'agora';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h`;
  } else {
    return `${Math.floor(diffInDays)}d`;
  }
}