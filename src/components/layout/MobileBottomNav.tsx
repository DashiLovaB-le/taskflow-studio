import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { APP_NAV } from './nav';

export function MobileBottomNav() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 lg:hidden"
      aria-label="Navegação principal"
    >
      <div className="pointer-events-auto mx-auto max-w-lg px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="relative mb-1 overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/85 shadow-neumorphic backdrop-blur-xl supports-[backdrop-filter]:bg-card/70">
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <ul className="grid grid-cols-4 gap-0.5 px-1.5 py-1.5">
            {APP_NAV.map((item) => {
              const active =
                location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      'group relative flex flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-2 transition-all duration-300 active:scale-95',
                      active
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-300',
                        active
                          ? 'bg-primary/12 shadow-neumorphic-sm ring-1 ring-primary/20'
                          : 'bg-transparent group-active:bg-secondary/80',
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-[1.15rem] w-[1.15rem] transition-transform duration-300',
                          active && 'scale-110',
                        )}
                      />
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-semibold tracking-wide',
                        active ? 'text-primary' : 'text-muted-foreground',
                      )}
                    >
                      {t(item.labelKey)}
                    </span>
                    <span
                      className={cn(
                        'absolute -bottom-0.5 h-1 w-1 rounded-full bg-primary transition-all duration-300',
                        active ? 'opacity-100 scale-100' : 'opacity-0 scale-0',
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
