import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
