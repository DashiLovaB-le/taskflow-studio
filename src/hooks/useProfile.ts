import { useState, useCallback, useEffect } from 'react';
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

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load profile from Supabase
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('taskday_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProfile({
            id: data.id,
            email: data.email,
            fullName: data.full_name,
            avatarUrl: data.avatar_url,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          });
        } else {
          // Se o perfil não existe, criar um novo
          const { data: newProfile, error: insertError } = await supabase
            .from('taskday_profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: null,
              avatar_url: null,
            })
            .select('*')
            .single();

          if (insertError) throw insertError;

          if (newProfile) {
            setProfile({
              id: newProfile.id,
              email: newProfile.email,
              fullName: newProfile.full_name,
              avatarUrl: newProfile.avatar_url,
              createdAt: newProfile.created_at,
              updatedAt: newProfile.updated_at,
            });
          }
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        // Criar um perfil padrão em caso de erro
        if (user) {
          setProfile({
            id: user.id,
            email: user.email,
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

    // Subscribe to real-time changes
    const channel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'taskday_profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            setProfile({
              id: payload.new.id,
              email: payload.new.email,
              fullName: payload.new.full_name,
              avatarUrl: payload.new.avatar_url,
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

  const uploadAvatar = useCallback(async (file: File) => {
    if (!user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('taskday-avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data } = supabase.storage
        .from('taskday-avatars')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      // Atualizar perfil com a nova URL
      await updateProfile({ avatarUrl });

      return avatarUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      throw error;
    }
  }, [user]);

  const updateProfile = useCallback(async (updates: { fullName?: string; avatarUrl?: string }) => {
    if (!user) return;

    // Atualização otimista
    setProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        fullName: updates.fullName !== undefined ? updates.fullName : prev.fullName,
        avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : prev.avatarUrl,
      };
    });

    try {
      const updateData: any = {};
      if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
      if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;

      const { error } = await supabase
        .from('taskday_profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      // Reverter em caso de erro
      const { data } = await supabase
        .from('taskday_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          avatarUrl: data.avatar_url,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      }
      throw error;
    }
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
  };
}
