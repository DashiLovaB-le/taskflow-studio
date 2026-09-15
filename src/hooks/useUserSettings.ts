import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface UserSettings {
  id: string;
  userId: string;
  theme: 'light' | 'dark';
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklySummary: boolean;
  createdAt: string;
  updatedAt: string;
}

function mapSettings(data: {
  id: string;
  theme: 'light' | 'dark';
  email_notifications: boolean;
  push_notifications: boolean;
  weekly_summary: boolean;
  created_at: string;
  updated_at: string;
}): UserSettings {
  return {
    id: data.id,
    userId: data.id,
    theme: data.theme,
    emailNotifications: data.email_notifications,
    pushNotifications: data.push_notifications,
    weeklySummary: data.weekly_summary,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('dashitask_settings')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSettings(mapSettings(data));
        } else {
          const { data: created, error: insertError } = await supabase
            .from('dashitask_settings')
            .insert({
              id: user.id,
              theme: 'light',
              email_notifications: true,
              push_notifications: true,
              weekly_summary: false,
            })
            .select('*')
            .single();
          if (insertError) throw insertError;
          if (created) setSettings(mapSettings(created));
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();

    const channel = supabase
      .channel('dashitask_settings_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'dashitask_settings',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) setSettings(mapSettings(payload.new as never));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const updateSettings = useCallback(
    async (updates: {
      theme?: 'light' | 'dark';
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      weeklySummary?: boolean;
    }) => {
      if (!user || !settings) return;

      setSettings((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          theme: updates.theme ?? prev.theme,
          emailNotifications: updates.emailNotifications ?? prev.emailNotifications,
          pushNotifications: updates.pushNotifications ?? prev.pushNotifications,
          weeklySummary: updates.weeklySummary ?? prev.weeklySummary,
        };
      });

      try {
        const updateData: Record<string, unknown> = {};
        if (updates.theme !== undefined) updateData.theme = updates.theme;
        if (updates.emailNotifications !== undefined)
          updateData.email_notifications = updates.emailNotifications;
        if (updates.pushNotifications !== undefined)
          updateData.push_notifications = updates.pushNotifications;
        if (updates.weeklySummary !== undefined) updateData.weekly_summary = updates.weeklySummary;

        const { error } = await supabase.from('dashitask_settings').update(updateData).eq('id', user.id);
        if (error) throw error;
      } catch (error) {
        const { data } = await supabase
          .from('dashitask_settings')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (data) setSettings(mapSettings(data));
        throw error;
      }
    },
    [user, settings],
  );

  return { settings, loading, updateSettings };
}
