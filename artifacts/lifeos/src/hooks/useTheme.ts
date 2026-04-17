import { useState, useEffect } from "react";

export type ThemeId = "dark-ceo" | "hacker-green" | "neon-cyberpunk" | "minimal-light" | "focus-mode";

export const THEMES: { id: ThemeId; label: string; preview: string }[] = [
  { id: "dark-ceo", label: "Dark CEO", preview: "#3b82f6" },
  { id: "hacker-green", label: "Hacker Green", preview: "#22c55e" },
  { id: "neon-cyberpunk", label: "Neon Cyberpunk", preview: "#e879f9" },
  { id: "minimal-light", label: "Minimal Light", preview: "#6366f1" },
  { id: "focus-mode", label: "Focus Mode", preview: "#f59e0b" },
];

const STORAGE_KEY = "lifeos-theme";

function applyTheme(theme: ThemeId) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  if (theme === "minimal-light") {
    root.classList.remove("dark");
  } else {
    root.classList.add("dark");
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    return (localStorage.getItem(STORAGE_KEY) as ThemeId) ?? "dark-ceo";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as ThemeId) ?? "dark-ceo";
    applyTheme(saved);
  }, []);

  const setTheme = (t: ThemeId) => {
    localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
  };

  return { theme, setTheme, themes: THEMES };
}
