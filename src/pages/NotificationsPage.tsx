import { useState } from 'react';
import { PageWrapper } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BellIcon, CheckIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';

type Notification = {
  id: string;
  title: string;
  description?: string;
  isRead?: boolean;
  time?: string;
};

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'New comment on your task', description: 'Alice comentou na tarefa "Design new landing page"', isRead: false, time: '2h' },
    { id: '2', title: 'Deployment successful', description: 'A versão v1.2 foi implantada', isRead: false, time: '1d' },
    { id: '3', title: 'Weekly summary ready', description: 'Seu resumo semanal está disponível', isRead: true, time: '3d' },
  ]);

  const markAllRead = () => setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
  const markRead = (id: string) => setNotifications((prev) => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">{t('Notifications')}</h1>
            <p className="text-muted-foreground mt-1">{t('Notifications Center')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={markAllRead}>{t('Mark all as read')}</Button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">{t('No notifications')}</CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {notifications.map((n) => (
              <Card key={n.id} className={`p-4 ${n.isRead ? 'opacity-60' : ''}`}>
                <CardHeader className="flex items-start gap-3 p-4">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <BellIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="font-medium text-foreground">{n.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{n.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-muted-foreground">{n.time}</span>
                    {!n.isRead && (
                      <Button size="sm" variant="ghost" onClick={() => markRead(n.id)}>
                        <CheckIcon className="mr-2 h-4 w-4" />
                        {t('Mark as read')}
                      </Button>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
