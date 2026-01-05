import { useState, useCallback, useEffect } from 'react';
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

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load settings from Supabase
  useEffect(() => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('taskday_user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSettings({
            id: data.id,
            userId: data.user_id,
            theme: data.theme,
            emailNotifications: data.email_notifications,
            pushNotifications: data.push_notifications,
            weeklySummary: data.weekly_summary,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          });
        } else {
          // Se as configurações não existem, criar novas
          const { data: newSettings, error: insertError } = await supabase
            .from('taskday_user_settings')
            .insert({
              user_id: user.id,
              theme: 'light',
              email_notifications: true,
              push_notifications: true,
              weekly_summary: false,
            })
            .select('*')
            .single();

          if (insertError) throw insertError;

          if (newSettings) {
            setSettings({
              id: newSettings.id,
              userId: newSettings.user_id,
              theme: newSettings.theme,
              emailNotifications: newSettings.email_notifications,
              pushNotifications: newSettings.push_notifications,
              weeklySummary: newSettings.weekly_summary,
              createdAt: newSettings.created_at,
              updatedAt: newSettings.updated_at,
            });
          }
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        // Criar configurações padrão em caso de erro
        if (user) {
          setSettings({
            id: crypto.randomUUID(),
            userId: user.id,
            theme: 'light',
            emailNotifications: true,
            pushNotifications: true,
            weeklySummary: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadSettings();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('settings_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'taskday_user_settings',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            setSettings({
              id: payload.new.id,
              userId: payload.new.user_id,
              theme: payload.new.theme,
              emailNotifications: payload.new.email_notifications,
              pushNotifications: payload.new.push_notifications,
              weeklySummary: payload.new.weekly_summary,
              createdAt: payload.new.created_at,
              updatedAt: payload.new.updated_at,
            });
          }
        }
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

      // Atualização otimista
      setSettings((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          theme: updates.theme !== undefined ? updates.theme : prev.theme,
          emailNotifications:
            updates.emailNotifications !== undefined
              ? updates.emailNotifications
              : prev.emailNotifications,
          pushNotifications:
            updates.pushNotifications !== undefined
              ? updates.pushNotifications
              : prev.pushNotifications,
          weeklySummary:
            updates.weeklySummary !== undefined
              ? updates.weeklySummary
              : prev.weeklySummary,
        };
      });

      try {
        const updateData: any = {};
        if (updates.theme !== undefined) updateData.theme = updates.theme;
        if (updates.emailNotifications !== undefined)
          updateData.email_notifications = updates.emailNotifications;
        if (updates.pushNotifications !== undefined)
          updateData.push_notifications = updates.pushNotifications;
        if (updates.weeklySummary !== undefined)
          updateData.weekly_summary = updates.weeklySummary;

        const { error } = await supabase
          .from('taskday_user_settings')
          .update(updateData)
          .eq('user_id', user.id);

        if (error) throw error;
      } catch (error) {
        console.error('Erro ao atualizar configurações:', error);
        // Reverter em caso de erro
        const { data } = await supabase
          .from('taskday_user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data) {
          setSettings({
            id: data.id,
            userId: data.user_id,
            theme: data.theme,
            emailNotifications: data.email_notifications,
            pushNotifications: data.push_notifications,
            weeklySummary: data.weekly_summary,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          });
        }
        throw error;
      }
    },
    [user, settings]
  );

  return {
    settings,
    loading,
    updateSettings,
  };
}
