import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark((v) => !v)}
      className="h-9 w-9 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center"
      aria-label="Alternar tema"
      title="Alternar tema"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
