import { BellIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '@/hooks/useNotifications';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@/contexts/SearchContext';

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const { t } = useTranslation();
  // useNotifications agora depende do provider (assinado em App.tsx)
  const { unreadCount } = useNotifications();
  const { profile } = useProfile();
  const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/50 px-6 backdrop-blur-sm lg:px-8">
      <div className="flex-1 lg:pl-0 pl-12">
        {title && (
          <div>
            <h1 className="font-heading text-xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search - Desktop */}
        <div className="relative hidden md:block">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("Search tasks...")}
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-64 pl-9 shadow-none"
          />
        </div>

        {/* Notifications */}
        <Button variant="neumorphic" size="icon" className="relative" onClick={() => navigate('/notifications')}>
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>

        {/* User Avatar */}
        {profile?.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt="Avatar"
            className="h-10 w-10 rounded-full object-cover border border-primary shadow-lg cursor-pointer transition-transform hover:scale-105"
            style={{
              boxShadow: '0 2px 8px rgba(239, 108, 48, 0.3)',
            }}
            onClick={() => navigate('/settings')}
          />
        ) : (
          <div 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary cursor-pointer transition-transform hover:scale-105"
            style={{
              boxShadow: '0 2px 8px rgba(239, 108, 48, 0.3)',
            }}
            onClick={() => navigate('/settings')}
          >
            <span className="font-heading text-sm font-bold">{getInitials(profile?.fullName)}</span>
          </div>
        )}
      </div>
    </header>
  );
}
