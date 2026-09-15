import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

function mapProfile(data: {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}): UserProfile {
  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const updateProfile = useCallback(
    async (updates: { fullName?: string; avatarUrl?: string }) => {
      if (!user) return;

      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          fullName: updates.fullName !== undefined ? updates.fullName : prev.fullName,
          avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : prev.avatarUrl,
        };
      });

      try {
        const updateData: Record<string, unknown> = {};
        if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
        if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;

        const { error } = await supabase.from('dashitask_profiles').update(updateData).eq('id', user.id);
        if (error) throw error;
      } catch (error) {
        const { data } = await supabase
          .from('dashitask_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (data) setProfile(mapProfile(data));
        throw error;
      }
    },
    [user],
  );

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('dashitask_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProfile(mapProfile(data));
        } else {
          const { data: created, error: insertError } = await supabase
            .from('dashitask_profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: null,
              avatar_url: null,
            })
            .select('*')
            .single();
          if (insertError) throw insertError;
          if (created) setProfile(mapProfile(created));
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        if (user) {
          setProfile({
            id: user.id,
            email: user.email ?? '',
            fullName: null,
            avatarUrl: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();

    const channel = supabase
      .channel('dashitask_profiles_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'dashitask_profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) setProfile(mapProfile(payload.new as never));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('dashitask_avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('dashitask_avatars').getPublicUrl(filePath);
      await updateProfile({ avatarUrl: data.publicUrl });
      return data.publicUrl;
    },
    [user, updateProfile],
  );

  return { profile, loading, updateProfile, uploadAvatar };
}
