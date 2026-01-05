import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  DashboardIcon,
  ListBulletIcon,
  CalendarIcon,
  GearIcon,
  SunIcon,
  MoonIcon,
  HamburgerMenuIcon,
  Cross1Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const navItems = [
  { path: '/dashboard', labelKey: 'Dashboard', icon: DashboardIcon },
  { path: '/tasks', labelKey: 'Tasks', icon: ListBulletIcon },
  { path: '/calendar', labelKey: 'Calendar', icon: CalendarIcon },
  { path: '/settings', labelKey: 'Settings', icon: GearIcon },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const NavContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <>
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-6", collapsed && "justify-center")}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-neumorphic-sm">
          <span className="font-heading text-xl font-bold">T</span>
        </div>
        {!collapsed && <span className="font-heading text-xl font-bold text-foreground">TaskDay</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                collapsed ? "justify-center px-3" : "",
                isActive
                  ? "bg-accent text-accent-foreground shadow-neumorphic-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="border-t border-sidebar-border p-4">
        <Button
          variant="neumorphic"
          size="lg"
          onClick={toggleTheme}
          className={cn("w-full justify-start gap-3", collapsed && "justify-center px-3")}
        >
          {theme === 'light' ? (
            <>
              <MoonIcon className="h-5 w-5" />
              {!collapsed && t("Dark Mode")}
            </>
          ) : (
            <>
              <SunIcon className="h-5 w-5" />
              {!collapsed && t("Light Mode")}
            </>
          )}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="neumorphic"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <Cross1Icon className="h-5 w-5" /> : <HamburgerMenuIcon className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border shadow-neumorphic transition-all duration-300",
          collapsed ? "w-16" : "w-52",
          className
        )}
      >
        <NavContent collapsed={collapsed} />
        
        {/* Collapse Button */}
        <div className="border-t border-sidebar-border p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full"
          >
            {collapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
          </Button>
        </div>
      </aside>
    </>
  );
}
