"use client";

import React, { useMemo } from "react";
import { useTenantId } from "@/shared/tenant/store";
import {
  useMockDashboardStats,
  useMockTransactions,
  isMockEnabled,
} from "@/shared/mock";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Receipt } from "lucide-react";
import { formatAmount } from "@/shared/utils";

export default function FinancesPage() {
  const tenantId = useTenantId();
  const mockEnabled = isMockEnabled();

  const { data: stats, isLoading: statsLoading } = useMockDashboardStats();
  const { data: transactionsData } = useMockTransactions({ limit: 20 });
  const transactions = transactionsData?.data ?? [];

  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        label: d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit" }),
        date: d.toISOString().split("T")[0],
      });
    }
    return days;
  }, []);

  const revenueByDay = useMemo(() => {
    return last7Days.map(({ date }) => {
      const dayTx = transactions.filter((t) => t.type === "income" && t.date?.startsWith(date));
      const total = dayTx.reduce((s, t) => s + t.amount, 0);
      return total;
    });
  }, [last7Days, transactions]);

  const expenseByDay = useMemo(() => {
    return last7Days.map(({ date }) => {
      const dayTx = transactions.filter((t) => t.type === "expense" && t.date?.startsWith(date));
      const total = dayTx.reduce((s, t) => s + t.amount, 0);
      return total;
    });
  }, [last7Days, transactions]);

  const maxValue = Math.max(
    ...revenueByDay,
    ...expenseByDay,
    1
  );

  if (!mockEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2 tracking-tight">Finances</h1>
          <p className="text-zinc-500 text-sm lg:text-base dark:text-zinc-400 font-medium">
            Vue d&apos;ensemble financière. Activez le mode démo ou connectez le backend.
          </p>
        </div>
        <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl">
          <CardContent className="p-16 text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-2xl animate-pulse" />
              <div className="relative p-6 rounded-full bg-gradient-to-br from-indigo-500/10 to-blue-500/10">
                <DollarSign className="h-16 w-16 text-zinc-400 dark:text-zinc-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">Aucune donnée disponible</p>
            <p className="text-sm text-zinc-500">Activez le mode démo ou connectez le backend.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (statsLoading && !stats) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 dark:from-black dark:via-zinc-950 dark:to-black">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500 mx-auto" />
            <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-2 border-indigo-500/30" />
          </div>
          <p className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">
            Chargement des finances...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative group">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/30 to-blue-600/30 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
              <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-600/20 p-3 shadow-2xl shadow-indigo-500/20 ring-2 ring-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                <DollarSign className="h-full w-full text-indigo-400 dark:text-indigo-500" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2 tracking-tight">
                Finances
              </h1>
              <p className="text-zinc-500 text-sm lg:text-base dark:text-zinc-400 font-medium">
                Revenus, dépenses et indicateurs
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-indigo-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Chiffre d&apos;affaires</CardTitle>
                <div className="p-2 rounded-lg bg-indigo-500/20">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">
                  {formatAmount(stats?.revenue?.total ?? 0)} FCFA
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  <span className="text-green-600 dark:text-green-400">{stats?.revenue?.change?.toFixed(1)}%</span> vs période précédente
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-red-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Dépenses</CardTitle>
                <div className="p-2 rounded-lg bg-red-500/20">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {formatAmount(stats?.expenses?.total ?? 0)} FCFA
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  <span className="text-red-600 dark:text-red-400">{stats?.expenses?.change?.toFixed(1)}%</span> vs période précédente
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-emerald-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Bénéfice</CardTitle>
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatAmount(stats?.profit?.total ?? 0)} FCFA
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Marge : {stats?.revenue?.total ? ((stats.profit.total / stats.revenue.total) * 100).toFixed(1) : 0}%
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-blue-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Commandes</CardTitle>
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Receipt className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {stats?.orders?.total ?? 0}
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  {stats?.orders?.pending ?? 0} en attente · {stats?.orders?.delivered ?? 0} livrées
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl mb-8 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Revenus vs Dépenses (7 derniers jours)</CardTitle>
              <CardDescription>Évolution quotidienne basée sur les transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-1 h-48">
                {last7Days.map((day, i) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex justify-center gap-0.5 items-end h-36">
                      <div
                        className="flex-1 max-w-[50%] rounded-t min-w-[4px] bg-green-500/70 dark:bg-green-500/50 transition-all"
                        style={{
                          height: `${maxValue ? (revenueByDay[i] / maxValue) * 100 : 0}%`,
                          minHeight: revenueByDay[i] ? 4 : 0,
                        }}
                        title={`Revenus: ${formatAmount(revenueByDay[i])} FCFA`}
                      />
                      <div
                        className="flex-1 max-w-[50%] rounded-t min-w-[4px] bg-red-500/70 dark:bg-red-500/50 transition-all"
                        style={{
                          height: `${maxValue ? (expenseByDay[i] / maxValue) * 100 : 0}%`,
                          minHeight: expenseByDay[i] ? 4 : 0,
                        }}
                        title={`Dépenses: ${formatAmount(expenseByDay[i])} FCFA`}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 truncate w-full text-center">
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-6 mt-4 justify-center">
                <span className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="w-3 h-3 rounded bg-green-500/70" /> Revenus
                </span>
                <span className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="w-3 h-3 rounded bg-red-500/70" /> Dépenses
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500/5 to-blue-500/5 border-b border-zinc-200/80 dark:border-zinc-800/80">
              <CardTitle>Dernières transactions</CardTitle>
              <CardDescription>Revenus et dépenses récents</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">Aucune transaction.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                    <tr className="border-b border-zinc-200/80 bg-gradient-to-r from-zinc-50 to-white dark:border-zinc-900/50 dark:from-zinc-950/50 dark:to-zinc-900/30">
                      <th className="px-6 py-3 text-left text-xs font-bold text-zinc-700 uppercase dark:text-zinc-300">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-zinc-600 uppercase">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-zinc-600 uppercase">Catégorie</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-zinc-600 uppercase">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                      {transactions.slice(0, 15).map((tx) => (
                        <tr key={tx.id} className="group hover:bg-gradient-to-r hover:from-indigo-500/5 hover:to-blue-500/5 transition-all duration-300">
                          <td className="px-6 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                            {tx.date ? new Date(tx.date).toLocaleDateString("fr-FR") : "—"}
                          </td>
                          <td className="px-6 py-3 font-medium text-zinc-900 dark:text-zinc-100">{tx.description}</td>
                          <td className="px-6 py-3 text-sm text-zinc-500">{tx.category}</td>
                          <td className="px-6 py-3 text-right font-medium">
                            <span className={tx.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                              {tx.type === "income" ? "+" : "-"} {formatAmount(tx.amount)} FCFA
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
