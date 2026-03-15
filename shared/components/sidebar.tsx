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
  Building2,
  ChevronDown,
  Check,
  Truck,
  UserCircle,
  ClipboardList,
  X,
} from "lucide-react";
import { useUser } from "@/shared/auth/store";
import { useTenantStore } from "@/shared/tenant/store";
import { useOrganizations } from "@/shared/organizations/hooks";
import { buildTenantFromOrganization, setOrganizationSelectedCookie } from "@/shared/organizations/utils";
import { Button } from "@/shared/ui/button";

type NavAccent = "default" | "violet" | "sky" | "emerald" | "indigo" | "amber";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: NavAccent;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const accentClasses: Record<NavAccent, { link: string; bar: string; icon: string }> = {
  default: { link: "bg-zinc-100 text-zinc-800 dark:bg-zinc-500/10 dark:text-zinc-200", bar: "bg-zinc-500", icon: "text-zinc-600 dark:text-zinc-400" },
  violet: { link: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400", bar: "bg-violet-500", icon: "text-violet-600 dark:text-violet-400" },
  sky: { link: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400", bar: "bg-sky-500", icon: "text-sky-600 dark:text-sky-400" },
  emerald: { link: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400", bar: "bg-emerald-500", icon: "text-emerald-600 dark:text-emerald-400" },
  indigo: { link: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400", bar: "bg-indigo-500", icon: "text-indigo-600 dark:text-indigo-400" },
  amber: { link: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400", bar: "bg-amber-500", icon: "text-amber-600 dark:text-amber-400" },
};

const navSections: NavSection[] = [
  {
    title: "Principal",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, accent: "default" },
      { title: "Catégories", href: "/categories", icon: FolderOpen, accent: "violet" },
      { title: "Produits", href: "/products", icon: Package, accent: "default" },
    ],
  },
  {
    title: "Achat",
    items: [
      { title: "Fournisseur", href: "/suppliers", icon: Truck, accent: "default" },
      { title: "Bon de commande", href: "/purchase-orders", icon: ClipboardList, accent: "default" },
    ],
  },
  {
    title: "Vente",
    items: [
      { title: "Client", href: "/customers", icon: Users, accent: "default" },
      { title: "Commande", href: "/orders", icon: ShoppingCart, accent: "default" },
      { title: "Livreur", href: "/delivery", icon: UserCircle, accent: "default" },
    ],
  },
  {
    title: "Stock",
    items: [
      { title: "Vue Stock", href: "/stock", icon: Warehouse, accent: "default" },
      { title: "Inventaire", href: "/inventory", icon: FolderOpen, accent: "default" },
      { title: "Mouvements", href: "/movements", icon: TrendingUp, accent: "sky" },
    ],
  },
  {
    title: "Finances",
    items: [
      { title: "Caisse", href: "/cash", icon: DollarSign, accent: "emerald" },
      { title: "Finances", href: "/finances", icon: DollarSign, accent: "indigo" },
      { title: "ROAS Cash Réel", href: "/roas", icon: TrendingUp, accent: "amber" },
    ],
  },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const user = useUser();
  const tenantId = user?.tenantId;
  const { tenant, setTenant, setSelectedOrganizationId } = useTenantStore();
  const { data: organizations = [], isLoading: orgsLoading } = useOrganizations(tenantId);
  const [orgDropdownOpen, setOrgDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const handleLinkClick = React.useCallback(() => onClose?.(), [onClose]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOrgDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectOrg = React.useCallback(
    (org: (typeof organizations)[0]) => {
      const nextTenant = buildTenantFromOrganization(org);
      setTenant(nextTenant);
      setSelectedOrganizationId(org.tenant_id, org.id);
      setOrganizationSelectedCookie();
      setOrgDropdownOpen(false);
      onClose?.();
    },
    [organizations, setTenant, setSelectedOrganizationId, onClose]
  );

  const hasMultipleOrgs = organizations.length > 1;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "flex h-screen w-56 shrink-0 flex-col border-r border-zinc-200/70 bg-white dark:border-zinc-800/70 dark:bg-zinc-950",
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-out md:relative md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between gap-2.5 border-b border-zinc-200/70 px-4 dark:border-zinc-800/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500/10 ring-1 ring-green-500/20">
              <Image
                src="/logo/logo.png"
                alt="GestiCash"
                width={24}
                height={24}
                className="h-5 w-5 object-contain"
                priority
              />
            </div>
            <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white truncate">
              GestiCash
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 shrink-0 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

      {/* Organisation courante / Sélecteur */}
      {tenantId && (
        <div className="border-b border-zinc-200/70 px-3 py-3 dark:border-zinc-800/70" ref={dropdownRef}>
          {orgsLoading ? (
            <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-400 dark:bg-zinc-500" />
              Chargement…
            </div>
          ) : organizations.length === 0 ? (
            <Link href="/organizations/select" onClick={handleLinkClick}>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 rounded-lg border-dashed text-xs">
                <Building2 className="h-3.5 w-3.5" />
                Choisir une organisation
              </Button>
            </Link>
          ) : hasMultipleOrgs ? (
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-between gap-1 rounded-lg px-2.5 py-2 text-left text-xs font-medium",
                  "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                )}
                onClick={() => setOrgDropdownOpen((v) => !v)}
              >
                <span className="flex min-w-0 items-center gap-2 truncate">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-green-600 dark:text-green-400" />
                  <span className="truncate">{tenant?.name ?? "Organisation"}</span>
                </span>
                <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", orgDropdownOpen && "rotate-180")} />
              </Button>
              {orgDropdownOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                  {organizations.map((org) => {
                    const built = buildTenantFromOrganization(org);
                    const isActive = tenant?.name === org.name || tenant?.slug === (org.code?.trim() || org.id);
                    return (
                      <button
                        key={org.id}
                        type="button"
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors",
                          isActive
                            ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        )}
                        onClick={() => handleSelectOrg(org)}
                      >
                        {isActive ? <Check className="h-3.5 w-3.5 shrink-0" /> : <span className="w-3.5 shrink-0" />}
                        <span className="min-w-0 truncate">{org.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-zinc-600 dark:text-zinc-400">
                <Building2 className="h-3.5 w-3.5 shrink-0 text-green-600 dark:text-green-400" />
                <span className="min-w-0 truncate">{tenant?.name ?? organizations[0]?.name ?? "Organisation"}</span>
              </div>
              <Link href="/organizations/select" className="block" onClick={handleLinkClick}>
                <span className="rounded-lg px-2.5 py-1 text-[11px] font-medium text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-500/10">
                  Changer d&apos;organisation
                </span>
              </Link>
            </div>
          )}
          {hasMultipleOrgs && (
            <Link href="/organizations/select" className="mt-1 block" onClick={handleLinkClick}>
              <span className="rounded-lg px-2.5 py-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                Gérer les organisations
              </span>
            </Link>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section, idx) => (
          <div key={section.title} className={cn(idx > 0 && "mt-5")}>
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + "/");
                const accent = item.accent ?? "default";
                const styles = accentClasses[accent];
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={handleLinkClick}
                      className={cn(
                        "relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                        isActive ? styles.link : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
                      )}
                    >
                      {isActive && (
                        <span className={cn("absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full", styles.bar)} />
                      )}
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive ? styles.icon : "text-zinc-500 dark:text-zinc-500"
                        )}
                      />
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
    </>
  );
}
