import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  SunIcon,
  MoonIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExitIcon,
} from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { APP_NAV } from './nav';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border shadow-neumorphic transition-all duration-300',
        collapsed ? 'w-16' : 'w-52',
        className,
      )}
    >
      <div className={cn('flex items-center gap-3 px-4 py-6', collapsed && 'justify-center')}>
        <img
          src="/logo-animado-task.gif"
          alt="TaskDay"
          className="h-10 w-10 object-contain"
        />
        {!collapsed && (
          <span className="font-heading text-xl font-bold text-foreground">TaskDay</span>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {APP_NAV.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300',
                collapsed ? 'justify-center px-3' : '',
                isActive
                  ? 'bg-accent text-accent-foreground shadow-neumorphic-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4 space-y-2">
        <Button
          variant="neumorphic"
          size="lg"
          onClick={toggleTheme}
          className={cn('w-full justify-start gap-3', collapsed && 'justify-center px-3')}
        >
          {theme === 'light' ? (
            <>
              <MoonIcon className="h-5 w-5" />
              {!collapsed && t('Dark Mode')}
            </>
          ) : (
            <>
              <SunIcon className="h-5 w-5" />
              {!collapsed && t('Light Mode')}
            </>
          )}
        </Button>

        <Button
          variant="neumorphic"
          size="lg"
          onClick={handleSignOut}
          className={cn('w-full justify-start gap-3', collapsed && 'justify-center px-3')}
        >
          <ExitIcon className="h-5 w-5" />
          {!collapsed && t('Logout')}
        </Button>
      </div>

      <div className="border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full"
        >
          {collapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </aside>
  );
}
