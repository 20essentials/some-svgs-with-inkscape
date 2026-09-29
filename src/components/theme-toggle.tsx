import ThemeToggleComponent from '@/components/smoothui/theme-toggle';
import { useTheme } from '@/lib/use-theme';

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <ThemeToggleComponent
      className={className}
      onThemeChange={setTheme}
      size="sm"
      theme={theme}
      variant="sun-moon"
    />
  );
}
