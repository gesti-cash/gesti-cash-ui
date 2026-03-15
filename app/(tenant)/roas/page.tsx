"use client";

import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useTenantId } from "@/shared/tenant/store";
import {
  useMockRoasCampaigns,
  useMockCreateRoasCampaign,
  isMockEnabled,
} from "@/shared/mock";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  TrendingUp,
  Plus,
  Search,
  X,
  MoreVertical,
  BarChart3,
  Target,
  Loader2,
  Activity,
} from "lucide-react";
import { formatAmount } from "@/shared/utils";

const CHANNELS = ["Facebook", "Instagram", "Google Ads", "TikTok", "WhatsApp", "Affiliation"];
const STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  paused: "En pause",
  ended: "Terminé",
};
const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
  paused: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
  ended: "bg-zinc-500/20 text-zinc-700 dark:text-zinc-400 border-zinc-500/30",
};

export default function RoasPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [createName, setCreateName] = useState("");
  const [createChannel, setCreateChannel] = useState(CHANNELS[0]);
  const [createSpend, setCreateSpend] = useState("");
  const [createRevenue, setCreateRevenue] = useState("");
  const [createStatus, setCreateStatus] = useState<"active" | "paused" | "ended">("active");

  const tenantId = useTenantId();
  const mockEnabled = isMockEnabled();

  const filters = useMemo(
    () => ({
      status: statusFilter === "all" ? undefined : statusFilter,
      channel: channelFilter === "all" ? undefined : channelFilter,
      limit: 100,
    }),
    [statusFilter, channelFilter]
  );

  const { data: roasData, isLoading, error } = useMockRoasCampaigns(filters);
  const campaigns = roasData?.data ?? [];
  const createCampaign = useMockCreateRoasCampaign();

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return campaigns;
    const q = searchQuery.toLowerCase();
    return campaigns.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.channel.toLowerCase().includes(q)
    );
  }, [campaigns, searchQuery]);

  const avgRoas = useMemo(() => {
    if (filtered.length === 0) return 0;
    const sum = filtered.reduce((s, c) => s + c.roas, 0);
    return sum / filtered.length;
  }, [filtered]);

  const totalSpend = useMemo(() => filtered.reduce((s, c) => s + c.spend, 0), [filtered]);
  const totalRevenue = useMemo(() => filtered.reduce((s, c) => s + c.revenueCashReal, 0), [filtered]);

  const handleCreate = async () => {
    const spend = parseFloat(createSpend.replace(/\s/g, "").replace(",", "."));
    const revenue = parseFloat(createRevenue.replace(/\s/g, "").replace(",", "."));
    if (Number.isNaN(spend) || Number.isNaN(revenue) || !createName.trim()) return;
    await createCampaign.mutateAsync({
      name: createName.trim(),
      channel: createChannel,
      spend,
      revenueCashReal: revenue,
      startDate: new Date().toISOString().split("T")[0],
      status: createStatus,
    });
    setShowCreateModal(false);
    setCreateName("");
    setCreateSpend("");
    setCreateRevenue("");
    setCreateChannel(CHANNELS[0]);
    setCreateStatus("active");
  };

  if (!mockEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent mb-2 tracking-tight">ROAS Cash Réel</h1>
          <p className="text-zinc-500 text-sm lg:text-base dark:text-zinc-400 font-medium">
            Return on Ad Spend basé sur les encaissements réels. Activez le mode démo ou connectez le backend.
          </p>
        </div>
        <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl">
          <CardContent className="p-16 text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-2xl animate-pulse" />
              <div className="relative p-6 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                <BarChart3 className="h-16 w-16 text-zinc-400 dark:text-zinc-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">Aucune donnée disponible</p>
            <p className="text-sm text-zinc-500">Activez le mode démo ou connectez le backend.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading && !campaigns.length) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 dark:from-black dark:via-zinc-950 dark:to-black">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500 mx-auto" />
            <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-2 border-amber-500/30" />
          </div>
          <p className="text-lg font-semibold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Chargement des campagnes ROAS...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full border-red-200/80 dark:border-red-900/50 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="p-4 rounded-full bg-red-500/10 inline-block mb-4">
                <TrendingUp className="h-12 w-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Erreur de chargement</h2>
              <p className="text-sm text-zinc-500 mb-6">
                {error instanceof Error ? error.message : "Une erreur est survenue lors du chargement des campagnes ROAS"}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white"
              >
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-600/30 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 p-3 shadow-2xl shadow-amber-500/20 ring-2 ring-amber-500/20 group-hover:scale-105 transition-transform duration-300">
                  <TrendingUp className="h-full w-full text-amber-400 dark:text-amber-500" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent mb-2 tracking-tight">
                  ROAS Cash Réel
                </h1>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-500 animate-pulse" />
                  <p className="text-zinc-500 text-sm lg:text-base dark:text-zinc-400 font-medium">
                    Retour sur investissement publicitaire (encaissements réels)
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 px-6 py-2.5 font-semibold transition-all duration-200 hover:scale-105 group"
            >
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Nouvelle campagne
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-amber-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                    <BarChart3 className="h-4 w-4 text-amber-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-1">
                  {filtered.length}
                </div>
                <p className="text-xs text-zinc-500 font-medium">Campagnes</p>
              </CardContent>
            </Card>
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-red-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-rose-500/20">
                    <Target className="h-4 w-4 text-red-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent mb-1">
                  {formatAmount(totalSpend)} FCFA
                </div>
                <p className="text-xs text-zinc-500 font-medium">Budget total</p>
              </CardContent>
            </Card>
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-green-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-1">
                  {formatAmount(totalRevenue)} FCFA
                </div>
                <p className="text-xs text-zinc-500 font-medium">Revenus (cash réel)</p>
              </CardContent>
            </Card>
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-amber-500/40 border-amber-500/20 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                    <Target className="h-4 w-4 text-amber-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-1">
                  {avgRoas.toFixed(2)}x
                </div>
                <p className="text-xs text-zinc-500 font-medium">ROAS moyen</p>
              </CardContent>
            </Card>
          </div>

          <div className="relative group mb-6">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-300" />
            <div className="relative flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-amber-500 transition-colors" />
                <Input
                  type="text"
                  placeholder="Rechercher par nom ou canal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-12 h-14 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-zinc-200/80 dark:border-zinc-800/80 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-base shadow-lg transition-all duration-300"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <X className="h-4 w-4 text-zinc-400" />
                  </button>
                )}
              </div>
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="h-14 px-4 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="all">Tous les canaux</option>
                {CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-14 px-4 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="paused">En pause</option>
                <option value="ended">Terminé</option>
              </select>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl">
            <CardContent className="p-16 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-2xl animate-pulse" />
                <div className="relative p-6 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                  <BarChart3 className="h-16 w-16 text-zinc-400 dark:text-zinc-600" />
                </div>
              </div>
              <p className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">Aucune campagne</p>
              <p className="text-sm text-zinc-500 mb-6">
                Créez une campagne pour suivre le ROAS basé sur les encaissements réels.
              </p>
              <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle campagne
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200/80 bg-gradient-to-r from-zinc-50 to-white dark:border-zinc-800/50 dark:from-zinc-950/50 dark:to-zinc-900/30">
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-700 uppercase tracking-wider dark:text-zinc-300">Campagne</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">Canal</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">Dépense</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">Revenus (cash réel)</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">ROAS</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                    {filtered.map((c) => (
                        <tr key={c.id} className="group hover:bg-gradient-to-r hover:from-amber-500/5 hover:to-orange-500/5 transition-all duration-300">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-amber-500/15">
                              <Target className="h-3.5 w-3.5 text-amber-500" />
                            </div>
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{c.channel}</td>
                        <td className="px-6 py-4 text-right font-medium text-red-600 dark:text-red-400">
                          {formatAmount(c.spend)} FCFA
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-green-600 dark:text-green-400">
                          {formatAmount(c.revenueCashReal)} FCFA
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`font-semibold ${
                              c.roas >= 2 ? "text-green-600 dark:text-green-400" : c.roas >= 1 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {c.roas.toFixed(2)}x
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status] ?? "bg-zinc-500/20"}`}
                          >
                            {STATUS_LABELS[c.status] ?? c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal création campagne */}
        {showCreateModal && typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setShowCreateModal(false)}
            >
              <Card className="relative w-full max-w-md bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-t-xl">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Nouvelle campagne ROAS</h2>
                    <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}><X className="h-5 w-5" /></Button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <Label>Nom de la campagne</Label>
                      <Input
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                        placeholder="Ex: Campagne Facebook 03/2025"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Canal</Label>
                      <select
                        value={createChannel}
                        onChange={(e) => setCreateChannel(e.target.value)}
                        className="mt-1 w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3"
                      >
                        {CHANNELS.map((ch) => (
                          <option key={ch} value={ch}>{ch}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Dépense publicitaire (FCFA)</Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={createSpend}
                        onChange={(e) => setCreateSpend(e.target.value)}
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Revenus encaissés - cash réel (FCFA)</Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={createRevenue}
                        onChange={(e) => setCreateRevenue(e.target.value)}
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Statut</Label>
                      <select
                        value={createStatus}
                        onChange={(e) => setCreateStatus(e.target.value as "active" | "paused" | "ended")}
                        className="mt-1 w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3"
                      >
                        <option value="active">Actif</option>
                        <option value="paused">En pause</option>
                        <option value="ended">Terminé</option>
                      </select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>Annuler</Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 font-semibold"
                        onClick={handleCreate}
                        disabled={
                          createCampaign.isPending ||
                          !createName.trim() ||
                          !createSpend.trim() ||
                          !createRevenue.trim()
                        }
                      >
                        {createCampaign.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>,
            document.body
          )}
      </div>
    </div>
  );
}
