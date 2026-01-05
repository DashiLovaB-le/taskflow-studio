import { useState } from 'react';
import { PageWrapper } from '@/components/layout';
import { TaskColumn, TaskModal } from '@/components/tasks';
import { Button } from '@/components/ui/button';
import { useTasks } from '@/hooks/useTasks';
import { useSearch } from '@/contexts/SearchContext';
import { Task, TaskStatus } from '@/types/task';
import { PlusIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function TasksPage() {
  const { t } = useTranslation();
  const { tasks, addTask, updateTask, deleteTask, updateTaskStatus, getTasksByStatus } = useTasks();
  const { searchQuery } = useSearch();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todoTasks = filteredTasks.filter(t => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress');
  const doneTasks = filteredTasks.filter(t => t.status === 'done');

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData);
        toast.success(t('Task updated successfully!'));
      } else {
        await addTask(taskData);
        toast.success(t('Task created successfully!'));
      }
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error(t('An error occurred'));
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      toast.success(t('Task deleted successfully!'));
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(t('An error occurred'));
    }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try {
      await updateTaskStatus(id, status);
      if (status === 'done') {
        toast.success(t('Task completed! 🎉'));
      }
    } catch (error) {
      console.error('Error changing task status:', error);
      toast.error(t('An error occurred'));
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">{t("Tasks")}</h1>
            <p className="text-muted-foreground mt-1">{t("Manage and organize your work")}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => {
              setEditingTask(null);
              setModalOpen(true);
            }}>
              <PlusIcon className="mr-2 h-4 w-4" />
              {t("New Task")}
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
          <TaskColumn
            title={t("To Do")}
            status="todo"
            tasks={todoTasks}
            count={todoTasks.length}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
          <TaskColumn
            title={t("In Progress")}
            status="in_progress"
            tasks={inProgressTasks}
            count={inProgressTasks.length}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
          <TaskColumn
            title={t("Done")}
            status="done"
            tasks={doneTasks}
            count={doneTasks.length}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditingTask(null);
        }}
        task={editingTask}
        onSave={handleSaveTask}
      />
    </PageWrapper>
  );
}
