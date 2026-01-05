import React from 'react';
import { Task, TaskPriority, TaskStatus } from '@/types/task';
import { Card, CardContent } from '@/components/ui/card';
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

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: TaskStatus) => void;
  draggable?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange, draggable }: TaskCardProps) {
  const { t } = useTranslation();
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  const priorityLabels: Record<TaskPriority, string> = {
    high: t('High'),
    medium: t('Medium'),
    low: t('Low'),
  };

  const statusLabels: Record<TaskStatus, string> = {
    todo: t('To Do'),
    in_progress: t('In Progress'),
    done: t('Done'),
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: task.id, from: task.status }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (_e: React.DragEvent) => {
    // noop for now
  };

  return (
    <Card
      hover
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      onDragEnd={draggable ? handleDragEnd : undefined}
      className={`group relative transition-all duration-300 ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            {/* Title & Status */}
            <div className="flex items-center gap-2">
              {task.status === 'done' && (
                <CheckCircledIcon className="h-4 w-4 text-success shrink-0" />
              )}
              <h3 className={`font-medium text-foreground line-clamp-1 ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </h3>
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant={task.priority}>{priorityLabels[task.priority]}</Badge>
              
              {task.dueDate && (
                <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                  <CalendarIcon className="h-3 w-3" />
                  <span>{formatRelativeDate(task.dueDate)}</span>
                </div>
              )}

              {task.isAiGenerated && (
                <Badge variant="outline" className="text-xs">
                  ✨ AI
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <DotsVerticalIcon className="h-4 w-4" />
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
      </CardContent>
    </Card>
  );
}
