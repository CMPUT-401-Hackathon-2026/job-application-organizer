import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { FYPPage } from './pages/FYPPage';
import { SearchPage } from './pages/SearchPage';
import { BuilderPage } from './pages/BuilderPage';
import { TrackPage } from './pages/TrackPage';
import { SettingsPage } from './pages/SettingsPage';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/ui/Toast';
import { useAuthStore } from './store/authStore';
import { profile } from './api';

// Helper function to check if profile is complete
const isProfileComplete = (profileData: { name: string; email: string; education: any[] }) => {
  return profileData.name.trim() !== '' && 
         profileData.email.trim() !== '' && 
         profileData.education.length > 0;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

// Route that checks profile completeness
function ProfileCheckRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsChecking(false);
      return;
    }

    const checkProfile = async () => {
      try {
        const profileData = await profile.get();
        setNeedsProfile(!isProfileComplete(profileData));
      } catch {
        setNeedsProfile(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkProfile();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (isChecking) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  if (needsProfile) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  // Don't auto-redirect authenticated users from /auth - let them stay there or use the button
  return !isAuthenticated ? <>{children}</> : <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProfileCheckRoute>
                <Navigate to="/fyp" replace />
              </ProfileCheckRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            }
          />
          <Route
            path="/fyp"
            element={
              <ProfileCheckRoute>
                <AppLayout>
                  <FYPPage />
                </AppLayout>
              </ProfileCheckRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SearchPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/builder/:applicationId"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <BuilderPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/track"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TrackPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
