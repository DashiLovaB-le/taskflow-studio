import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface LayoutProps {
  title?: string;
  subtitle?: string;
}

export function Layout({ title, subtitle }: LayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-auto custom-scrollbar p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
