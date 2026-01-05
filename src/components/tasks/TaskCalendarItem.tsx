import React from 'react';
import { Task, TaskPriority, TaskStatus } from '@/types/task';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRelativeDate } from '@/lib/utils';
import {
  CalendarIcon,
  DotsVerticalIcon,
  CheckCircledIcon,
  TrashIcon,
  Pencil1Icon,
} from '@radix-ui/react-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

interface TaskCalendarItemProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: TaskStatus) => void;
}

export function TaskCalendarItem({ task, onEdit, onDelete, onStatusChange }: TaskCalendarItemProps) {
  const { t } = useTranslation();
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  const priorityLabels: Record<TaskPriority, string> = {
    high: t('High'),
    medium: t('Medium'),
    low: t('Low'),
  };

  const priorityColors: Record<TaskPriority, string> = {
    high: 'bg-destructive/10 text-destructive',
    medium: 'bg-warning/10 text-warning',
    low: 'bg-success/10 text-success',
  };

  const statusLabels: Record<TaskStatus, string> = {
    todo: t('To Do'),
    in_progress: t('In Progress'),
    done: t('Done'),
  };

  return (
    <div className="mb-1 last:mb-0">
      <div className={`flex items-center justify-between p-2 rounded-lg text-sm ${
        task.status === 'done' 
          ? 'bg-muted/50 text-muted-foreground' 
          : isOverdue 
            ? 'bg-destructive/10 text-destructive' 
            : 'bg-accent hover:bg-accent/80'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          {task.status === 'done' && (
            <CheckCircledIcon className="h-3 w-3 text-success flex-shrink-0" />
          )}
          <span className={`truncate ${task.status === 'done' ? 'line-through' : ''}`}>
            {task.title}
          </span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <DotsVerticalIcon className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit?.(task)}>
              <Pencil1Icon className="mr-2 h-4 w-4" />
              {t("Edit")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {task.status !== 'todo' && (
              <DropdownMenuItem onClick={() => onStatusChange?.(task.id, 'todo')}>
                {t("Move to To Do")}
              </DropdownMenuItem>
            )}
            {task.status !== 'in_progress' && (
              <DropdownMenuItem onClick={() => onStatusChange?.(task.id, 'in_progress')}>
                {t("Move to In Progress")}
              </DropdownMenuItem>
            )}
            {task.status !== 'done' && (
              <DropdownMenuItem onClick={() => onStatusChange?.(task.id, 'done')}>
                <CheckCircledIcon className="mr-2 h-4 w-4 text-success" />
                {t("Mark as Done")}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete?.(task.id)}
              className="text-destructive focus:text-destructive"
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              {t("Delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-center gap-2 mt-1 px-2">
        <Badge variant={task.priority} className={`h-5 text-xs ${priorityColors[task.priority]}`}>
          {priorityLabels[task.priority]}
        </Badge>
        {task.dueDate && (
          <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
            <CalendarIcon className="h-2.5 w-2.5" />
            <span>{formatRelativeDate(task.dueDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
}