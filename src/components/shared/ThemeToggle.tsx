"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setMounted(true);
    const updateThemeState = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setDark(isDark);
    };

    updateThemeState();

    window.addEventListener("janmitra-theme-change", updateThemeState);
    window.addEventListener("storage", updateThemeState);
    return () => {
      window.removeEventListener("janmitra-theme-change", updateThemeState);
      window.removeEventListener("storage", updateThemeState);
    };
  }, []);

  function toggle() {
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    if (isCurrentlyDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("janmitra-theme", "light");
      setDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("janmitra-theme", "dark");
      setDark(true);
    }
    window.dispatchEvent(new Event("janmitra-theme-change"));
    window.dispatchEvent(new Event("storage"));
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
        aria-label="Toggle theme"
      >
        <Sun className="h-4.5 w-4.5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="rounded-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
      aria-label="Toggle theme"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
    </Button>
  );
}
