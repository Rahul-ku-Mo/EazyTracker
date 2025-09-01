
import { useTheme } from "../context/ThemeProvider";
import { MoonIcon, SunIcon } from "@/_components/shared/svg/SharedIcons";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div
      className="relative size-7 rounded-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center"
      onClick={toggleTheme}
    >
      <SunIcon className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </div>
  );
}
