import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  variant?: 'default' | 'icon' | 'sidebar';
  className?: string;
}

export const ThemeToggle = ({ variant = 'default', className }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={cn("h-9 w-9 relative", className)}
        aria-label="Toggle theme"
      >
        <Sun className="absolute h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  if (variant === 'sidebar') {
    return (
      <Button
        variant="ghost"
        size="default"
        onClick={toggleTheme}
        className={cn(
          "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200",
          className
        )}
        aria-label="Toggle theme"
      >
        <div className="relative h-4 w-4">
          <Sun className="absolute h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-sidebar-foreground" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-sidebar-foreground" />
        </div>
        <span>Toggle Theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="default"
      onClick={toggleTheme}
      className={cn(
        "gap-2 transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
        className
      )}
      aria-label="Toggle theme"
    >
      <div className="relative h-4 w-4">
        <Sun className="absolute h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </div>
      <span className="hidden sm:inline-block">
        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      </span>
    </Button>
  );
};

