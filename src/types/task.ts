export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  notes?: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  location?: string;
  meetingId?: string | null;
  remindMinutes: number;
  createdAt: string;
  updatedAt: string;
}
