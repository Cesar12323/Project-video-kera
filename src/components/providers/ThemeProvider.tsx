"use client";

import React, { useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useSettingsStore();

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.remove("light");
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, [theme]);

  return <>{children}</>;
}
