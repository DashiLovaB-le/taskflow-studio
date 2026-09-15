import type { CalendarEvent } from '@/types/task';
import type { Task, TaskPriority, TaskStatus } from '@/types/task';

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_at: string | null;
  created_at: string;
  updated_at: string;
};

type EventRow = {
  id: string;
  title: string;
  notes: string | null;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  location: string | null;
  meeting_id: string | null;
  remind_minutes: number;
  created_at: string;
  updated_at: string;
};

export function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    status: row.status as TaskStatus,
    priority: row.priority as TaskPriority,
    dueDate: row.due_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapEvent(row: EventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes || undefined,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    allDay: Boolean(row.all_day),
    location: row.location || undefined,
    meetingId: row.meeting_id,
    remindMinutes: row.remind_minutes ?? 15,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
