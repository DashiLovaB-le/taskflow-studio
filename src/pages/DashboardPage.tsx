import { PageWrapper } from '@/components/layout';
import { StatsCard, PriorityChart, StatusChart, ActivityChart } from '@/components/dashboard';
import { useTasks } from '@/hooks/useTasks';
import {
  CheckCircledIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  LayersIcon,
} from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { tasks, getStats } = useTasks();
  const stats = getStats();

  // Calculate chart data
  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: 'hsl(0, 84%, 60%)' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: 'hsl(38, 92%, 50%)' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: 'hsl(210, 100%, 50%)' },
  ].filter(d => d.value > 0);

  const statusData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length },
  ];

  // Mock weekly activity data
  const activityData = [
    { name: 'Mon', completed: 3 },
    { name: 'Tue', completed: 5 },
    { name: 'Wed', completed: 2 },
    { name: 'Thu', completed: 7 },
    { name: 'Fri', completed: 4 },
    { name: 'Sat', completed: 1 },
    { name: 'Sun', completed: 2 },
  ];

  return (
    <PageWrapper>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">{t("Dashboard")}</h1>
          <p className="text-muted-foreground mt-1">{t("Welcome back! Here's your task overview.")}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={t("Total Tasks")}
            value={stats.total}
            icon={<LayersIcon className="h-6 w-6" />}
            iconClassName="bg-primary/10 text-primary"
          />
          <StatsCard
            title={t("Completed")}
            value={stats.completed}
            icon={<CheckCircledIcon className="h-6 w-6" />}
            trend={{ value: 12, positive: true }}
            iconClassName="bg-success/10 text-success"
          />
          <StatsCard
            title={t("In Progress")}
            value={stats.pending}
            icon={<ClockIcon className="h-6 w-6" />}
            iconClassName="bg-info/10 text-info"
          />
          <StatsCard
            title={t("Overdue")}
            value={stats.overdue}
            icon={<ExclamationTriangleIcon className="h-6 w-6" />}
            iconClassName="bg-destructive/10 text-destructive"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ActivityChart data={activityData} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <PriorityChart data={priorityData} />
            <StatusChart data={statusData} />
          </div>
        </div>

        {/* Recent Tasks */}
        <div>
          <h2 className="font-heading text-xl font-semibold text-foreground mb-4">{t("Recent Tasks")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.slice(0, 6).map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-border bg-card p-4 shadow-neumorphic-sm hover:shadow-glow transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground line-clamp-1">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      task.priority === 'high'
                        ? 'bg-destructive'
                        : task.priority === 'medium'
                        ? 'bg-warning'
                        : 'bg-info'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
