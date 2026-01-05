import { PageWrapper } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';

export default function CalendarPage() {
  const { t } = useTranslation();

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">{t("Calendar")}</h1>
          <p className="text-muted-foreground mt-1">{t("View your tasks in calendar format")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {t("Coming Soon")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <CalendarIcon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                {t("Calendar View")}
              </h3>
              <p className="text-muted-foreground max-w-md">
                {t("The calendar feature is currently under development. Soon you'll be able to view and manage your tasks in a beautiful calendar interface.")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
