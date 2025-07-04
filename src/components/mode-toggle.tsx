import { Moon, Sun } from "lucide-react";

import { useTheme } from "../context/ThemeProvider";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div
      className="relative size-7 rounded-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center mx-2"
      onClick={toggleTheme}
    >
      <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </div>
  );
}
