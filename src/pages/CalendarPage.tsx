import { useState } from 'react';
import { PageWrapper } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { TaskCalendarItem } from '@/components/tasks/TaskCalendarItem';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTasks } from '@/hooks/useTasks';
import { Task } from '@/types/task';
import { CalendarIcon, PlusIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

export default function CalendarPage() {
  const { t } = useTranslation();
  const { tasks, updateTaskStatus, deleteTask, getStats } = useTasks();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Filtrar tarefas para a data selecionada
  const tasksForSelectedDate = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return (
      taskDate.getDate() === selectedDate.getDate() &&
      taskDate.getMonth() === selectedDate.getMonth() &&
      taskDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  // Agrupar tarefas por status para a data selecionada
  const todoTasks = tasksForSelectedDate.filter(task => task.status === 'todo');
  const inProgressTasks = tasksForSelectedDate.filter(task => task.status === 'in_progress');
  const doneTasks = tasksForSelectedDate.filter(task => task.status === 'done');

  const handleEditTask = (task: Task) => {
    // Abrir modal de edição de tarefa
    // Esta funcionalidade pode ser implementada posteriormente
    console.log('Editar tarefa:', task);
  };

  const handleStatusChange = (id: string, status: 'todo' | 'in_progress' | 'done') => {
    updateTaskStatus(id, status);
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
  };

  const stats = getStats();

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">{t("Calendar")}</h1>
          <p className="text-muted-foreground mt-1">{t("View your tasks in calendar format")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendário */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    {format(selectedDate, 'MMMM yyyy', { locale: pt })}
                  </div>
                  <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
                    {t("Today")}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => setSelectedDate(date || new Date())}
                  locale={pt}
                  className="p-0"
                  modifiers={{
                    today: new Date(),
                    selected: selectedDate,
                  }}
                  modifiersClassNames={{
                    today: "bg-primary/10 text-primary",
                    selected: "bg-primary text-primary-foreground",
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Painel de tarefas para a data selecionada */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <div className="font-heading text-xl font-bold text-foreground">
                      {format(selectedDate, 'd MMMM yyyy', { locale: pt })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tasksForSelectedDate.length} {tasksForSelectedDate.length === 1 ? t('task') : t('tasks')}
                    </div>
                  </div>
                  <Button size="sm">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {t("New Task")}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                  {tasksForSelectedDate.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="h-12 w-12 mx-auto text-muted" />
                      <p className="mt-2">{t("No tasks scheduled for this day")}</p>
                      <p className="text-sm mt-1">{t("Add a task with a due date to see it here")}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todoTasks.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{t("To Do")}</Badge>
                            <span className="text-sm text-muted-foreground">({todoTasks.length})</span>
                          </div>
                          <div className="space-y-2">
                            {todoTasks.map(task => (
                              <TaskCalendarItem
                                key={task.id}
                                task={task}
                                onEdit={handleEditTask}
                                onDelete={handleDeleteTask}
                                onStatusChange={handleStatusChange}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {inProgressTasks.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{t("In Progress")}</Badge>
                            <span className="text-sm text-muted-foreground">({inProgressTasks.length})</span>
                          </div>
                          <div className="space-y-2">
                            {inProgressTasks.map(task => (
                              <TaskCalendarItem
                                key={task.id}
                                task={task}
                                onEdit={handleEditTask}
                                onDelete={handleDeleteTask}
                                onStatusChange={handleStatusChange}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {doneTasks.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{t("Done")}</Badge>
                            <span className="text-sm text-muted-foreground">({doneTasks.length})</span>
                          </div>
                          <div className="space-y-2">
                            {doneTasks.map(task => (
                              <TaskCalendarItem
                                key={task.id}
                                task={task}
                                onEdit={handleEditTask}
                                onDelete={handleDeleteTask}
                                onStatusChange={handleStatusChange}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Estatísticas de tarefas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">{t("Total Tasks")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-success">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">{t("Completed")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-warning">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">{t("Pending")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
              <div className="text-sm text-muted-foreground">{t("Overdue")}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
