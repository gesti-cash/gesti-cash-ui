"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useTenantId,
  useSelectedOrganizationId,
  useSetSelectedOrganizationId,
} from "@/shared/tenant/store";
import { useOrganizations } from "@/shared/organizations/hooks";
import {
  useInventories,
  useInventory,
  useCreateInventory,
  useStartInventory,
  useValidateInventory,
  useCountingLine,
  type Inventory,
  type InventoryLine,
} from "@/shared/inventories/hooks";
import { extractApiError } from "@/shared/api/axios";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import {
  FolderOpen,
  Plus,
  Search,
  X,
  Play,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Hash,
  Building2,
  ClipboardList,
} from "lucide-react";

const STATUS_TRANSLATIONS: Record<string, string> = {
  draft: "Brouillon",
  DRAFT: "Brouillon",
  in_progress: "En cours",
  "in-progress": "En cours",
  validated: "Validé",
  VALIDATED: "Validé",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-zinc-500/20 text-zinc-700 dark:text-zinc-400 border-zinc-500/30",
  DRAFT: "bg-zinc-500/20 text-zinc-700 dark:text-zinc-400 border-zinc-500/30",
  in_progress:
    "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
  "in-progress":
    "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
  validated:
    "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
  VALIDATED:
    "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
};

const STATUS_FILTERS = [
  { value: "all", label: "Tous" },
  { value: "draft", label: "Brouillon" },
  { value: "in_progress", label: "En cours" },
  { value: "validated", label: "Validé" },
];

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

function generateInventoryReference(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(100 + Math.random() * 900);
  return `INV-${date}-${random}`;
}

const createInventorySchema = z.object({
  reference: z.string().min(1, "La référence est obligatoire"),
});

type CreateInventoryFormValues = z.infer<typeof createInventorySchema>;

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(
    null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  const tenantId = useTenantId();
  const persistedOrgId = useSelectedOrganizationId(tenantId ?? undefined);
  const setSelectedOrganizationId = useSetSelectedOrganizationId();
  const { data: organizations = [] } = useOrganizations(tenantId);
  const defaultOrg = organizations.find((o) => o.is_default) ?? organizations[0];

  const selectedOrgId = (persistedOrgId || defaultOrg?.id) ?? "";

  useEffect(() => {
    if (tenantId && selectedOrgId) {
      setSelectedOrganizationId(tenantId, selectedOrgId);
    }
  }, [tenantId, selectedOrgId, setSelectedOrganizationId]);

  const { data: inventories = [], isLoading, error } = useInventories(
    tenantId ?? undefined,
    selectedOrgId || undefined
  );

  const { data: inventoryDetail, isLoading: detailLoading } = useInventory(
    tenantId ?? undefined,
    selectedInventory?.id,
    selectedOrgId || undefined
  );

  const createMutation = useCreateInventory(
    tenantId ?? undefined,
    selectedOrgId || undefined
  );
  const startMutation = useStartInventory(
    tenantId ?? undefined,
    selectedOrgId || undefined
  );
  const validateMutation = useValidateInventory(
    tenantId ?? undefined,
    selectedOrgId || undefined
  );
  const countingMutation = useCountingLine(
    tenantId ?? undefined,
    selectedOrgId || undefined,
    selectedInventory?.id
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateInventoryFormValues>({
    resolver: zodResolver(createInventorySchema),
    defaultValues: { reference: "" },
  });

  const onSubmitCreate = handleSubmit((values) => {
    createMutation.mutate(
      { reference: values.reference },
      {
        onSuccess: () => {
          setCreateSuccess(true);
          reset({ reference: generateInventoryReference() });
          setTimeout(() => {
            setCreateSuccess(false);
            setShowCreateModal(false);
          }, 2000);
        },
      }
    );
  });

  const openCreateModal = () => {
    reset({ reference: generateInventoryReference() });
    setCreateSuccess(false);
    setShowCreateModal(true);
  };

  const filteredInventories = useMemo(() => {
    let list = inventories;
    if (selectedStatus !== "all") {
      const norm = (s: string) => s?.toLowerCase?.() ?? "";
      const target =
        selectedStatus === "in_progress" ? "in_progress" : selectedStatus;
      list = list.filter((inv) => norm(inv.status) === target);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (inv) =>
          (inv.reference ?? "").toLowerCase().includes(q) ||
          inv.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [inventories, selectedStatus, searchQuery]);

  const displayInventory = inventoryDetail ?? selectedInventory;
  const lines = displayInventory?.lines ?? [];
  const isDraft =
    displayInventory?.status === "draft" || displayInventory?.status === "DRAFT";
  const isInProgress =
    displayInventory?.status === "in_progress" ||
    displayInventory?.status === "in-progress";
  const isValidated =
    displayInventory?.status === "validated" ||
    displayInventory?.status === "VALIDATED";

  const handleStart = (id: string) => {
    if (!confirm("Démarrer cet inventaire ? Les lignes seront créées à partir des produits actifs."))
      return;
    startMutation.mutate(id, {
      onSuccess: (updated) => {
        if (updated) setSelectedInventory(updated);
      },
    });
  };

  const handleValidate = (id: string) => {
    if (
      !confirm(
        "Valider cet inventaire ? Les mouvements d'écart seront enregistrés."
      )
    )
      return;
    validateMutation.mutate(id, {
      onSuccess: (updated) => {
        if (updated) setSelectedInventory(updated);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 dark:from-black dark:via-zinc-950 dark:to-black">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500 mx-auto" />
          <p className="text-lg font-semibold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Chargement des inventaires...
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
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Erreur de chargement
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                {error instanceof Error
                  ? error.message
                  : "Une erreur est survenue lors du chargement des inventaires"}
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

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-600/30 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
              <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 p-3 shadow-2xl shadow-amber-500/20 ring-2 ring-amber-500/20 group-hover:scale-105 transition-transform duration-300">
                <FolderOpen className="h-full w-full text-amber-500 dark:text-amber-400" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-orange-400 mb-2">
                Inventaires
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Créez et gérez vos inventaires (brouillon → démarrage → comptage → validation)
              </p>
            </div>
          </div>
          <Button
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-lg shadow-amber-500/20"
            onClick={openCreateModal}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvel inventaire
          </Button>
        </div>

        {organizations.length > 1 && (
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <Building2 className="h-4 w-4" />
            <span>
              Organisation :{" "}
              {organizations.find((o) => o.id === selectedOrgId)?.name ??
                selectedOrgId}
            </span>
          </div>
        )}

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-amber-500 transition-colors" />
          <Input
            type="text"
            placeholder="Rechercher par référence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 h-12 bg-white/80 dark:bg-zinc-900/80 border-zinc-200/80 dark:border-zinc-800/80 focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="h-4 w-4 text-zinc-400" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              onClick={() => setSelectedStatus(filter.value)}
              variant="ghost"
              className={
                selectedStatus === filter.value
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0"
                  : "bg-white/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
              }
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white/80 dark:bg-zinc-900/50 border-zinc-200/80 dark:border-zinc-800/80">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <FolderOpen className="h-4 w-4 text-amber-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {inventories.length}
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                Inventaires au total
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-zinc-900/50 border-zinc-200/80 dark:border-zinc-800/80">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Hash className="h-4 w-4 text-orange-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {filteredInventories.length}
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                Affichés (filtrés)
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 dark:bg-zinc-900/50 border-zinc-200/80 dark:border-zinc-800/80 shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200/80 bg-zinc-50/80 dark:bg-zinc-900/50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-700 uppercase tracking-wider dark:text-zinc-300">
                      Référence
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                      Créé le
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                      Démarré / Clôturé
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                  {filteredInventories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <FolderOpen className="h-12 w-12 text-zinc-400 dark:text-zinc-600 mb-4" />
                          <p className="text-zinc-600 dark:text-zinc-400 font-medium">
                            Aucun inventaire trouvé
                          </p>
                          <Button
                            variant="outline"
                            className="mt-4 border-amber-500/50 text-amber-600 dark:text-amber-400"
                            onClick={openCreateModal}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Créer un inventaire
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInventories.map((inv) => {
                      const statusKey = inv.status;
                      const statusLabel =
                        STATUS_TRANSLATIONS[statusKey] ?? inv.status;
                      const statusColor =
                        STATUS_COLORS[statusKey] ??
                        "bg-zinc-500/20 text-zinc-700 dark:text-zinc-400";
                      const isSelected =
                        selectedInventory?.id === inv.id;
                      return (
                        <tr
                          key={inv.id}
                          className={`group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors ${
                            isSelected
                              ? "bg-amber-500/10 dark:bg-amber-500/10"
                              : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedInventory(isSelected ? null : inv)
                              }
                              className="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline text-left"
                            >
                              {inv.reference || inv.id}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant="outline"
                              className={statusColor}
                            >
                              {statusLabel}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                            {formatDate(inv.created_at)}
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                            {formatDateTime(inv.started_at)} /{" "}
                            {formatDateTime(inv.closed_at)}
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setSelectedInventory(isSelected ? null : inv)
                              }
                              className="text-amber-600 dark:text-amber-400"
                            >
                              {isSelected ? "Masquer" : "Détail"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {selectedInventory && (
          <Card className="bg-white/80 dark:bg-zinc-900/50 border-amber-500/30 dark:border-amber-500/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-amber-500" />
                  Détail : {displayInventory?.reference ?? selectedInventory.reference}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedInventory(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {detailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge
                      variant="outline"
                      className={
                        STATUS_COLORS[displayInventory?.status ?? ""] ??
                        "bg-zinc-500/20"
                      }
                    >
                      {STATUS_TRANSLATIONS[displayInventory?.status ?? ""] ??
                        displayInventory?.status}
                    </Badge>
                    {isDraft && (
                      <Button
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                        disabled={startMutation.isPending}
                        onClick={() =>
                          handleStart(selectedInventory.id)
                        }
                      >
                        {startMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        Démarrer l&apos;inventaire
                      </Button>
                    )}
                    {isInProgress && (
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white"
                        disabled={validateMutation.isPending}
                        onClick={() =>
                          handleValidate(selectedInventory.id)
                        }
                      >
                        {validateMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        Valider l&apos;inventaire
                      </Button>
                    )}
                  </div>

                  {lines.length === 0 && !detailLoading && (
                    <p className="text-sm text-zinc-500 py-4">
                      {isDraft
                        ? "Démarrez l'inventaire pour générer les lignes par produit actif."
                        : "Aucune ligne."}
                    </p>
                  )}

                  {lines.length > 0 && (
                    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-zinc-100 dark:bg-zinc-800/80">
                            <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">
                              Produit
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-zinc-700 dark:text-zinc-300">
                              Qté système
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-zinc-700 dark:text-zinc-300">
                              Qté comptée
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-zinc-700 dark:text-zinc-300">
                              Écart
                            </th>
                            {isInProgress && (
                              <th className="px-4 py-3 text-right font-semibold text-zinc-700 dark:text-zinc-300">
                                Saisie
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                          {lines.map((line) => (
                            <InventoryLineRow
                              key={line.id}
                              line={line}
                              isInProgress={isInProgress}
                              countingMutation={countingMutation}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {showCreateModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <Card className="w-full max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-2xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                  Créer un inventaire (brouillon)
                </h3>
                <form onSubmit={onSubmitCreate} className="space-y-4">
                  <div>
                    <Label htmlFor="reference">Référence</Label>
                    <Input
                      id="reference"
                      {...register("reference")}
                      placeholder="ex: INV-20260309-001"
                      className="mt-1"
                    />
                    {errors.reference && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.reference.message}
                      </p>
                    )}
                  </div>
                  {createMutation.isError && (
                    <p className="text-sm text-red-500">
                      {extractApiError(createMutation.error).message}
                    </p>
                  )}
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                      disabled={createMutation.isPending || createSuccess}
                    >
                      {createMutation.isPending || createSuccess ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {createSuccess ? "Créé !" : "Création..."}
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Créer
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>,
          document.body
        )}
    </div>
  );
}

function InventoryLineRow({
  line,
  isInProgress,
  countingMutation,
}: {
  line: InventoryLine;
  isInProgress: boolean;
  countingMutation: ReturnType<typeof useCountingLine>;
}) {
  const [counted, setCounted] = useState<number>(
    line.counted_quantity ?? line.system_quantity
  );
  const [saving, setSaving] = useState(false);

  const gap =
    line.gap != null
      ? line.gap
      : (line.counted_quantity ?? 0) - (line.system_quantity ?? 0);

  const handleSaveCount = () => {
    setSaving(true);
    countingMutation.mutate(
      { lineId: line.id, counted_quantity: counted },
      {
        onSettled: () => setSaving(false),
      }
    );
  };

  const productLabel =
    (line as { product_name?: string }).product_name ??
    (line as { product_sku?: string }).product_sku ??
    line.product_id;

  return (
    <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
      <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
        {productLabel}
      </td>
      <td className="px-4 py-3 text-right tabular-nums">
        {line.system_quantity ?? 0}
      </td>
      <td className="px-4 py-3 text-right tabular-nums">
        {line.counted_quantity ?? "—"}
      </td>
      <td className="px-4 py-3 text-right tabular-nums">
        {gap !== 0 ? (
          <span className={gap > 0 ? "text-green-600" : "text-red-600"}>
            {gap > 0 ? "+" : ""}
            {gap}
          </span>
        ) : (
          "—"
        )}
      </td>
      {isInProgress && (
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-2">
            <Input
              type="number"
              min={0}
              value={counted}
              onChange={(e) =>
                setCounted(parseInt(e.target.value, 10) || 0)
              }
              className="w-24 text-right"
            />
            <Button
              size="sm"
              onClick={handleSaveCount}
              disabled={saving || countingMutation.isPending}
            >
              {saving || countingMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Enregistrer"
              )}
            </Button>
          </div>
        </td>
      )}
    </tr>
  );
}
