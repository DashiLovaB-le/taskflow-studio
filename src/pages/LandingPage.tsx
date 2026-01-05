import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon, CheckCircledIcon, LightningBoltIcon, BarChartIcon } from '@radix-ui/react-icons';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative container mx-auto px-6 py-20 lg:py-32">
          {/* Nav */}
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-neumorphic-sm">
                <span className="font-heading text-xl font-bold">T</span>
              </div>
              <span className="font-heading text-xl font-bold text-foreground">TaskDay</span>
            </div>
            <Link to="/dashboard">
              <Button>
                Get Started
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </nav>

          {/* Hero Content */}
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="space-y-4 animate-blur-in">
              <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground shadow-neumorphic-sm">
                <LightningBoltIcon className="h-4 w-4" />
                Powered by AI
              </span>
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-tight">
                Manage Tasks with{' '}
                <span className="gradient-text">Clarity</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                TaskDay helps you organize, prioritize, and accomplish your work with an intuitive interface and AI-powered suggestions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-blur-in" style={{ animationDelay: '0.2s' }}>
              <Link to="/dashboard">
                <Button size="xl" className="shadow-glow">
                  Start Free Today
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/tasks">
                <Button variant="outline" size="xl">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-24 grid gap-6 md:grid-cols-3 animate-blur-in" style={{ animationDelay: '0.4s' }}>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-neumorphic hover:shadow-glow transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                <CheckCircledIcon className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                Task Management
              </h3>
              <p className="text-muted-foreground">
                Create, organize, and track your tasks with an intuitive Kanban board interface.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-neumorphic hover:shadow-glow transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <LightningBoltIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                AI Suggestions
              </h3>
              <p className="text-muted-foreground">
                Get smart task suggestions based on your workflow and pending work.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-neumorphic hover:shadow-glow transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center mb-4">
                <BarChartIcon className="h-6 w-6 text-info" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-muted-foreground">
                Visualize your productivity with beautiful charts and insights.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2026 TaskDay. Built with ❤️ for productivity lovers.</p>
        </div>
      </footer>
    </div>
  );
}
