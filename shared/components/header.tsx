"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Moon,
  Sun,
  LogOut,
  Building2,
  ChevronDown,
  Globe,
  User,
  Menu,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar";
import { useTheme } from "next-themes";
import { useUser } from "@/shared/auth/store";
import { useLogout } from "@/shared/auth/hooks";
import { useTenant } from "@/shared/tenant/store";
import { useCountries } from "@/shared/reference/hooks";
import { UserRole } from "@/shared/types";
import { cn } from "@/shared/utils/cn";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/products": "Produits",
  "/orders": "Commandes",
  "/customers": "Clients",
  "/stock": "Vue Stock",
  "/inventory": "Inventaire",
  "/movements": "Mouvements",
  "/cash": "Caisse",
  "/finances": "Finances",
  "/roas": "ROAS Cash Réel",
};

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

const getInitials = (firstName?: string, lastName?: string, fallback?: string): string => {
  const f = firstName?.trim();
  const l = lastName?.trim();
  if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
  const name = fallback?.trim() || f || l || "";
  if (!name) return "?";
  const parts = name.split(" ").filter(Boolean);
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const user = useUser();
  const tenant = useTenant();
  const logoutMutation = useLogout();
  const [mounted, setMounted] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [countriesMenuOpen, setCountriesMenuOpen] = React.useState(false);
  const [selectedCountryId, setSelectedCountryId] = React.useState<string | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const countriesRef = React.useRef<HTMLDivElement>(null);
  const { data: countries = [], isLoading: countriesLoading } = useCountries();
  const selectedCountry = selectedCountryId ? countries.find((c) => c.id === selectedCountryId) : null;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) setUserMenuOpen(false);
      if (countriesRef.current && !countriesRef.current.contains(target)) setCountriesMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const pageTitle = PAGE_TITLES[pathname ?? ""] ?? "GestiCash";

  const fullName = user
    ? `${user.firstName} ${user.lastName}`.trim() || (user as any).name || user.email
    : "";
  const initials = user
    ? getInitials(user.firstName, user.lastName, (user as any).name || user.email)
    : "?";
  const roleTitle = user ? getRoleTitle(user.role) : "";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200/70 bg-white/90 px-4 sm:px-6 backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-950/90">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Organisation – masqué sur mobile */}
        <Link href="/organizations/select" className="hidden md:block">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <Building2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            <span className="max-w-[120px] truncate">
              {tenant?.name ?? "Organisation"}
            </span>
            <ChevronDown className="h-3 w-3 text-zinc-400" />
          </Button>
        </Link>

        {/* Pays – liste des pays (API /reference/countries) – masqué sur mobile */}
        <div ref={countriesRef} className="relative hidden md:block">
          <button
            type="button"
            onClick={() => setCountriesMenuOpen((v) => !v)}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <Globe className="h-3.5 w-3.5 shrink-0 text-green-600 dark:text-green-400" />
            <span className="max-w-[140px] truncate">
              {selectedCountry ? selectedCountry.name : "Tous les pays"}
            </span>
            {countriesLoading ? (
              <Loader2 className="h-3 w-3 shrink-0 animate-spin text-zinc-400" />
            ) : (
              <ChevronDown className={cn("h-3 w-3 shrink-0 text-zinc-400 transition-transform", countriesMenuOpen && "rotate-180")} />
            )}
          </button>
          {countriesMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-50 max-h-[280px] min-w-[200px] overflow-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => { setSelectedCountryId(null); setCountriesMenuOpen(false); }}
                className={cn("flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors", !selectedCountryId ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800")}
              >
                <Globe className="h-3.5 w-3.5 shrink-0" /> Tous les pays
              </button>
              {countries.length > 0 && (
                <>
                  <div className="my-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                  {countries.map((country) => (
                    <button
                      key={country.id}
                      type="button"
                      onClick={() => { setSelectedCountryId(country.id); setCountriesMenuOpen(false); }}
                      className={cn("flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors", selectedCountryId === country.id ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800")}
                    >
                      <span className="min-w-0 truncate">{country.name}{country.code ? ` (${country.code})` : ""}</span>
                    </button>
                  ))}
                </>
              )}
              {!countriesLoading && countries.length === 0 && <p className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">Aucun pays disponible</p>}
            </div>
          )}
        </div>

        {/* Séparateur – masqué sur mobile */}
        <div className="mx-1 hidden h-5 w-px bg-zinc-200 dark:bg-zinc-700 md:block" />

        {/* Dark mode toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
          >
            {isDark ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
          </button>
        )}

        {/* Séparateur */}
        <div className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-700" />

        {/* User menu – avatar seul sur mobile, nom + chevron à partir de md */}
        {user && (
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 md:px-2.5 md:py-1 text-sm transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              aria-label="Menu profil"
            >
              <Avatar className="h-7 w-7 md:h-6 md:w-6">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={fullName} />
                ) : null}
                <AvatarFallback className="bg-green-500/15 text-[10px] font-semibold text-green-700 dark:text-green-400">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[100px] truncate text-xs font-medium text-zinc-700 dark:text-zinc-300 md:inline">
                {fullName || "Compte"}
              </span>
              <ChevronDown
                className={cn(
                  "hidden h-3 w-3 text-zinc-400 transition-transform md:block",
                  userMenuOpen && "rotate-180"
                )}
              />
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[200px] rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                {/* User info */}
                <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                  <Avatar className="h-8 w-8">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={fullName} />
                    ) : null}
                    <AvatarFallback className="bg-green-500/15 text-xs font-semibold text-green-700 dark:text-green-400">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                      {fullName}
                    </p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {roleTitle}
                    </p>
                  </div>
                </div>

                <div className="my-1 h-px bg-zinc-100 dark:bg-zinc-800" />

                {/* Logout */}
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logoutMutation.mutate();
                  }}
                  disabled={logoutMutation.isPending}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
