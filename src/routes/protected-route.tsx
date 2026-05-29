import { Navigate } from 'react-router';
import { useAuth } from '../contexts/auth-context';
import { Skeleton } from '../components/ui/skeleton';
import { ENABLE_DEMO_WITHOUT_AUTH } from '../../shared/constants/demo-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!ENABLE_DEMO_WITHOUT_AUTH && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}