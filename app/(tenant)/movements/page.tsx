"use client";

import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  useTenantId,
} from "@/shared/tenant/store";
import {
  useMockMovements,
  useMockCreateMovement,
  isMockEnabled,
} from "@/shared/mock";
import type { MockStockMovement } from "@/shared/mock/generators";
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
  Eye,
  MoreVertical,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  ArrowLeftRight,
  Filter,
  Activity,
} from "lucide-react";
import { formatAmount, formatDateTime } from "@/shared/utils";

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  IN: "Entrée",
  OUT: "Sortie",
  ADJUSTMENT: "Ajustement",
  TRANSFER: "Transfert",
};

const MOVEMENT_TYPE_COLORS: Record<string, string> = {
  IN: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
  OUT: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30",
  ADJUSTMENT: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
  TRANSFER: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
};

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 shrink-0">{label}</span>
      <span className="text-sm text-zinc-900 dark:text-zinc-100 text-right break-all">{value}</span>
    </div>
  );
}

export default function MovementsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedMovement, setSelectedMovement] = useState<MockStockMovement | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const tenantId = useTenantId();
  const mockEnabled = isMockEnabled();

  const filters = useMemo(() => ({
    type: typeFilter === "all" ? undefined : typeFilter,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    limit: 100,
  }), [typeFilter, dateFrom, dateTo]);

  const { data: movementsData, isLoading, error } = useMockMovements(filters);
  const movements = movementsData?.data ?? [];
  const createMovement = useMockCreateMovement();

  const [createProductName, setCreateProductName] = useState("");
  const [createType, setCreateType] = useState<"IN" | "OUT" | "ADJUSTMENT" | "TRANSFER">("IN");
  const [createQuantity, setCreateQuantity] = useState(1);
  const [createReason, setCreateReason] = useState("");

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return movements;
    const q = searchQuery.toLowerCase();
    return movements.filter(
      (m) =>
        m.productName.toLowerCase().includes(q) ||
        (m.reference && m.reference.toLowerCase().includes(q)) ||
        (m.reason && m.reason.toLowerCase().includes(q))
    );
  }, [movements, searchQuery]);

  const handleCreate = async () => {
    if (!createProductName.trim() || createQuantity <= 0) return;
    await createMovement.mutateAsync({
      productId: `prod-${Date.now()}`,
      productName: createProductName,
      type: createType,
      quantity: createType === "OUT" ? -createQuantity : createQuantity,
      reason: createReason || undefined,
    });
    setShowCreateModal(false);
    setCreateProductName("");
    setCreateQuantity(1);
    setCreateReason("");
  };

  const TypeIcon = ({ type }: { type: string }) => {
    switch (type) {
      case "IN": return <ArrowDownCircle className="h-4 w-4 text-green-500" />;
      case "OUT": return <ArrowUpCircle className="h-4 w-4 text-red-500" />;
      case "ADJUSTMENT": return <RefreshCw className="h-4 w-4 text-amber-500" />;
      case "TRANSFER": return <ArrowLeftRight className="h-4 w-4 text-blue-500" />;
      default: return <TrendingUp className="h-4 w-4 text-zinc-500" />;
    }
  };

  if (!mockEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-sky-400 via-blue-400 to-sky-500 bg-clip-text text-transparent mb-2 tracking-tight">Mouvements</h1>
          <p className="text-zinc-500 text-sm lg:text-base dark:text-zinc-400 font-medium">
            Historique des mouvements de stock. Activez le mode démo ou connectez le backend.
          </p>
        </div>
        <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl">
          <CardContent className="p-16 text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-2xl animate-pulse" />
              <div className="relative p-6 rounded-full bg-gradient-to-br from-sky-500/10 to-blue-500/10">
                <TrendingUp className="h-16 w-16 text-zinc-400 dark:text-zinc-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">Aucune donnée disponible</p>
            <p className="text-sm text-zinc-500">Utilisez le mode mock ou connectez l&apos;API.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 dark:from-black dark:via-zinc-950 dark:to-black">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-sky-500/20 border-t-sky-500 mx-auto" />
            <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-2 border-sky-500/30" />
          </div>
          <p className="text-lg font-semibold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
            Chargement des mouvements...
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
                {error instanceof Error ? error.message : "Une erreur est survenue lors du chargement des mouvements"}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white"
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-sky-500/30 to-blue-600/30 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 p-3 shadow-2xl shadow-sky-500/20 ring-2 ring-sky-500/20 group-hover:scale-105 transition-transform duration-300">
                  <TrendingUp className="h-full w-full text-sky-400 dark:text-sky-500" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-sky-400 via-blue-400 to-sky-500 bg-clip-text text-transparent mb-2 tracking-tight">
                  Mouvements
                </h1>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-sky-500 animate-pulse" />
                  <p className="text-zinc-500 text-sm lg:text-base dark:text-zinc-400 font-medium">
                    Historique et suivi des mouvements de stock
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/20 px-6 py-2.5 font-semibold transition-all duration-200 hover:scale-105 group"
            >
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Nouveau mouvement
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-sky-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-sky-500/10 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-500/20">
                    <TrendingUp className="h-4 w-4 text-sky-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent mb-1">
                  {movementsData?.meta?.total ?? 0}
                </div>
                <p className="text-xs text-zinc-500 font-medium">Mouvements au total</p>
              </CardContent>
            </Card>
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-green-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                    <ArrowDownCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-1">
                  {movements.filter((m) => m.quantity > 0).length}
                </div>
                <p className="text-xs text-zinc-500 font-medium">Entrées</p>
              </CardContent>
            </Card>
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-red-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-rose-500/20">
                    <ArrowUpCircle className="h-4 w-4 text-red-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent mb-1">
                  {movements.filter((m) => m.quantity < 0).length}
                </div>
                <p className="text-xs text-zinc-500 font-medium">Sorties</p>
              </CardContent>
            </Card>
          </div>

          <div className="relative group mb-6">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-sky-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-300" />
            <div className="relative flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-sky-500 transition-colors" />
                <Input
                  type="text"
                  placeholder="Rechercher par produit, référence..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-12 h-14 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-zinc-200/80 dark:border-zinc-800/80 focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-base shadow-lg transition-all duration-300"
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
              <div className="flex flex-wrap gap-2 items-center">
                <Filter className="h-4 w-4 text-zinc-500 shrink-0" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-14 px-4 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="all">Tous les types</option>
                  {Object.entries(MOVEMENT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-14 w-[160px] border-zinc-200/80 dark:border-zinc-800/80 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-14 w-[160px] border-zinc-200/80 dark:border-zinc-800/80 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl">
            <CardContent className="p-16 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-2xl animate-pulse" />
                <div className="relative p-6 rounded-full bg-gradient-to-br from-sky-500/10 to-blue-500/10">
                  <TrendingUp className="h-16 w-16 text-zinc-400 dark:text-zinc-600" />
                </div>
              </div>
              <p className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">Aucun mouvement trouvé</p>
              <p className="text-sm text-zinc-500 mb-6">
                {searchQuery || typeFilter !== "all" || dateFrom || dateTo
                  ? "Modifiez les filtres ou créez un mouvement."
                  : "Commencez par créer votre premier mouvement"}
              </p>
              <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-sky-500 to-blue-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau mouvement
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200/80 bg-gradient-to-r from-zinc-50 to-white dark:border-zinc-900/50 dark:from-zinc-950/50 dark:to-zinc-900/30">
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-700 uppercase tracking-wider dark:text-zinc-300">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">Produit</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">Type</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">Quantité</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">Référence</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                    {filtered.map((mov) => (
                      <tr key={mov.id} className="group hover:bg-gradient-to-r hover:from-sky-500/5 hover:to-blue-500/5 transition-all duration-300">
                        <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          {formatDateTime(mov.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-zinc-900 dark:text-zinc-100">{mov.productName}</div>
                          {mov.productSku && <div className="text-xs text-zinc-500">{mov.productSku}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${MOVEMENT_TYPE_COLORS[mov.type] ?? "bg-zinc-500/20 text-zinc-700"}`}>
                            <TypeIcon type={mov.type} />
                            {MOVEMENT_TYPE_LABELS[mov.type] ?? mov.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={mov.quantity > 0 ? "text-green-600 dark:text-green-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>
                            {mov.quantity > 0 ? "+" : ""}{mov.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{mov.reference ?? "—"}</td>
                        <td className="px-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedMovement(mov)} className="cursor-pointer">
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal détail */}
        {selectedMovement && typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setSelectedMovement(null)}
            >
              <Card className="relative w-full max-w-lg bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-sky-500/10 to-blue-500/10 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-sky-500/20">
                        <TypeIcon type={selectedMovement.type} />
                      </div>
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{selectedMovement.productName}</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedMovement(null)}><X className="h-5 w-5" /></Button>
                  </div>
                  <div className="p-6 space-y-0">
                    <DetailRow label="Type" value={MOVEMENT_TYPE_LABELS[selectedMovement.type] ?? selectedMovement.type} />
                    <DetailRow label="Quantité" value={`${selectedMovement.quantity > 0 ? "+" : ""}${selectedMovement.quantity}`} />
                    <DetailRow label="Référence" value={selectedMovement.reference ?? "—"} />
                    <DetailRow label="Raison" value={selectedMovement.reason ?? "—"} />
                    <DetailRow label="Date" value={formatDateTime(selectedMovement.createdAt)} />
                    {selectedMovement.quantityBefore != null && <DetailRow label="Quantité avant" value={selectedMovement.quantityBefore} />}
                    {selectedMovement.quantityAfter != null && <DetailRow label="Quantité après" value={selectedMovement.quantityAfter} />}
                    {selectedMovement.createdBy && <DetailRow label="Créé par" value={selectedMovement.createdBy} />}
                  </div>
                </CardContent>
              </Card>
            </div>,
            document.body
          )}

        {/* Modal création */}
        {showCreateModal && typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setShowCreateModal(false)}
            >
              <Card className="relative w-full max-w-md bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-sky-500/10 to-blue-500/10 rounded-t-xl">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Nouveau mouvement</h2>
                    <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}><X className="h-5 w-5" /></Button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <Label>Produit</Label>
                      <Input
                        value={createProductName}
                        onChange={(e) => setCreateProductName(e.target.value)}
                        placeholder="Nom du produit"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <select
                        value={createType}
                        onChange={(e) => setCreateType(e.target.value as any)}
                        className="mt-1 w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3"
                      >
                        <option value="IN">Entrée</option>
                        <option value="OUT">Sortie</option>
                        <option value="ADJUSTMENT">Ajustement</option>
                        <option value="TRANSFER">Transfert</option>
                      </select>
                    </div>
                    <div>
                      <Label>Quantité</Label>
                      <Input
                        type="number"
                        min={1}
                        value={createQuantity}
                        onChange={(e) => setCreateQuantity(parseInt(e.target.value, 10) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Raison (optionnel)</Label>
                      <Input
                        value={createReason}
                        onChange={(e) => setCreateReason(e.target.value)}
                        placeholder="Ex: Ajustement inventaire"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>Annuler</Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/20 font-semibold"
                        onClick={handleCreate}
                        disabled={!createProductName.trim() || createQuantity <= 0 || createMovement.isPending}
                      >
                        {createMovement.isPending ? "Création..." : "Créer"}
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
