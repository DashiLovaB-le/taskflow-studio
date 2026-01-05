import { useState, useCallback, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load tasks from Supabase
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const loadTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('taskday_tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedTasks: Task[] = data.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status as TaskStatus,
          priority: task.priority as TaskPriority,
          dueDate: task.due_date,
          isAiGenerated: task.is_ai_generated,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
        }));

        setTasks(formattedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'taskday_tasks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTask: Task = {
              id: payload.new.id,
              title: payload.new.title,
              description: payload.new.description,
              status: payload.new.status as TaskStatus,
              priority: payload.new.priority as TaskPriority,
              dueDate: payload.new.due_date,
              isAiGenerated: payload.new.is_ai_generated,
              createdAt: payload.new.created_at,
              updatedAt: payload.new.updated_at,
            };
            setTasks(prev => [newTask, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(task =>
              task.id === payload.new.id
                ? {
                    ...task,
                    title: payload.new.title,
                    description: payload.new.description,
                    status: payload.new.status as TaskStatus,
                    priority: payload.new.priority as TaskPriority,
                    dueDate: payload.new.due_date,
                    isAiGenerated: payload.new.is_ai_generated,
                    updatedAt: payload.new.updated_at,
                  }
                : task
            ));
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(task => task.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('taskday_tasks')
        .insert({
          user_id: user.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          due_date: task.dueDate,
          is_ai_generated: task.isAiGenerated,
        })
        .select()
        .single();

      if (error) throw error;

      const newTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status as TaskStatus,
        priority: data.priority as TaskPriority,
        dueDate: data.due_date,
        isAiGenerated: data.is_ai_generated,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }, [user]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (!user) return;

    try {
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
      if (updates.isAiGenerated !== undefined) updateData.is_ai_generated = updates.isAiGenerated;

      const { error } = await supabase
        .from('taskday_tasks')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }, [user]);

  const deleteTask = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('taskday_tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }, [user]);

  const updateTaskStatus = useCallback(async (id: string, status: TaskStatus) => {
    await updateTask(id, { status });
  }, [updateTask]);

  const getTasksByStatus = useCallback((status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  const getStats = useCallback(() => {
    const now = new Date();
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'done').length,
      pending: tasks.filter(t => t.status !== 'done').length,
      overdue: tasks.filter(t => {
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
    getStats,
  };
}
