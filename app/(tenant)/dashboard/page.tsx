/**
 * Dashboard GestiCash - Vue globale avec métriques et graphiques
 * Design moderne et professionnel - Version améliorée
 */

"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { useMockDashboardStats, useMockCODOrders } from "@/shared/mock";
import {
  DollarSign,
  TrendingUp,
  Truck,
  ShoppingCart,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Activity,
  Zap,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";

// Types pour les données du dashboard
interface CountryView {
  country: string;
  currency: string;
  moneyEntered: number;
  realProfit: number;
  cashDeliverers: number;
  orders: number;
}

interface DailyCashReceipt {
  date: string;
  amount: number;
}

interface OrderDistribution {
  status: string;
  count: number;
  percentage: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useMockDashboardStats();
  const { data: codOrders } = useMockCODOrders({ limit: 100 });

  // Données pour "Vue par Pays"
  const countryViews: CountryView[] = [
    {
      country: "cote d'ivoire",
      currency: "fcfa",
      moneyEntered: stats?.revenue.total || 0,
      realProfit: stats?.profit.total || 0,
      cashDeliverers: Math.floor((stats?.revenue.total || 0) * 0.15),
      orders: stats?.orders.total || 0,
    },
  ];

  // Données pour le graphique "Encaissements 7 derniers jours"
  const last7DaysCash: DailyCashReceipt[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      amount: Math.floor((stats?.revenue.total || 0) / 7 * (0.7 + Math.random() * 0.6)),
    };
  });

  // Données pour "Répartition Commandes"
  const orderDistribution: OrderDistribution[] = [
    {
      status: "Livrées",
      count: stats?.orders.delivered || 0,
      percentage: stats?.orders.total ? Math.round((stats.orders.delivered / stats.orders.total) * 100) : 0,
      color: "from-green-500 to-emerald-600",
      icon: ShoppingCart,
    },
    {
      status: "En attente",
      count: stats?.orders.pending || 0,
      percentage: stats?.orders.total ? Math.round((stats.orders.pending / stats.orders.total) * 100) : 0,
      color: "from-yellow-500 to-amber-600",
      icon: Sparkles,
    },
    {
      status: "Annulées",
      count: stats?.orders.cancelled || 0,
      percentage: stats?.orders.total ? Math.round((stats.orders.cancelled / stats.orders.total) * 100) : 0,
      color: "from-red-500 to-rose-600",
      icon: ArrowDownRight,
    },
  ];

  const formatCurrency = (amount: number, currency: string = "fcfa") => {
    return `${amount.toLocaleString("fr-FR")} ${currency}`;
  };

  const maxCashAmount = Math.max(...last7DaysCash.map((d) => d.amount), 1);

  if (statsLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-green-500/20 border-t-green-500 dark:border-green-600/20 dark:border-t-green-600 mx-auto"></div>
            <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-2 border-green-500/30 dark:border-green-600/30"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Chargement des données...
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-600">Préparation de votre tableau de bord</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black p-6 lg:p-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header avec gradient et logo - Amélioré */}
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-600/30 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 p-3 shadow-2xl shadow-green-500/20 ring-2 ring-green-500/20 dark:from-green-500/10 dark:to-emerald-600/10 dark:ring-green-500/10 group-hover:scale-105 transition-transform duration-300">
                  <Image
                    src="/logo/logo.png"
                    alt="GestiCash Logo"
                    width={40}
                    height={40}
                    className="h-full w-full object-contain"
                    priority
                  />
                </div>
              </div>
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent mb-2 dark:from-green-500 dark:via-emerald-400 dark:to-green-400 tracking-tight">
                  Dashboard
                </h1>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                  <p className="text-zinc-500 text-sm lg:text-base dark:text-zinc-400 font-medium">
                    Vue globale - Tous les pays
                  </p>
                </div>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-400 border-green-500/30 px-5 py-2 text-sm font-semibold shadow-lg shadow-green-500/10 dark:bg-green-500/5 dark:text-green-500 dark:border-green-500/20 hover:scale-105 transition-transform duration-200">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
              <Globe className="h-3.5 w-3.5 mr-2" />
              Actif
            </Badge>
          </div>
        </div>

        {/* Vue Globale Section - Améliorée */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 shadow-lg shadow-green-500/10 dark:from-green-500/10 dark:to-emerald-500/10 dark:border-green-500/20">
              <Globe className="h-5 w-5 text-green-400 dark:text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Vue Globale</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">Tous les pays - Statistiques en temps réel</p>
            </div>
          </div>

          {/* 4 Cards métriques améliorées avec animations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {/* Argent Entré Aujourd'hui */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-green-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 dark:hover:border-green-500/30 dark:hover:shadow-green-500/10 min-w-0">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:from-green-500/5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-zinc-700 group-hover:text-zinc-900 transition-colors dark:text-zinc-300 dark:group-hover:text-zinc-100">
                  Argent Entré Aujourd'hui
                </CardTitle>
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-green-500/10 dark:from-green-500/15 dark:to-emerald-500/15">
                  <DollarSign className="h-5 w-5 text-green-500 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 bg-clip-text text-transparent mb-3 break-words overflow-hidden dark:from-green-400 dark:via-emerald-400 dark:to-green-500 leading-tight">
                  {formatCurrency(stats?.revenue.total || 0)}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs border-green-500/40 text-green-600 bg-green-500/10 font-semibold dark:border-green-500/30 dark:text-green-400 dark:bg-green-500/5">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {stats?.revenue.change.toFixed(1)}%
                  </Badge>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">Toutes devises</p>
                </div>
              </CardContent>
            </Card>

            {/* Bénéfice Réel Aujourd'hui */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-emerald-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 dark:hover:border-emerald-500/30 dark:hover:shadow-emerald-500/10 min-w-0">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:from-emerald-500/5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-zinc-700 group-hover:text-zinc-900 transition-colors dark:text-zinc-300 dark:group-hover:text-zinc-100">
                  Bénéfice Réel Aujourd'hui
                </CardTitle>
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-emerald-500/10 dark:from-emerald-500/15 dark:to-teal-500/15">
                  <TrendingUp className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 bg-clip-text text-transparent mb-3 break-words overflow-hidden dark:from-emerald-400 dark:via-teal-400 dark:to-emerald-500 leading-tight">
                  {formatCurrency(stats?.profit.total || 0)}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-600 bg-emerald-500/10 font-semibold dark:border-emerald-500/30 dark:text-emerald-400 dark:bg-emerald-500/5">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {stats?.profit.change.toFixed(1)}%
                  </Badge>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">Toutes devises</p>
                </div>
              </CardContent>
            </Card>

            {/* Cash chez Livreurs */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-orange-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 dark:hover:border-orange-500/30 dark:hover:shadow-orange-500/10 min-w-0">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:from-orange-500/5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-zinc-700 group-hover:text-zinc-900 transition-colors dark:text-zinc-300 dark:group-hover:text-zinc-100">
                  Cash chez Livreurs
                </CardTitle>
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-orange-500/10 dark:from-orange-500/15 dark:to-amber-500/15">
                  <Truck className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent mb-3 break-words overflow-hidden dark:from-orange-400 dark:via-amber-400 dark:to-orange-500 leading-tight">
                  {formatCurrency(countryViews[0]?.cashDeliverers || 0)}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">Toutes devises</p>
              </CardContent>
            </Card>

            {/* Commandes Aujourd'hui */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-blue-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 dark:hover:border-blue-500/30 dark:hover:shadow-blue-500/10 min-w-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:from-blue-500/5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold text-zinc-700 group-hover:text-zinc-900 transition-colors dark:text-zinc-300 dark:group-hover:text-zinc-100">
                  Commandes Aujourd'hui
                </CardTitle>
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-blue-500/10 dark:from-blue-500/15 dark:to-cyan-500/15">
                  <ShoppingCart className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent mb-3 break-words overflow-hidden dark:from-blue-400 dark:via-cyan-400 dark:to-blue-500 leading-tight">
                  {stats?.orders.total || 0}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs border-blue-500/40 text-blue-600 bg-blue-500/10 font-semibold dark:border-blue-500/30 dark:text-blue-400 dark:bg-blue-500/5">
                    <Zap className="h-3 w-3 mr-1" />
                    {stats?.orders.pending || 0} en attente
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Vue par Pays Section - Améliorée */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 shadow-lg shadow-blue-500/10 dark:from-blue-500/10 dark:to-cyan-500/10 dark:border-blue-500/20">
              <Globe className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Vue par Pays</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">Répartition géographique des données</p>
            </div>
          </div>
          <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 overflow-hidden shadow-xl dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 hover:shadow-2xl transition-shadow duration-300">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200/80 bg-gradient-to-r from-zinc-50 to-white dark:border-zinc-900/50 dark:from-zinc-950/50 dark:to-zinc-900/30">
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-700 uppercase tracking-wider dark:text-zinc-300">
                        Pays
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                        Devise
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                        Argent Entré
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                        Bénéfice Réel
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                        Cash Livreurs
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                        Commandes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-900/50">
                    {countryViews.map((view, index) => (
                      <tr 
                        key={index} 
                        className="hover:bg-gradient-to-r hover:from-green-500/5 hover:to-emerald-500/5 transition-all duration-300 group cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="h-3 w-3 rounded-full bg-green-500 group-hover:scale-150 transition-transform duration-300 shadow-lg shadow-green-500/50 dark:bg-green-400"></div>
                              <div className="absolute inset-0 h-3 w-3 rounded-full bg-green-500/30 animate-ping"></div>
                            </div>
                            <span className="text-sm font-semibold text-zinc-900 capitalize group-hover:text-green-600 transition-colors dark:text-zinc-100 dark:group-hover:text-green-400">
                              {view.country}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className="text-xs border-zinc-300 text-zinc-700 bg-zinc-100 font-semibold dark:border-zinc-800 dark:text-zinc-300 dark:bg-zinc-900/50">
                            {view.currency.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">
                            {formatCurrency(view.moneyEntered, view.currency)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
                            {formatCurrency(view.realProfit, view.currency)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent dark:from-orange-400 dark:to-amber-400">
                            {formatCurrency(view.cashDeliverers, view.currency)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{view.orders}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques Section - Améliorée */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          {/* Encaissements 7 derniers jours */}
          <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 shadow-xl hover:shadow-2xl transition-all duration-300 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-zinc-900 flex items-center gap-3 dark:text-zinc-100">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 shadow-lg shadow-green-500/10 dark:from-green-500/15 dark:to-emerald-500/15">
                  <TrendingUp className="h-5 w-5 text-green-500 dark:text-green-400" />
                </div>
                <span className="text-xl font-bold">Encaissements 7 derniers jours</span>
              </CardTitle>
              <CardDescription className="text-zinc-600 dark:text-zinc-400 mt-2 font-medium">
                Évolution des recettes quotidiennes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-72">
                {/* Y-axis labels améliorés */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-zinc-500 pr-4 font-bold dark:text-zinc-600">
                  {[4, 3, 2, 1].map((val) => (
                    <span key={val}>{val}-</span>
                  ))}
                </div>
                {/* Chart avec gradient amélioré */}
                <div className="ml-12 h-full flex items-end justify-between gap-3">
                  {last7DaysCash.map((day, index) => {
                    const height = (day.amount / maxCashAmount) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-3 group">
                        <div className="relative w-full h-full flex items-end">
                          <div
                            className="w-full rounded-t-xl bg-gradient-to-t from-green-600 via-green-500 to-green-400 transition-all duration-500 hover:from-green-500 hover:via-green-400 hover:to-green-300 cursor-pointer shadow-xl shadow-green-500/30 group-hover:shadow-green-500/50 group-hover:scale-105 dark:from-green-700 dark:via-green-600 dark:to-green-500 dark:hover:from-green-600 dark:hover:via-green-500 dark:hover:to-green-400"
                            style={{ height: `${Math.max(height, 5)}%` }}
                            title={`${formatCurrency(day.amount)}`}
                          />
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-2xl whitespace-nowrap border border-zinc-700 dark:bg-zinc-950 dark:border-zinc-800 z-10">
                            {formatCurrency(day.amount)}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45 border-r border-b border-zinc-700 dark:bg-zinc-950 dark:border-zinc-800"></div>
                          </div>
                        </div>
                        <div className="text-xs text-zinc-600 font-semibold dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                          {day.date}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Répartition Commandes */}
          <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 shadow-xl hover:shadow-2xl transition-all duration-300 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-zinc-900 flex items-center gap-3 dark:text-zinc-100">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 shadow-lg shadow-blue-500/10 dark:from-blue-500/15 dark:to-cyan-500/15">
                  <ShoppingCart className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                </div>
                <span className="text-xl font-bold">Répartition Commandes</span>
              </CardTitle>
              <CardDescription className="text-zinc-600 dark:text-zinc-400 mt-2 font-medium">
                Statut des commandes en temps réel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {orderDistribution.map((item, index) => {
                  const Icon = item.icon;
                  const iconColors = [
                    "text-green-500 dark:text-green-400",
                    "text-yellow-500 dark:text-yellow-400",
                    "text-red-500 dark:text-red-400",
                  ];
                  return (
                    <div key={index} className="space-y-4 group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} bg-opacity-20 shadow-lg dark:bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className={`h-5 w-5 ${iconColors[index]}`} />
                          </div>
                          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{item.status}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent dark:from-zinc-100 dark:to-zinc-300">
                            {item.count}
                          </div>
                          <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-500">{item.percentage}%</div>
                        </div>
                      </div>
                      <div className="relative w-full bg-zinc-200/80 rounded-full h-3.5 overflow-hidden shadow-inner dark:bg-zinc-900/50">
                        <div
                          className={`absolute left-0 top-0 h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000 ease-out shadow-lg group-hover:shadow-xl`}
                          style={{ width: `${item.percentage}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
