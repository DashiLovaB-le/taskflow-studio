import { useEffect } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { useNotifications } from '@/hooks/useNotifications';
import { useTasks } from '@/hooks/useTasks';
import { useUserSettings } from '@/hooks/useUserSettings';
import { formatTimeInFuso } from '@/lib/fuso';

export function useReminders() {
  const { events } = useEvents();
  const { tasks } = useTasks();
  const { notifications, addNotification } = useNotifications();
  const { settings } = useUserSettings();

  useEffect(() => {
    if (settings && settings.pushNotifications === false) return;

    const tick = async () => {
      const now = Date.now();

      for (const event of events) {
        const start = new Date(event.startsAt).getTime();
        if (Number.isNaN(start)) continue;
        const fireAt = start - event.remindMinutes * 60 * 1000;
        const windowEnd = start + 2 * 60 * 1000;
        if (now < fireAt || now >= windowEnd) continue;
        const exists = notifications.some(
          (item) => item.kind === 'event_soon' && item.sourceId === event.id,
        );
        if (exists) continue;
        const when = event.allDay ? 'hoje' : formatTimeInFuso(event.startsAt);
        await addNotification({
          title: `Lembrete: ${event.title}`,
          description: when,
          kind: 'event_soon',
          sourceId: event.id,
        });
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(`Lembrete: ${event.title}`, { body: when });
        }
      }

      for (const task of tasks) {
        if (!task.dueDate || task.status === 'done') continue;
        const due = new Date(task.dueDate).getTime();
        if (Number.isNaN(due) || due > now) continue;
        const exists = notifications.some(
          (item) => item.kind === 'task_due' && item.sourceId === task.id,
        );
        if (exists) continue;
        await addNotification({
          title: `Tarefa venceu: ${task.title}`,
          kind: 'task_due',
          sourceId: task.id,
        });
      }
    };

    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [events, tasks, notifications, settings, addNotification]);
}

export function RemindersWatcher() {
  useReminders();
  return null;
}
