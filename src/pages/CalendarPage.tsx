import { useMemo, useState } from 'react';
import { PageWrapper } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { EventModal, TaskCalendarItem, TaskModal } from '@/components/tasks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEvents } from '@/hooks/useEvents';
import { useTasks } from '@/hooks/useTasks';
import { CalendarEvent, Task } from '@/types/task';
import { CalendarIcon, PlusIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { dateKeyInFuso, formatTimeInFuso, sameDayInFuso } from '@/lib/fuso';

function dateFromKey(key: string): Date {
  return new Date(`${key}T12:00:00-03:00`);
}

export default function CalendarPage() {
  const { t } = useTranslation();
  const { tasks, updateTask, addTask, updateTaskStatus, deleteTask } = useTasks();
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const eventsForDay = events
    .filter((item) => sameDayInFuso(item.startsAt, selectedDate) || (
      item.allDay
      && dateKeyInFuso(item.startsAt) <= dateKeyInFuso(selectedDate)
      && dateKeyInFuso(item.endsAt) >= dateKeyInFuso(selectedDate)
    ))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const tasksForDay = tasks.filter((task) => task.dueDate && sameDayInFuso(task.dueDate, selectedDate));

  const eventDays = useMemo(
    () => events.map((item) => dateFromKey(dateKeyInFuso(item.startsAt))).filter((d) => !Number.isNaN(d.getTime())),
    [events],
  );
  const taskDays = useMemo(
    () =>
      tasks
        .filter((task) => task.dueDate)
        .map((task) => dateFromKey(dateKeyInFuso(task.dueDate as string)))
        .filter((d) => !Number.isNaN(d.getTime())),
    [tasks],
  );

  const todoTasks = tasksForDay.filter((task) => task.status === 'todo');
  const inProgressTasks = tasksForDay.filter((task) => task.status === 'in_progress');
  const doneTasks = tasksForDay.filter((task) => task.status === 'done');

  const handleSaveEvent = async (payload: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, payload);
        toast.success(t('Event updated'));
      } else {
        await addEvent(payload);
        toast.success(t('Event created'));
      }
      setEditingEvent(null);
    } catch (error) {
      console.error(error);
      toast.error(t('An error occurred'));
    }
  };

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
      console.error(error);
      toast.error(t('An error occurred'));
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="max-lg:hidden">
          <h1 className="font-heading text-3xl font-bold text-foreground">{t('Calendar')}</h1>
          <p className="text-muted-foreground mt-1">{t('Events and task due dates')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    {format(selectedDate, 'MMMM yyyy', { locale: pt })}
                  </div>
                  <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
                    {t('Today')}
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
                    hasEvent: eventDays,
                    hasTask: taskDays,
                  }}
                  modifiersClassNames={{
                    today: 'bg-primary/10 text-primary',
                    selected: 'bg-primary text-primary-foreground',
                    hasEvent: 'font-bold underline decoration-primary',
                    hasTask: 'italic',
                  }}
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <div className="font-heading text-xl font-bold text-foreground">
                      {format(selectedDate, 'd MMMM yyyy', { locale: pt })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {eventsForDay.length} {t('events')} · {tasksForDay.length} {t('tasks')}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="max-lg:hidden"
                    onClick={() => {
                      setEditingEvent(null);
                      setEventModalOpen(true);
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {t('New Event')}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[min(28rem,calc(100dvh-22rem))] lg:h-[calc(100vh-280px)] pr-4">
                  {eventsForDay.length === 0 && tasksForDay.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="h-12 w-12 mx-auto text-muted" />
                      <p className="mt-2">{t('Nothing on this day')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {eventsForDay.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{t('Events')}</Badge>
                          </div>
                          <div className="space-y-2">
                            {eventsForDay.map((item) => (
                              <div
                                key={item.id}
                                className="w-full rounded-lg border border-border bg-card p-3 hover:bg-accent/50"
                              >
                                <button
                                  type="button"
                                  className="w-full text-left"
                                  onClick={() => {
                                    setEditingEvent(item);
                                    setEventModalOpen(true);
                                  }}
                                >
                                  <div className="font-medium text-foreground">{item.title}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {item.allDay
                                      ? t('All day')
                                      : `${formatTimeInFuso(item.startsAt)}–${formatTimeInFuso(item.endsAt)}`}
                                    {item.location ? ` · ${item.location}` : ''}
                                  </div>
                                </button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-destructive mt-2 px-0 h-auto"
                                  onClick={async () => {
                                    try {
                                      await deleteEvent(item.id);
                                      toast.success(t('Event deleted'));
                                    } catch {
                                      toast.error(t('An error occurred'));
                                    }
                                  }}
                                >
                                  {t('Delete')}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {todoTasks.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{t('To Do')}</Badge>
                          </div>
                          {todoTasks.map((task) => (
                            <TaskCalendarItem
                              key={task.id}
                              task={task}
                              onEdit={(row) => {
                                setEditingTask(row);
                                setTaskModalOpen(true);
                              }}
                              onDelete={deleteTask}
                              onStatusChange={updateTaskStatus}
                            />
                          ))}
                        </div>
                      )}
                      {inProgressTasks.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{t('In Progress')}</Badge>
                          </div>
                          {inProgressTasks.map((task) => (
                            <TaskCalendarItem
                              key={task.id}
                              task={task}
                              onEdit={(row) => {
                                setEditingTask(row);
                                setTaskModalOpen(true);
                              }}
                              onDelete={deleteTask}
                              onStatusChange={updateTaskStatus}
                            />
                          ))}
                        </div>
                      )}
                      {doneTasks.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{t('Done')}</Badge>
                          </div>
                          {doneTasks.map((task) => (
                            <TaskCalendarItem
                              key={task.id}
                              task={task}
                              onEdit={(row) => {
                                setEditingTask(row);
                                setTaskModalOpen(true);
                              }}
                              onDelete={deleteTask}
                              onStatusChange={updateTaskStatus}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <EventModal
        open={eventModalOpen}
        onOpenChange={(open) => {
          setEventModalOpen(open);
          if (!open) setEditingEvent(null);
        }}
        event={editingEvent}
        defaultDate={selectedDate}
        onSave={handleSaveEvent}
      />
      <Button
        type="button"
        size="icon"
        className="fixed z-40 h-14 w-14 rounded-full shadow-glow lg:hidden right-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom))]"
        onClick={() => {
          setEditingEvent(null);
          setEventModalOpen(true);
        }}
        aria-label={t('New Event')}
      >
        <PlusIcon className="h-6 w-6" />
      </Button>
      <TaskModal
        open={taskModalOpen}
        onOpenChange={(open) => {
          setTaskModalOpen(open);
          if (!open) setEditingTask(null);
        }}
        task={editingTask}
        onSave={handleSaveTask}
      />
    </PageWrapper>
  );
}
