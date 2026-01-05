import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from '@/components/ui/button';
import { HomeIcon } from '@radix-ui/react-icons';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="text-center space-y-6 animate-blur-in">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl" />
          <h1 className="relative font-heading text-9xl font-extrabold gradient-text">
            404
          </h1>
        </div>
        
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>

        <Link to="/">
          <Button size="lg" className="mt-4">
            <HomeIcon className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
