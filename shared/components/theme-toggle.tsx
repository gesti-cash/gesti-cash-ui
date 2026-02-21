"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/utils/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Éviter le flash de contenu non stylé
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-9 w-9", className)}
        disabled
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "h-9 w-9 transition-colors hover:bg-zinc-800/50 dark:hover:bg-zinc-900/50",
        className
      )}
      title={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-yellow-400" />
      ) : (
        <Moon className="h-4 w-4 text-zinc-600" />
      )}
    </Button>
  );
}
