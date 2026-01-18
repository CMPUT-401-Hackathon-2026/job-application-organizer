import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  // Don't show navbar on auth page, but show on profile page even if not authenticated
  if (!isAuthenticated && location.pathname !== '/profile') return null;

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/fyp" className="text-xl font-bold">
            Job Application Organizer
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/fyp"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              FYP
            </Link>
            <Link
              to="/track"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Track
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="User menu"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User size={18} />
                  </div>
                )}
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2 transition-all">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors text-left"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
