import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileTopHeader } from './MobileTopHeader';
import { RemindersWatcher } from '@/hooks/useReminders';

interface LayoutProps {
  title?: string;
  subtitle?: string;
}

export function Layout({ title, subtitle }: LayoutProps) {
  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden">
      <RemindersWatcher />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title={title} subtitle={subtitle} />
        <MobileTopHeader />
        <main className="app-mobile-main flex-1 overflow-auto custom-scrollbar px-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))] pt-4 lg:px-8 lg:pb-8 lg:pt-6">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
