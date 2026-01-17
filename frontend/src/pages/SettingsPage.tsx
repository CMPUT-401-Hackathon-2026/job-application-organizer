import { ThemeToggle } from '../components/ThemeToggle';
import { useThemeStore } from '../store/themeStore';
import { Moon, Sun } from 'lucide-react';

export function SettingsPage() {
  const { theme } = useThemeStore();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl min-h-[calc(100vh-4rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 shadow-sm min-h-[400px]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-1">Theme</h2>
            <p className="text-sm text-muted-foreground">
              Switch between light and dark mode
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
              {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
              <span className="text-sm font-medium capitalize">{theme} mode</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
