import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mapEvent } from '@/lib/mappers';
import { supabase } from '@/lib/supabase';
import { CalendarEvent } from '@/types/task';

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('dashitask_events')
          .select('*')
          .order('starts_at', { ascending: true });

        if (error) throw error;
        setEvents((data ?? []).map(mapEvent));
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };

    load();

    const channel = supabase
      .channel('dashitask_events_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dashitask_events' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setEvents((prev) => {
              if (prev.some((item) => item.id === payload.new.id)) return prev;
              return [...prev, mapEvent(payload.new as never)].sort(
                (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
              );
            });
          } else if (payload.eventType === 'UPDATE') {
            setEvents((prev) =>
              prev
                .map((item) => (item.id === payload.new.id ? mapEvent(payload.new as never) : item))
                .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
            );
          } else if (payload.eventType === 'DELETE') {
            setEvents((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addEvent = useCallback(async (input: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase
      .from('dashitask_events')
      .insert({
        title: input.title,
        notes: input.notes ?? null,
        starts_at: input.startsAt,
        ends_at: input.endsAt,
        all_day: input.allDay,
        location: input.location ?? null,
        meeting_id: input.meetingId ?? null,
        remind_minutes: input.remindMinutes,
      })
      .select()
      .single();

    if (error) throw error;
    const mapped = mapEvent(data);
    setEvents((prev) =>
      [...prev.filter((item) => item.id !== mapped.id), mapped].sort(
        (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      ),
    );
    return mapped;
  }, []);

  const updateEvent = useCallback(async (id: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));

    const updateData: Record<string, unknown> = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.notes !== undefined) updateData.notes = updates.notes ?? null;
    if (updates.startsAt !== undefined) updateData.starts_at = updates.startsAt;
    if (updates.endsAt !== undefined) updateData.ends_at = updates.endsAt;
    if (updates.allDay !== undefined) updateData.all_day = updates.allDay;
    if (updates.location !== undefined) updateData.location = updates.location ?? null;
    if (updates.remindMinutes !== undefined) updateData.remind_minutes = updates.remindMinutes;

    try {
      const { error } = await supabase.from('dashitask_events').update(updateData).eq('id', id);
      if (error) throw error;
    } catch (error) {
      const { data } = await supabase.from('dashitask_events').select('*').eq('id', id).single();
      if (data) {
        setEvents((prev) => prev.map((item) => (item.id === id ? mapEvent(data) : item)));
      }
      throw error;
    }
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    const snapshot = events.find((item) => item.id === id);
    setEvents((prev) => prev.filter((item) => item.id !== id));
    try {
      const { error } = await supabase.from('dashitask_events').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      if (snapshot) {
        setEvents((prev) =>
          [...prev, snapshot].sort(
            (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
          ),
        );
      }
      throw error;
    }
  }, [events]);

  return { events, loading, addEvent, updateEvent, deleteEvent };
}
