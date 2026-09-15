import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { SunIcon, MoonIcon } from '@radix-ui/react-icons';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    try {
      if (isSignUp) {
        const result = await signUp(email, password);
        if (result.needsConfirmation) {
          setInfo(t('Check your email for confirmation'));
          return;
        }
        navigate('/dashboard');
      } else {
        await signIn(email, password);
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('An error occurred');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="sm" onClick={toggleTheme}>
          {theme === 'light' ? (
            <MoonIcon className="h-5 w-5" />
          ) : (
            <SunIcon className="h-5 w-5" />
          )}
        </Button>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/logo-animado-task.gif"
              alt="TaskDay"
              className="h-16 w-16"
            />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">{t('TaskDay')}</CardTitle>
            <CardDescription>
              {isSignUp ? t('Create your account') : t('Sign in to your account')}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('Email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t('Enter your email')}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('Password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder={t('Enter your password')}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {info && (
              <Alert>
                <AlertDescription>{info}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('Loading...') : isSignUp ? t('Create account') : t('Sign In')}
            </Button>
          </form>
          <div className="mt-4 space-y-2 text-center">
            {isSignUp ? (
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  setIsSignUp(false);
                  setError('');
                  setInfo('');
                }}
                className="text-sm"
              >
                {t('Already have an account? Sign in')}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsSignUp(true);
                  setError('');
                  setInfo('');
                }}
              >
                {t('Create account')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
