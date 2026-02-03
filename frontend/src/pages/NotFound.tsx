import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg px-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Page Not Found</h1>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Button asChild className="w-full gradient-primary text-white rounded-lg">
          <Link to="/">Return to Chat</Link>
        </Button>
      </Card>
    </div>
  );
};

export default NotFound;
