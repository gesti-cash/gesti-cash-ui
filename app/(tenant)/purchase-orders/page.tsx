"use client";

import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { SearchableSelect } from "@/shared/ui/searchable-select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useTenantId, useSelectedOrganizationId } from "@/shared/tenant/store";
import {
  usePurchaseOrders,
  useCreatePurchaseOrder,
  useConfirmPurchaseOrder,
  useGoodsReceiptPurchaseOrder,
  type PurchaseOrder,
} from "@/shared/purchase-orders/hooks";
import { extractApiError } from "@/shared/api/axios";
import { useSuppliers } from "@/shared/suppliers/hooks";
import { useProducts } from "@/shared/products/hooks";
import {
  ClipboardList,
  Plus,
  Search,
  X,
  CheckCircle2,
  Loader2,
  Eye,
  AlertTriangle,
  Hash,
  Package,
  Truck,
  MoreVertical,
} from "lucide-react";
import { formatPriceFCFA } from "@/shared/utils";

const STATUS_TRANSLATIONS: Record<string, string> = {
  draft: "Brouillon",
  DRAFT: "Brouillon",
  confirmed: "Confirmé",
  CONFIRMED: "Confirmé",
  received: "Réceptionné",
  RECEIVED: "Réceptionné",
  closed: "Clôturé",
  CLOSED: "Clôturé",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-zinc-500/20 text-zinc-700 dark:text-zinc-400 border-zinc-500/30",
  DRAFT: "bg-zinc-500/20 text-zinc-700 dark:text-zinc-400 border-zinc-500/30",
  confirmed:
    "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
  CONFIRMED:
    "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
  received:
    "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
  RECEIVED:
    "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
  closed: "bg-zinc-500/20 text-zinc-600 dark:text-zinc-400 border-zinc-500/30",
  CLOSED: "bg-zinc-500/20 text-zinc-600 dark:text-zinc-400 border-zinc-500/30",
};

const STATUS_FILTERS = [
  { value: "all", label: "Tous" },
  { value: "draft", label: "Brouillon" },
  { value: "confirmed", label: "Confirmé" },
  { value: "received", label: "Réceptionné" },
];

const formatPrice = (price: number | string | undefined): string =>
  formatPriceFCFA(price ?? 0);

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

const truncateId = (id: string, len = 8): string =>
  id && id.length > len ? `${id.slice(0, len)}…` : id || "—";

const getDisplayStatus = (
  order: PurchaseOrder
): { label: string; statusKey: string } => ({
  label: STATUS_TRANSLATIONS[order.status] || order.status,
  statusKey: order.status,
});

const getOrderDisplayId = (order: PurchaseOrder): string =>
  order.reference || order.id;

const getFirstLineLabel = (
  order: PurchaseOrder,
  products?: Array<{ id: string; name: string }>
): string => {
  const first = order.lines?.[0];
  if (!first) return "—";
  const nameFromApi = (first as { product_name?: string }).product_name;
  if (nameFromApi) return nameFromApi;
  const product = products?.find((p) => p.id === first.product_id);
  return product?.name ?? `Produit #${first.product_id.slice(0, 8)}`;
};

const getTotalQuantity = (order: PurchaseOrder): number =>
  order.lines?.reduce((sum, l) => sum + l.quantity, 0) ?? 0;

const getSupplierName = (
  order: PurchaseOrder,
  suppliers: Array<{ id: string; name: string }>
): string => {
  if (order.supplier_name) return order.supplier_name;
  const supplier = suppliers.find((s) => s.id === order.supplier_id);
  return supplier?.name ?? "—";
};

function generatePurchaseOrderReference(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(100 + Math.random() * 900);
  return `BC-${date}-${random}`;
}

const createPurchaseOrderSchema = z.object({
  reference: z.string().min(1, "La référence est obligatoire"),
  supplier_id: z.string().min(1, "Veuillez sélectionner un fournisseur"),
  lines: z
    .array(
      z.object({
        product_id: z.string().min(1, "Sélectionnez un produit"),
        quantity: z.number().int().min(1, "Quantité minimale : 1"),
        unit_price: z.number().min(0, "Prix unitaire ≥ 0"),
      })
    )
    .min(1, "Ajoutez au moins une ligne"),
});

type CreatePurchaseOrderFormValues = z.infer<typeof createPurchaseOrderSchema>;

export default function PurchaseOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [confirmSuccessId, setConfirmSuccessId] = useState<string | null>(null);

  const tenantId = useTenantId();
  const organizationId = useSelectedOrganizationId(tenantId ?? undefined);

  const { data: ordersData, isLoading, error } = usePurchaseOrders(
    tenantId ?? undefined,
    {
      organizationId: organizationId ?? undefined,
      page: 1,
      limit: 200,
    }
  );

  const confirmMutation = useConfirmPurchaseOrder(
    tenantId ?? undefined,
    organizationId ?? undefined
  );
  const goodsReceiptMutation = useGoodsReceiptPurchaseOrder(
    tenantId ?? undefined,
    organizationId ?? undefined
  );

  const { data: suppliers = [] } = useSuppliers(
    tenantId ?? undefined,
    organizationId ?? undefined
  );
  const { data: products = [] } = useProducts(
    tenantId ?? undefined,
    organizationId ?? undefined,
    { page: 1, limit: 500 }
  );
  const createMutation = useCreatePurchaseOrder(
    tenantId ?? undefined,
    organizationId ?? undefined
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePurchaseOrderFormValues>({
    resolver: zodResolver(createPurchaseOrderSchema),
    defaultValues: {
      reference: "",
      supplier_id: "",
      lines: [{ product_id: "", quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lines" });

  const supplierOptions = React.useMemo(
    () =>
      suppliers.map((s) => ({
        value: s.id,
        label: `${s.name}${s.phone ? ` – ${s.phone}` : ""}`,
      })),
    [suppliers]
  );
  const productOptions = React.useMemo(
    () =>
      products.map((p) => ({
        value: p.id,
        label: `${p.name} – ${formatPriceFCFA(p.price)}`,
      })),
    [products]
  );

  const onSubmitCreate = handleSubmit((values) => {
    createMutation.mutate(
      {
        reference: values.reference,
        supplier_id: values.supplier_id,
        lines: values.lines.map((l) => ({
          product_id: l.product_id,
          quantity: l.quantity,
          unit_price: l.unit_price,
        })),
      },
      {
        onSuccess: () => {
          setCreateSuccess(true);
          reset({
            reference: generatePurchaseOrderReference(),
            supplier_id: "",
            lines: [{ product_id: "", quantity: 1, unit_price: 0 }],
          });
          setTimeout(() => {
            setCreateSuccess(false);
            setShowCreateModal(false);
          }, 2000);
        },
      }
    );
  });

  const openCreateModal = () => {
    reset({
      reference: generatePurchaseOrderReference(),
      supplier_id: "",
      lines: [{ product_id: "", quantity: 1, unit_price: 0 }],
    });
    setCreateSuccess(false);
    setShowCreateModal(true);
  };

  const ordersList: PurchaseOrder[] = useMemo(() => {
    if (!ordersData) return [];
    return Array.isArray(ordersData)
      ? ordersData
      : (ordersData as { data?: PurchaseOrder[] }).data ?? [];
  }, [ordersData]);

  const filteredOrders = useMemo(() => {
    let list = ordersList;
    if (selectedStatus !== "all") {
      const norm = (s: string) => s?.toLowerCase?.() ?? "";
      list = list.filter((o) => norm(o.status) === selectedStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (order) =>
          getOrderDisplayId(order).toLowerCase().includes(q) ||
          getSupplierName(order, suppliers).toLowerCase().includes(q) ||
          getFirstLineLabel(order, products).toLowerCase().includes(q)
      );
    }
    return list;
  }, [ordersList, selectedStatus, searchQuery, suppliers, products]);

  const handleConfirm = (orderId: string) => {
    if (!confirm("Confirmer ce bon de commande ?")) return;
    confirmMutation.mutate(orderId, {
      onSuccess: (updated) => {
        setSelectedOrder(updated ?? null);
        if (updated) {
          setConfirmSuccessId(orderId);
          setTimeout(() => setConfirmSuccessId(null), 4000);
        }
      },
    });
  };

  const handleGoodsReceipt = (orderId: string) => {
    if (
      !confirm(
        "Enregistrer la réception marchandise ? (impact stock + mouvement + écriture expense)"
      )
    )
      return;
    goodsReceiptMutation.mutate(orderId, {
      onSuccess: (updated) => setSelectedOrder(updated),
    });
  };

  const canConfirm = (order: PurchaseOrder) =>
    (order.status === "draft" || order.status === "DRAFT") &&
    !confirmMutation.isPending;

  const canGoodsReceipt = (order: PurchaseOrder) =>
    (order.status === "confirmed" || order.status === "CONFIRMED") &&
    !goodsReceiptMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 dark:from-black dark:via-zinc-950 dark:to-black">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500 dark:border-indigo-600/20 dark:border-t-indigo-600 mx-auto" />
          <p className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
            Chargement des bons de commande...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black p-6 lg:p-8 relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full bg-gradient-to-br from-white via-white to-zinc-50/50 border-red-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-red-900/50 shadow-xl">
            <CardContent className="p-8 text-center">
              <p className="text-red-600 dark:text-red-400 font-semibold mb-4">
                Erreur lors du chargement des bons de commande
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-6">
                {error instanceof Error
                  ? error.message
                  : "Une erreur est survenue"}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white"
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400 mb-2">
              Bons de commande
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Gérez vos bons de commande fournisseurs
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white border-0 shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/10"
            onClick={openCreateModal}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau bon de commande
          </Button>
        </div>

        <div className="space-y-4">
          {confirmMutation.isError && confirmMutation.error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 dark:bg-red-500/15 p-4 text-sm text-red-800 dark:text-red-200">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <p>
                Erreur confirmation : {extractApiError(confirmMutation.error).message}
                {extractApiError(confirmMutation.error).statusCode != null &&
                  ` (${extractApiError(confirmMutation.error).statusCode})`}
              </p>
            </div>
          )}
          {/* FILTRES ET GRAPHIQUES (cartes stats) DÉSACTIVÉS */}
          {/* <div className="relative group">
            <Search ... />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_FILTERS.map(...)}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>... Bons de commande au total ...</Card>
        </div> */}
        </div>

        <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200/80 bg-gradient-to-r from-zinc-50 to-white dark:border-zinc-900/50 dark:from-zinc-950/50 dark:to-zinc-900/30">
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-700 uppercase tracking-wider dark:text-zinc-300">
                      Référence
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                      Fournisseur
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                      Produit
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                      Qté
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                      Montant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                      Mis à jour
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-900/50">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <ClipboardList className="h-12 w-12 text-zinc-400 dark:text-zinc-600 mb-4" />
                          <p className="text-zinc-600 dark:text-zinc-400 font-medium">
                            Aucun bon de commande trouvé
                          </p>
                          <Button
                            variant="outline"
                            className="mt-4 border-indigo-500/50 text-indigo-600 dark:text-indigo-400"
                            onClick={openCreateModal}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Créer un bon de commande
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const displayStatus = getDisplayStatus(order);
                      const totalQty = getTotalQuantity(order);
                      return (
                        <tr
                          key={order.id}
                          className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
                              {getOrderDisplayId(order)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300">
                            {formatDate(order.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300">
                            {getSupplierName(order, suppliers)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-zinc-700 dark:text-zinc-300">
                              {getFirstLineLabel(order, products)}
                            </div>
                            {order.lines && order.lines.length > 1 && (
                              <div className="text-xs text-zinc-500 mt-1">
                                +{order.lines.length - 1} autre(s)
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300">
                            {totalQty}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
                              {formatPrice(order.total_amount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                STATUS_COLORS[displayStatus.statusKey] ||
                                "bg-zinc-500/20 text-zinc-700 dark:text-zinc-400 border-zinc-500/30"
                              }`}
                            >
                              {displayStatus.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-500">
                            {formatDateTime(order.updated_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="min-w-[180px]">
                                <DropdownMenuItem
                                  onClick={() => setSelectedOrder(order)}
                                  className="cursor-pointer"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir
                                </DropdownMenuItem>
                                {canConfirm(order) && (
                                  <DropdownMenuItem
                                    onClick={() => handleConfirm(order.id)}
                                    disabled={confirmMutation.isPending}
                                    className="text-green-600 focus:text-green-700 dark:text-green-400 cursor-pointer"
                                  >
                                    {confirmMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                    )}
                                    Confirmer
                                  </DropdownMenuItem>
                                )}
                                {canGoodsReceipt(order) && (
                                  <DropdownMenuItem
                                    onClick={() => handleGoodsReceipt(order.id)}
                                    disabled={goodsReceiptMutation.isPending}
                                    className="text-blue-600 focus:text-blue-700 dark:text-blue-400 cursor-pointer"
                                  >
                                    {goodsReceiptMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Truck className="h-4 w-4 mr-2" />
                                    )}
                                    Réception marchandise
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
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

        {/* Modal détail */}
        {selectedOrder &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setSelectedOrder(null)}
            >
              <Card
                className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-600/20">
                        <ClipboardList className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          {getOrderDisplayId(selectedOrder)}
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {getSupplierName(selectedOrder, suppliers)} •{" "}
                          {getDisplayStatus(selectedOrder).label}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedOrder(null)}
                      className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  {confirmSuccessId === selectedOrder.id && (
                    <div className="mx-6 mt-4 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15 p-4 text-sm text-emerald-800 dark:text-emerald-200">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold">Bon de commande confirmé (201)</span>
                    </div>
                  )}
                  {confirmMutation.isError && confirmMutation.error && (
                    <div className="mx-6 mt-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 dark:bg-red-500/15 p-4 text-sm text-red-800 dark:text-red-200">
                      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Erreur lors de la confirmation</p>
                        <p className="mt-1 text-red-700 dark:text-red-300">
                          {extractApiError(confirmMutation.error).message}
                          {extractApiError(confirmMutation.error).statusCode != null &&
                            ` (${extractApiError(confirmMutation.error).statusCode})`}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                        Toutes les informations
                      </h3>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                        <div>
                          <dt className="text-zinc-500 dark:text-zinc-400">ID</dt>
                          <dd className="font-mono text-zinc-900 dark:text-zinc-100 break-all">
                            {selectedOrder.id}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-zinc-500 dark:text-zinc-400">Référence</dt>
                          <dd className="font-medium">{selectedOrder.reference ?? "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-zinc-500 dark:text-zinc-400">Tenant ID</dt>
                          <dd className="font-mono text-zinc-700 dark:text-zinc-300 break-all">
                            {selectedOrder.tenant_id ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-zinc-500 dark:text-zinc-400">Fournisseur (nom)</dt>
                          <dd className="font-medium">
                            {selectedOrder.supplier_name ?? getSupplierName(selectedOrder, suppliers)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-zinc-500 dark:text-zinc-400">Statut</dt>
                          <dd>
                            <Badge
                              className={`px-2 py-0.5 text-xs ${
                                STATUS_COLORS[selectedOrder.status] ||
                                "bg-zinc-500/20 text-zinc-700 dark:text-zinc-400"
                              }`}
                            >
                              {getDisplayStatus(selectedOrder).label}
                            </Badge>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-zinc-500 dark:text-zinc-400">Montant total</dt>
                          <dd className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {formatPrice(selectedOrder.total_amount)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-zinc-500 dark:text-zinc-400">Créé le</dt>
                          <dd className="text-zinc-700 dark:text-zinc-300">
                            {formatDateTime(selectedOrder.created_at)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-zinc-500 dark:text-zinc-400">Mis à jour le</dt>
                          <dd className="text-zinc-700 dark:text-zinc-300">
                            {formatDateTime(selectedOrder.updated_at)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    {selectedOrder.lines && selectedOrder.lines.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                          Lignes (détail complet)
                        </h3>
                        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                                <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 uppercase">ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 uppercase">Product ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 uppercase">Produit</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-zinc-500 uppercase">Qté</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-zinc-500 uppercase">Prix unit.</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-zinc-500 uppercase">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                              {selectedOrder.lines.map((line, i) => {
                                const lineTotal = (line as { total?: number }).total ?? line.quantity * line.unit_price;
                                const productName = (line as { product_name?: string }).product_name ||
                                  products.find((p) => p.id === line.product_id)?.name ||
                                  `#${line.product_id.slice(0, 8)}`;
                                return (
                                  <tr key={line.id ?? i} className="text-zinc-700 dark:text-zinc-300">
                                    <td className="px-3 py-2 font-mono text-xs text-zinc-500" title={line.id}>
                                      {line.id ? truncateId(line.id, 8) : "—"}
                                    </td>
                                    <td className="px-3 py-2 font-mono text-xs text-zinc-500 break-all">
                                      {line.product_id}
                                    </td>
                                    <td className="px-3 py-2 font-medium">{productName}</td>
                                    <td className="px-3 py-2 text-right">{line.quantity}</td>
                                    <td className="px-3 py-2 text-right text-zinc-500">{formatPrice(line.unit_price)}</td>
                                    <td className="px-3 py-2 text-right font-medium">
                                      {formatPrice(lineTotal)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      {canConfirm(selectedOrder) && (
                        <Button
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                          onClick={() => handleConfirm(selectedOrder.id)}
                          disabled={confirmMutation.isPending}
                        >
                          {confirmMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                          )}
                          Confirmer le bon
                        </Button>
                      )}
                      {canGoodsReceipt(selectedOrder) && (
                        <Button
                          variant="outline"
                          className="flex-1 border-blue-500/50 text-blue-600 dark:text-blue-400"
                          onClick={() => handleGoodsReceipt(selectedOrder.id)}
                          disabled={goodsReceiptMutation.isPending}
                        >
                          {goodsReceiptMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Truck className="h-4 w-4 mr-2" />
                          )}
                          Réception marchandise
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => setSelectedOrder(null)}
                        className="border-zinc-200 dark:border-zinc-800"
                      >
                        Fermer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>,
            document.body
          )}

        {/* Modal création */}
        {showCreateModal &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setShowCreateModal(false)}
            >
              <Card
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-600/20">
                        <ClipboardList className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          Nouveau bon de commande (brouillon)
                        </h2>
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
                        Bon de commande créé avec succès (brouillon)
                      </span>
                    </div>
                  )}

                  {createMutation.error && !createSuccess && (
                    <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
                      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                      <span>
                        {(createMutation.error as { message?: string })?.message ??
                          "Erreur lors de la création."}
                      </span>
                    </div>
                  )}

                  <form onSubmit={onSubmitCreate} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="po-reference"
                          className="flex items-center gap-2 text-sm font-medium"
                        >
                          <Hash className="h-3.5 w-3.5 text-zinc-400" />
                          Référence <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="po-reference"
                          placeholder="Auto-généré (modifiable)"
                          {...register("reference")}
                          className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-mono"
                        />
                        {errors.reference && (
                          <p className="text-xs text-red-500">
                            {errors.reference.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="po-supplier"
                          className="flex items-center gap-2 text-sm font-medium"
                        >
                          Fournisseur <span className="text-red-500">*</span>
                        </Label>
                        <SearchableSelect
                          id="po-supplier"
                          options={supplierOptions}
                          value={watch("supplier_id") ?? ""}
                          onChange={(v) => setValue("supplier_id", v)}
                          placeholder="Sélectionner un fournisseur"
                          searchPlaceholder="Rechercher un fournisseur…"
                          emptyMessage="Aucun fournisseur trouvé"
                          getOptionLabel={(opt) =>
                            opt.label.includes(" – ") ? opt.label.split(" – ")[0] : opt.label
                          }
                        />
                        {errors.supplier_id && (
                          <p className="text-xs text-red-500">
                            {errors.supplier_id.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Package className="h-3.5 w-3.5 text-zinc-400" />
                          Lignes <span className="text-red-500">*</span>
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            append({
                              product_id: "",
                              quantity: 1,
                              unit_price: 0,
                            })
                          }
                          className="border-zinc-200 dark:border-zinc-800"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Ajouter une ligne
                        </Button>
                      </div>
                      {errors.lines?.message && (
                        <p className="text-xs text-red-500 mb-2">
                          {errors.lines.message}
                        </p>
                      )}
                      <div className="space-y-3">
                        {fields.map((field, index) => (
                          <div
                            key={field.id}
                            className="flex flex-wrap items-end gap-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50"
                          >
                            <div className="flex-1 min-w-[140px] space-y-1">
                              <span className="text-xs font-medium text-zinc-500">
                                Produit
                              </span>
                              <SearchableSelect
                                options={productOptions}
                                value={watch(`lines.${index}.product_id`) ?? ""}
                                onChange={(v) => {
                                  setValue(`lines.${index}.product_id`, v);
                                  const product = products.find((p) => p.id === v);
                                  if (product)
                                    setValue(`lines.${index}.unit_price`, product.price);
                                }}
                                placeholder="Choisir un produit"
                                searchPlaceholder="Rechercher un produit…"
                                emptyMessage="Aucun produit trouvé"
                                className="[&_button]:h-9"
                              />
                              {errors.lines?.[index]?.product_id && (
                                <p className="text-xs text-red-500">
                                  {
                                    errors.lines[index]?.product_id?.message
                                  }
                                </p>
                              )}
                            </div>
                            <div className="w-20 space-y-1">
                              <span className="text-xs font-medium text-zinc-500">
                                Qté
                              </span>
                              <Input
                                type="number"
                                min={1}
                                {...register(`lines.${index}.quantity`, {
                                  valueAsNumber: true,
                                })}
                                className="h-9"
                              />
                              {errors.lines?.[index]?.quantity && (
                                <p className="text-xs text-red-500">
                                  {
                                    errors.lines[index]?.quantity?.message
                                  }
                                </p>
                              )}
                            </div>
                            <div className="w-28 space-y-1">
                              <span className="text-xs font-medium text-zinc-500">
                                Prix unit.
                              </span>
                              <Input
                                type="number"
                                min={0}
                                step={1}
                                {...register(`lines.${index}.unit_price`, {
                                  valueAsNumber: true,
                                })}
                                className="h-9 bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed opacity-80"
                                readOnly
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                              onClick={() => remove(index)}
                              disabled={fields.length <= 1}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      {fields.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                          <div className="text-sm">
                            <span className="text-zinc-500 dark:text-zinc-400 mr-2">Total :</span>
                            <span className="font-semibold text-base bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
                              {formatPrice(
                                (watch("lines") || []).reduce(
                                  (sum: number, line: { quantity?: number; unit_price?: number }) =>
                                    sum + (Number(line?.quantity) || 0) * (Number(line?.unit_price) || 0),
                                  0
                                )
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 border-zinc-200 dark:border-zinc-800"
                        disabled={createMutation.isPending}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20 font-semibold"
                        disabled={createMutation.isPending || createSuccess}
                      >
                        {createMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Création...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Créer le bon (brouillon)
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
    </div>
  );
}
