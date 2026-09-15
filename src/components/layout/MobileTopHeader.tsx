import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BellIcon, Cross1Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNotifications } from '@/hooks/useNotifications';
import { useProfile } from '@/hooks/useProfile';
import { useSearch } from '@/contexts/SearchContext';
import { cn } from '@/lib/utils';
import { titleKeyForPath } from './nav';

export function MobileTopHeader() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { profile } = useProfile();
  const { searchQuery, setSearchQuery } = useSearch();
  const [searchOpen, setSearchOpen] = useState(false);

  const title = t(titleKeyForPath(location.pathname));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('Good morning');
    if (hour < 18) return t('Good afternoon');
    return t('Good evening');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'D';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 lg:hidden pt-[env(safe-area-inset-top)]">
      <div className="border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65">
        <div className="flex h-14 items-center gap-2 px-4">
          {searchOpen ? (
            <div className="flex flex-1 items-center gap-2 animate-fade-in">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoFocus
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('Search tasks...')}
                  className="h-10 rounded-2xl border-border/60 bg-card pl-9 shadow-neumorphic-sm"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-2xl"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
              >
                <Cross1Icon className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-muted-foreground">
                  {getGreeting()}
                </p>
                <h1 className="truncate font-heading text-lg font-bold leading-tight text-foreground">
                  {title}
                </h1>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-2xl bg-card/80 shadow-neumorphic-sm"
                onClick={() => setSearchOpen(true)}
                aria-label={t('Search tasks...')}
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-2xl bg-card/80 shadow-neumorphic-sm"
                onClick={() => navigate('/notifications')}
                aria-label={t('Notifications')}
              >
                <BellIcon className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>

              <button
                type="button"
                onClick={() => navigate('/settings')}
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/30',
                  'bg-primary/10 text-primary shadow-[0_2px_10px_rgba(239,108,48,0.28)]',
                  'transition-transform active:scale-95',
                )}
                aria-label={t('Settings')}
              >
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-heading text-xs font-bold">
                    {getInitials(profile?.fullName)}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
