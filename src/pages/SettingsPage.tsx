import { PageWrapper } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/useTheme';
import { SunIcon, MoonIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <PageWrapper>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">{t("Settings")}</h1>
          <p className="text-muted-foreground mt-1">{t("Manage your account and preferences")}</p>
        </div>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Profile")}</CardTitle>
            <CardDescription>{t("Update your personal information")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-neumorphic">
                <span className="font-heading text-2xl font-bold">JD</span>
              </div>
              <div>
                <Button variant="outline" size="sm">{t("Change Avatar")}</Button>
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t("Full Name")}</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("Email")}</Label>
                <Input id="email" type="email" defaultValue="john@example.com" />
              </div>
            </div>
            <Button>{t("Save Changes")}</Button>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Appearance")}</CardTitle>
            <CardDescription>{t("Customize how TaskDay looks")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'light' ? (
                  <SunIcon className="h-5 w-5 text-warning" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-info" />
                )}
                <div>
                  <p className="font-medium text-foreground">{t("Dark Mode")}</p>
                  <p className="text-sm text-muted-foreground">
                    {theme === 'light' ? t("Currently using light mode") : t("Currently using dark mode")}
                  </p>
                </div>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Notifications")}</CardTitle>
            <CardDescription>{t("Configure how you receive notifications")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{t("Email Notifications")}</p>
                <p className="text-sm text-muted-foreground">{t("Receive email updates about your tasks")}</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{t("Push Notifications")}</p>
                <p className="text-sm text-muted-foreground">{t("Get notified about upcoming deadlines")}</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{t("Weekly Summary")}</p>
                <p className="text-sm text-muted-foreground">{t("Receive a weekly productivity report")}</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
