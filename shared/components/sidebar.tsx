"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils/cn";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  FolderOpen,
  TrendingUp,
  DollarSign,
  Globe,
  ChevronDown,
  Moon,
  LogOut,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar";
import { useTheme } from "next-themes";
import { useUser } from "@/shared/auth/store";
import { useLogout } from "@/shared/auth/hooks";
import { UserRole } from "@/shared/types";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "PRINCIPAL",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Produits", href: "/products", icon: Package },
      { title: "Commandes", href: "/orders", icon: ShoppingCart },
      { title: "Clients", href: "/customers", icon: Users },
    ],
  },
  {
    title: "STOCK",
    items: [
      { title: "Vue Stock", href: "/stock", icon: Warehouse },
      { title: "Inventaire", href: "/inventory", icon: FolderOpen },
      { title: "Mouvements", href: "/movements", icon: TrendingUp },
    ],
  },
  {
    title: "FINANCES",
    items: [
      { title: "Caisse", href: "/cash", icon: DollarSign },
      { title: "Finances", href: "/finances", icon: DollarSign },
      { title: "ROAS Cash Réel", href: "/roas", icon: TrendingUp },
    ],
  },
];

// Fonction pour obtenir le titre du rôle
const getRoleTitle = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return "Admin Manager";
    case UserRole.MANAGER:
      return "Manager";
    case UserRole.USER:
      return "Utilisateur";
    default:
      return "Utilisateur";
  }
};

// Fonction pour obtenir les initiales
const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const user = useUser();
  const logoutMutation = useLogout();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Utiliser resolvedTheme qui donne le thème réel appliqué
  // Le thème par défaut est "system" qui suit les préférences système
  const currentTheme = resolvedTheme || theme;
  const isDarkMode = React.useMemo(() => {
    if (!mounted) return false;
    // resolvedTheme retourne "dark" ou "light" même si le thème est "system"
    return currentTheme === "dark";
  }, [mounted, currentTheme]);
  const fullName = user ? `${user.firstName} ${user.lastName}` : "";
  const roleTitle = user ? getRoleTitle(user.role) : "";
  const initials = user ? getInitials(user.firstName, user.lastName) : "";

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-gradient-to-b from-white via-zinc-50 to-white border-r border-zinc-200/50 text-zinc-900 shadow-2xl dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 dark:border-zinc-800/50 dark:text-white">
      {/* Logo Section avec gradient */}
      <div className="flex items-center gap-3 border-b border-zinc-200/50 px-6 py-5 bg-gradient-to-r from-white to-zinc-50/50 dark:border-zinc-800/50 dark:from-zinc-900 dark:to-zinc-800/30">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-600/20 p-2 shadow-lg shadow-green-500/10 ring-1 ring-green-500/20">
          <Image
            src="/logo/logo.png"
            alt="GestiCash Logo"
            width={40}
            height={40}
            className="h-full w-full object-contain"
            priority
          />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent dark:from-white dark:to-zinc-300">
            GestiCash
          </h1>
          <p className="text-xs text-zinc-600 font-medium dark:text-zinc-500">
            Votre argent, enfin sous contrôle
          </p>
        </div>
      </div>

      {/* Dark Mode Toggle */}
      {mounted ? (
        <div className="border-b border-zinc-200/50 px-6 py-3 bg-zinc-50/50 dark:border-zinc-800/50 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1 rounded bg-zinc-200/50 dark:bg-zinc-800/50">
                <Moon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </div>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Dark mode
              </span>
            </div>
            <Switch
              key={`theme-switch-${currentTheme || "system"}`}
              checked={isDarkMode}
              onCheckedChange={(checked) => {
                const newTheme = checked ? "dark" : "light";
                setTheme(newTheme);
              }}
            />
          </div>
        </div>
      ) : (
        <div className="border-b border-zinc-200/50 px-6 py-3 bg-zinc-50/50 dark:border-zinc-800/50 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1 rounded bg-zinc-200/50 dark:bg-zinc-800/50">
                <Moon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </div>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Dark mode
              </span>
            </div>
            <Switch checked={false} disabled />
          </div>
        </div>
      )}

      {/* Country Selector amélioré */}
      <div className="border-b border-zinc-200/50 px-6 py-3 bg-zinc-50/50 dark:border-zinc-800/50 dark:bg-zinc-900/50">
        <Button
          variant="ghost"
          className="w-full justify-between bg-gradient-to-r from-zinc-100/50 to-zinc-100/30 text-zinc-900 hover:from-zinc-200/50 hover:to-zinc-200/30 border border-zinc-300/50 hover:border-zinc-400/50 transition-all duration-200 dark:from-zinc-800/50 dark:to-zinc-800/30 dark:text-white dark:border-zinc-700/50 dark:hover:border-zinc-600/50 dark:hover:from-zinc-700/50 dark:hover:to-zinc-700/30"
        >
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-green-500/20 dark:bg-green-500/10">
              <Globe className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-300">Tous les pays</span>
          </div>
          <ChevronDown className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
        </Button>
      </div>

      {/* Navigation Sections améliorées */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent dark:scrollbar-thumb-zinc-700">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="mb-3 px-2 text-xs font-bold uppercase text-zinc-500 tracking-wider dark:text-zinc-400">
              {section.title}
            </h3>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 group",
                      isActive
                        ? "bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-600 shadow-lg shadow-green-500/10 dark:from-green-500/15 dark:to-emerald-500/8 dark:text-green-400 dark:shadow-green-500/5"
                        : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-200"
                    )}
                  >
                    {isActive && (
                      <>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-gradient-to-b from-green-500 to-emerald-500 shadow-lg shadow-green-500/50 dark:from-green-600 dark:to-emerald-600" />
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500/5 to-transparent dark:from-green-500/3" />
                      </>
                    )}
                    <div className={cn(
                      "p-1.5 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-br from-green-500/30 to-emerald-500/20 dark:from-green-500/20 dark:to-emerald-500/15"
                        : "bg-zinc-200/30 group-hover:bg-zinc-300/50 dark:bg-zinc-800/30 dark:group-hover:bg-zinc-700/50"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4 transition-colors",
                        isActive ? "text-green-600 dark:text-green-400" : "text-zinc-600 group-hover:text-zinc-900 dark:text-zinc-500 dark:group-hover:text-zinc-300"
                      )} />
                    </div>
                    <span className={cn(
                      "font-medium relative z-10",
                      isActive && "text-green-600 dark:text-green-400"
                    )}>
                      {item.title}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* User Profile Section */}
      {user && (
        <div className="border-t border-zinc-200/50 px-6 py-4 dark:border-zinc-800/50">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={fullName} />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 text-green-600 dark:text-green-400">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-600 dark:text-green-400 truncate">
                {fullName}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                {roleTitle}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Log out Button */}
      <div className="border-t border-zinc-200/50 px-6 py-4 dark:border-zinc-800/50">
        <Button
          variant="ghost"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full justify-start gap-3 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900/50"
        >
          <div className="p-1 rounded bg-zinc-200/50 dark:bg-zinc-800/50">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Log out</span>
        </Button>
      </div>
    </div>
  );
}
