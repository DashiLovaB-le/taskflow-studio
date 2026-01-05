import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
  iconClassName?: string;
}

export function StatsCard({ title, value, icon, trend, className, iconClassName }: StatsCardProps) {
  return (
    <Card hover className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="font-heading text-3xl font-bold text-foreground">{value}</p>
              {trend && (
                <span
                  className={cn(
                    "text-xs font-semibold",
                    trend.positive ? "text-success" : "text-destructive"
                  )}
                >
                  {trend.positive ? "+" : ""}{trend.value}%
                </span>
              )}
            </div>
          </div>
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl shadow-neumorphic-sm",
              iconClassName || "bg-primary/10 text-primary"
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
