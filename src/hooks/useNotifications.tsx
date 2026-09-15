import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export type Notification = {
  id: string;
  title: string;
  description?: string;
  isRead?: boolean;
  time?: string;
  kind?: 'manual' | 'event_soon' | 'task_due';
  sourceId?: string | null;
};

type NotificationsContextValue = {
  notifications: Notification[];
  markAllRead: () => void;
  markRead: (id: string) => void;
  addNotification: (n: {
    title: string;
    description?: string;
    kind?: Notification['kind'];
    sourceId?: string | null;
  }) => Promise<void>;
  clearNotifications: () => void;
  unreadCount: number;
};

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

function mapNotification(row: {
  id: string;
  title: string;
  description: string | null;
  is_read: boolean;
  created_at: string;
  kind?: string;
  source_id?: string | null;
}): Notification {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    isRead: row.is_read,
    time: formatTime(row.created_at),
    kind: (row.kind as Notification['kind']) || 'manual',
    sourceId: row.source_id ?? null,
  };
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const loadNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('dashitask_notifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotifications((data ?? []).map(mapNotification));
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();

    const channel = supabase
      .channel('dashitask_notifications_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dashitask_notifications' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications((prev) => {
              if (prev.some((item) => item.id === payload.new.id)) return prev;
              return [mapNotification(payload.new as never), ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setNotifications((prev) =>
              prev.map((item) =>
                item.id === payload.new.id ? mapNotification(payload.new as never) : item,
              ),
            );
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('dashitask_notifications')
        .update({ is_read: true })
        .eq('is_read', false);
      if (error) throw error;
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user]);

  const markRead = useCallback(async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('dashitask_notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user]);

  const addNotification = useCallback(async (n: {
    title: string;
    description?: string;
    kind?: Notification['kind'];
    sourceId?: string | null;
  }) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('dashitask_notifications')
        .insert({
          title: n.title,
          description: n.description ?? null,
          is_read: false,
          kind: n.kind ?? 'manual',
          source_id: n.sourceId ?? null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') return;
        throw error;
      }
      setNotifications((prev) => {
        if (prev.some((item) => item.id === data.id)) return prev;
        return [mapNotification(data), ...prev];
      });
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  }, [user]);

  const clearNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('dashitask_notifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationsContext.Provider
      value={{ notifications, markAllRead, markRead, addNotification, clearNotifications, unreadCount }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    return {
      notifications: [],
      markAllRead: () => {},
      markRead: () => {},
      addNotification: async () => {},
      clearNotifications: () => {},
      unreadCount: 0,
    };
  }
  return ctx;
}

function formatTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  if (diffInHours < 1) return 'agora';
  if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
  return `${Math.floor(diffInDays)}d`;
}
