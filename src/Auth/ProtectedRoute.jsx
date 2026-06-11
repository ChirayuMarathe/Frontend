import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If profile is partial and we're not already on onboarding, redirect to onboarding
  if (profile && profile.status === 'partial' && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // If profile is active and we're on onboarding, redirect to dashboard
  if (profile && profile.status === 'active' && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  console.log("ProtectedRoute authorized access to:", location.pathname);
  return <>{children}</>;
}