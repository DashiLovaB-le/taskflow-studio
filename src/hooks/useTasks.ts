import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mapTask } from '@/lib/mappers';
import { supabase } from '@/lib/supabase';
import { Task, TaskPriority, TaskStatus } from '@/types/task';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const loadTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('dashitask_tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTasks((data ?? []).map(mapTask));
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();

    const channel = supabase
      .channel('dashitask_tasks_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dashitask_tasks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => {
              if (prev.some((task) => task.id === payload.new.id)) return prev;
              return [mapTask(payload.new as never), ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((task) => (task.id === payload.new.id ? mapTask(payload.new as never) : task)),
            );
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((task) => task.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase
      .from('dashitask_tasks')
      .insert({
        title: task.title,
        description: task.description ?? null,
        status: task.status,
        priority: task.priority,
        due_at: task.dueDate ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    const mapped = mapTask(data);
    setTasks((prev) => (prev.some((row) => row.id === mapped.id) ? prev : [mapped, ...prev]));
    return mapped;
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates } : task)));

    const updateData: Record<string, unknown> = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description ?? null;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.dueDate !== undefined) updateData.due_at = updates.dueDate ?? null;

    try {
      const { error } = await supabase.from('dashitask_tasks').update(updateData).eq('id', id);
      if (error) throw error;
    } catch (error) {
      const { data } = await supabase.from('dashitask_tasks').select('*').eq('id', id).single();
      if (data) {
        setTasks((prev) => prev.map((task) => (task.id === id ? mapTask(data) : task)));
      }
      throw error;
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const snapshot = tasks.find((task) => task.id === id);
    setTasks((prev) => prev.filter((task) => task.id !== id));
    try {
      const { error } = await supabase.from('dashitask_tasks').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      if (snapshot) setTasks((prev) => [snapshot, ...prev]);
      throw error;
    }
  }, [tasks]);

  const updateTaskStatus = useCallback(
    async (id: string, status: TaskStatus) => {
      await updateTask(id, { status });
    },
    [updateTask],
  );

  const getTasksByStatus = useCallback(
    (status: TaskStatus) => tasks.filter((task) => task.status === status),
    [tasks],
  );

  const filterTasksByDateRange = useCallback(
    (startDate: string | null, endDate: string | null) => {
      return tasks.filter((task) => {
        if (!task.dueDate) return true;
        const taskDate = new Date(task.dueDate);
        if (startDate) {
          const start = new Date(`${startDate}T00:00:00-03:00`);
          if (taskDate < start) return false;
        }
        if (endDate) {
          const end = new Date(`${endDate}T23:59:59-03:00`);
          if (taskDate > end) return false;
        }
        return true;
      });
    },
    [tasks],
  );

  const getStats = useCallback(() => {
    const now = new Date();
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'done').length,
      pending: tasks.filter((t) => t.status !== 'done').length,
      overdue: tasks.filter((t) => {
        if (!t.dueDate || t.status === 'done') return false;
        return new Date(t.dueDate) < now;
      }).length,
    };
  }, [tasks]);

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getTasksByStatus,
    filterTasksByDateRange,
    getStats,
  };
}

export type { TaskPriority };
