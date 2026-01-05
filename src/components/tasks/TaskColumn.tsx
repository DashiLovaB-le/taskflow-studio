import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  count: number;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: TaskStatus) => void;
}

const statusColors: Record<TaskStatus, string> = {
  todo: 'bg-muted',
  in_progress: 'bg-info/20',
  done: 'bg-success/20',
};

const statusDots: Record<TaskStatus, string> = {
  todo: 'bg-muted-foreground',
  in_progress: 'bg-info',
  done: 'bg-success',
};

export function TaskColumn({ title, status, tasks, count, onEdit, onDelete, onStatusChange }: TaskColumnProps) {
  return (
    <div className="flex flex-col min-w-[320px] max-w-[360px] flex-1">
      {/* Header */}
      <div className={cn("flex items-center gap-2 rounded-xl p-3 mb-4", statusColors[status])}>
        <div className={cn("h-2.5 w-2.5 rounded-full", statusDots[status])} />
        <h3 className="font-heading font-semibold text-foreground">{title}</h3>
        <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-card text-xs font-medium text-muted-foreground shadow-neumorphic-sm">
          {count}
        </span>
      </div>

      {/* Tasks */}
      <div className="space-y-3 flex-1 overflow-auto custom-scrollbar pr-1">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-sm text-muted-foreground">No tasks here</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}
