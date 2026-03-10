"use client";

import React, { useState, useEffect } from "react";
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
import { useProducts } from "@/shared/products/hooks";
import {
  useStocks,
  useCreateOrAdjustStock,
  useUpdateStockQuantity,
  useDeleteStock,
} from "@/shared/stocks/hooks";
import type { Stock } from "@/shared/stocks/hooks";
import { extractApiError } from "@/shared/api/axios";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Warehouse,
  Plus,
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Package,
  Building2,
  Pencil,
  Trash2,
  Hash,
} from "lucide-react";

const createOrAdjustStockSchema = z.object({
  product_id: z.string().min(1, "Veuillez sélectionner un produit"),
  quantity: z.number().int().min(0, "La quantité doit être ≥ 0"),
  organization_id: z.string().min(1, "Veuillez sélectionner une organisation"),
});

type CreateOrAdjustStockFormValues = z.infer<typeof createOrAdjustStockSchema>;

const updateQuantitySchema = z.object({
  quantity: z.number().int().min(0, "La quantité doit être ≥ 0"),
});

type UpdateQuantityFormValues = z.infer<typeof updateQuantitySchema>;

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 shrink-0">
        {label}
      </span>
      <span className="text-sm text-zinc-900 dark:text-zinc-100 text-right break-all">
        {value}
      </span>
    </div>
  );
}

export default function StockPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const tenantId = useTenantId();
  const persistedOrgId = useSelectedOrganizationId(tenantId ?? undefined);
  const setSelectedOrganizationId = useSetSelectedOrganizationId();
  const { data: organizations = [] } = useOrganizations(tenantId);
  const defaultOrg = organizations.find((o) => o.is_default) ?? organizations[0];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateOrAdjustStockFormValues>({
    resolver: zodResolver(createOrAdjustStockSchema),
    defaultValues: {
      product_id: "",
      quantity: 0,
      organization_id: "",
    },
  });

  useEffect(() => {
    if (!tenantId || organizations.length === 0) return;
    const validPersisted =
      persistedOrgId && organizations.some((o) => o.id === persistedOrgId);
    const initialOrgId = validPersisted ? persistedOrgId : defaultOrg?.id ?? "";
    if (initialOrgId) setValue("organization_id", initialOrgId);
  }, [tenantId, organizations, persistedOrgId, defaultOrg?.id, setValue]);

  const selectedOrgId =
    watch("organization_id") || persistedOrgId || defaultOrg?.id;

  useEffect(() => {
    if (tenantId && selectedOrgId) {
      setSelectedOrganizationId(tenantId, selectedOrgId);
    }
  }, [tenantId, selectedOrgId, setSelectedOrganizationId]);

  const { data: stocks = [], isLoading, error } = useStocks(
    tenantId,
    selectedOrgId || undefined
  );
  const { data: products = [] } = useProducts(tenantId, selectedOrgId);

  const updateQuantityForm = useForm<UpdateQuantityFormValues>({
    resolver: zodResolver(updateQuantitySchema),
    defaultValues: { quantity: 0 },
  });

  const createOrAdjustStock = useCreateOrAdjustStock(
    tenantId,
    selectedOrgId || undefined
  );
  const updateQuantity = useUpdateStockQuantity(
    tenantId,
    selectedOrgId || undefined
  );
  const deleteStock = useDeleteStock(tenantId, selectedOrgId || undefined);

  const onSubmitCreate = handleSubmit(async (values) => {
    await createOrAdjustStock.mutateAsync(
      {
        product_id: values.product_id,
        quantity: values.quantity,
      },
      {
        onSuccess: () => {
          setCreateSuccess(true);
          reset({ product_id: "", quantity: 0, organization_id: values.organization_id });
          setTimeout(() => {
            setCreateSuccess(false);
            setShowCreateModal(false);
          }, 2000);
        },
      }
    );
  });

  const onSubmitUpdateQuantity = updateQuantityForm.handleSubmit(
    async (values) => {
      if (!editingStock) return;
      await updateQuantity.mutateAsync(
        { id: editingStock.id, quantity: values.quantity },
        {
          onSuccess: () => {
            setEditingStock(null);
            setSelectedStock(null);
          },
        }
      );
    }
  );

  const handleDelete = async (stock: Stock) => {
    const productLabel =
      products.find((p) => p.id === stock.product_id)?.name ?? stock.product_id;
    if (!confirm(`Supprimer le stock pour « ${productLabel} » ?`)) return;
    setDeletingId(stock.id);
    await deleteStock.mutateAsync(stock.id, {
      onSettled: () => setDeletingId(null),
      onSuccess: () => setSelectedStock(null),
    });
  };

  useEffect(() => {
    if (editingStock) {
      updateQuantityForm.reset({ quantity: editingStock.quantity });
    }
  }, [editingStock, updateQuantityForm]);

  const canSubmitCreate =
    !!selectedOrgId &&
    !!tenantId &&
    !createOrAdjustStock.isPending &&
    !createSuccess;
  const showNoOrgMessage = organizations.length === 0 || !selectedOrgId;

  const getProductLabel = (stock: Stock) => {
    if (stock.product?.name) return stock.product.name;
    const p = products.find((x) => x.id === stock.product_id);
    return p ? `${p.name}${p.sku ? ` (${p.sku})` : ""}` : stock.product_id;
  };

  const filtered = stocks.filter((s) => {
    const label = getProductLabel(s).toLowerCase();
    const q = String(s.quantity);
    return (
      label.includes(searchQuery.toLowerCase()) || q.includes(searchQuery)
    );
  });

  const totalQuantity = filtered.reduce((acc, s) => acc + s.quantity, 0);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 dark:from-black dark:via-zinc-950 dark:to-black">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500 mx-auto" />
          </div>
          <p className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            Chargement des stocks...
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
                  : "Une erreur est survenue lors du chargement des stocks"}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-600/30 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 p-3 shadow-2xl shadow-emerald-500/20 ring-2 ring-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                  <Warehouse className="h-full w-full text-emerald-400 dark:text-emerald-500" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent mb-2 tracking-tight">
                  Vue Stock
                </h1>
                <p className="text-zinc-500 text-sm lg:text-base dark:text-zinc-400 font-medium">
                  Liste des stocks et quantités
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 px-6 py-2.5 font-semibold transition-all duration-200 hover:scale-105 group"
            >
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Créer / Ajuster stock
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-emerald-500/40 transition-all duration-500 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                    <Warehouse className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent mb-1">
                  {stocks.length}
                </div>
                <p className="text-xs text-zinc-500 font-medium">
                  Références en stock
                </p>
              </CardContent>
            </Card>
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-teal-500/40 transition-all duration-500 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20">
                    <Hash className="h-4 w-4 text-teal-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent mb-1">
                  {totalQuantity}
                </div>
                <p className="text-xs text-zinc-500 font-medium">
                  Quantité totale (filtrée)
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="relative group mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              type="text"
              placeholder="Rechercher par produit ou quantité..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 h-14 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-zinc-200/80 dark:border-zinc-800/80 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-base shadow-lg transition-all duration-300"
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
        </div>

        {filtered.length === 0 ? (
          <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl">
            <CardContent className="p-16 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl animate-pulse" />
                <div className="relative p-6 rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                  <Warehouse className="h-16 w-16 text-zinc-400 dark:text-zinc-600" />
                </div>
              </div>
              <p className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Aucun stock trouvé
              </p>
              <p className="text-sm text-zinc-500 mb-6">
                {searchQuery
                  ? "Essayez de modifier votre recherche"
                  : "Aucun stock enregistré pour cette organisation."}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer / Ajuster stock
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200/80 bg-gradient-to-r from-zinc-50 to-white dark:border-zinc-900/50 dark:from-zinc-950/50 dark:to-zinc-900/30">
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-700 uppercase tracking-wider dark:text-zinc-300">
                        Produit
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                        Quantité
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-900/50">
                    {filtered.map((stock) => (
                      <tr
                        key={stock.id}
                        className="group hover:bg-gradient-to-r hover:from-emerald-500/5 hover:to-teal-500/5 transition-all duration-300"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-emerald-500/15">
                              <Package className="h-3.5 w-3.5 text-emerald-500" />
                            </div>
                            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                              {getProductLabel(stock)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                            <Hash className="h-3.5 w-3.5 text-zinc-500" />
                            {stock.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedStock(stock)}
                            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
                          >
                            Voir
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingStock(stock)}
                            className="text-zinc-600 hover:text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(stock)}
                            disabled={deletingId === stock.id}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-500/10"
                          >
                            {deletingId === stock.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal détail stock */}
        {selectedStock &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setSelectedStock(null)}
            >
              <Card
                className="relative w-full max-w-lg bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20">
                        <Warehouse className="h-5 w-5 text-emerald-500" />
                      </div>
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {getProductLabel(selectedStock)}
                      </h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedStock(null)}
                      className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="p-6 space-y-4">
                    <DetailRow
                      label="Produit"
                      value={getProductLabel(selectedStock)}
                    />
                    <DetailRow label="Quantité" value={selectedStock.quantity} />
                    {selectedStock.created_at && (
                      <DetailRow
                        label="Créé le"
                        value={new Date(
                          selectedStock.created_at
                        ).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      />
                    )}
                    {selectedStock.updated_at && (
                      <DetailRow
                        label="Modifié le"
                        value={new Date(
                          selectedStock.updated_at
                        ).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      />
                    )}
                  </div>
                  <div className="px-6 pb-6 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setEditingStock(selectedStock);
                        setSelectedStock(null);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Modifier quantité
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/50"
                      onClick={() => handleDelete(selectedStock)}
                      disabled={deletingId === selectedStock.id}
                    >
                      {deletingId === selectedStock.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>,
            document.body
          )}

        {/* Modal créer / ajuster stock */}
        {showCreateModal &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setShowCreateModal(false)}
            >
              <Card
                className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20">
                        <Warehouse className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          Créer ou ajuster un stock
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Produit et quantité (tenantId + organizationId envoyés)
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowCreateModal(false)}
                      className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {createSuccess && (
                    <div className="mx-6 mt-5 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-200">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                      <span className="font-semibold">
                        Stock créé ou ajusté avec succès !
                      </span>
                    </div>
                  )}

                  {createOrAdjustStock.error && !createSuccess && (
                    <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
                      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                      <span>
                        {extractApiError(createOrAdjustStock.error).message}
                      </span>
                    </div>
                  )}

                  {showNoOrgMessage && !createOrAdjustStock.error && (
                    <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
                      <Building2 className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">
                          {organizations.length === 0
                            ? "Aucune organisation disponible"
                            : "Sélectionnez une organisation"}
                        </p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={onSubmitCreate} className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="organization_id">Organisation</Label>
                      <select
                        id="organization_id"
                        {...register("organization_id")}
                        className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        <option value="">Choisir une organisation</option>
                        {organizations.map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                      {errors.organization_id && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {errors.organization_id.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product_id">Produit</Label>
                      <select
                        id="product_id"
                        {...register("product_id")}
                        className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        <option value="">Choisir un produit</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} {p.sku ? `(${p.sku})` : ""}
                          </option>
                        ))}
                      </select>
                      {errors.product_id && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {errors.product_id.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantité</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min={0}
                        {...register("quantity", { valueAsNumber: true })}
                        className="bg-white dark:bg-zinc-900"
                      />
                      {errors.quantity && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {errors.quantity.message}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowCreateModal(false)}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        disabled={!canSubmitCreate}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                      >
                        {createOrAdjustStock.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Enregistrer"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>,
            document.body
          )}

        {/* Modal modifier quantité */}
        {editingStock &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setEditingStock(null)}
            >
              <Card
                className="relative w-full max-w-md bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20">
                        <Pencil className="h-5 w-5 text-emerald-500" />
                      </div>
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        Modifier la quantité
                      </h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingStock(null)}
                      className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <form
                    onSubmit={onSubmitUpdateQuantity}
                    className="p-6 space-y-4"
                  >
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Produit : {getProductLabel(editingStock)}
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="edit_quantity">Quantité</Label>
                      <Input
                        id="edit_quantity"
                        type="number"
                        min={0}
                        {...updateQuantityForm.register("quantity", {
                          valueAsNumber: true,
                        })}
                        className="bg-white dark:bg-zinc-900"
                      />
                      {updateQuantityForm.formState.errors.quantity && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {
                            updateQuantityForm.formState.errors.quantity
                              .message
                          }
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setEditingStock(null)}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        disabled={updateQuantity.isPending}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                      >
                        {updateQuantity.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Enregistrer"
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
    </div>
  );
}
