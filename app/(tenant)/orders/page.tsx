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
import { useTenantId, useSelectedOrganizationId } from "@/shared/tenant/store";
import {
  useOrders,
  useCreateOrder,
  useDeleteOrder,
  useConfirmOrder,
  useCancelOrder,
  type Order,
} from "@/shared/orders/hooks";
import { useCustomers } from "@/shared/customers/hooks";
import { useProducts } from "@/shared/products/hooks";
import {
  ShoppingCart,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  AlertTriangle,
  Hash,
  User,
  Package,
} from "lucide-react";

// Mapping des statuts vers le français
const STATUS_TRANSLATIONS: Record<string, string> = {
  draft: "Brouillon",
  pending: "Nouveau",
  confirmed: "Confirmé",
  shipped: "En livraison",
  in_transit: "En livraison",
  delivered: "Livré",
  returned: "Retourné",
  cancelled: "Annulé",
  assigned: "Assignée",
  failed: "Échouée",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-zinc-500/20 text-zinc-700 dark:text-zinc-400 border-zinc-500/30",
  pending: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
  confirmed:
    "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
  shipped:
    "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  in_transit:
    "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  delivered:
    "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
  returned:
    "bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30",
  cancelled:
    "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30",
  assigned:
    "bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
  failed: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30",
};

const STATUS_FILTERS = [
  { value: "all", label: "Tous" },
  { value: "draft", label: "Brouillon" },
  { value: "pending", label: "Nouveau" },
  { value: "confirmed", label: "Confirmé" },
  { value: "shipped", label: "En livraison" },
  { value: "delivered", label: "Livré" },
  { value: "cancelled", label: "Annulé" },
];

const formatPrice = (price: number | string): string => {
  return `${Number(price).toLocaleString("fr-FR")} FCFA`;
};

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

const getDisplayStatus = (
  order: Order
): { label: string; statusKey: string } => ({
  label: STATUS_TRANSLATIONS[order.status] || order.status,
  statusKey: order.status,
});

/** Numéro ou identifiant affiché pour la commande (API renvoie `reference`, ex. CMD-273) */
const getOrderDisplayId = (order: Order): string =>
  order.reference || order.order_number || order.id;

/** Première ligne (produit) pour affichage liste - résout le nom via la liste des produits si fournie */
const getFirstLineLabel = (
  order: Order,
  products?: Array<{ id: string; name: string }>
): string => {
  const first = order.lines?.[0];
  if (!first) return "—";
  const nameFromApi = (first as { product_name?: string }).product_name;
  if (nameFromApi) return nameFromApi;
  const product = products?.find((p) => p.id === first.product_id);
  return product?.name ?? `Produit #${first.product_id.slice(0, 8)}`;
};

/** Quantité totale des lignes */
const getTotalQuantity = (order: Order): number =>
  order.lines?.reduce((sum, l) => sum + l.quantity, 0) ?? 0;

/** Nom du client à afficher (résolu depuis la liste des clients si l’API ne renvoie pas customer_name) */
const getOrderCustomerName = (
  order: Order,
  customers: Array<{ id: string; name: string }>
): string => {
  if (order.customer_name) return order.customer_name;
  const customer = customers.find((c) => c.id === order.customer_id);
  return customer?.name ?? "—";
};

/** Téléphone du client à afficher (résolu depuis la liste des clients si l’API ne renvoie pas customer_phone) */
const getOrderCustomerPhone = (
  order: Order,
  customers: Array<{ id: string; phone: string }>
): string => {
  if (order.customer_phone) return order.customer_phone;
  const customer = customers.find((c) => c.id === order.customer_id);
  return customer?.phone ?? "—";
};

/** Génère une référence de commande unique (ex. CMD-20240309-427) */
function generateOrderReference(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(100 + Math.random() * 900);
  return `CMD-${date}-${random}`;
}
const createOrderSchema = z.object({
  reference: z.string().min(1, "La référence est obligatoire"),
  customer_id: z.string().min(1, "Veuillez sélectionner un client"),
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

type CreateOrderFormValues = z.infer<typeof createOrderSchema>;

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  const tenantId = useTenantId();
  const organizationId = useSelectedOrganizationId(tenantId ?? undefined);

  const { data: ordersData, isLoading, error } = useOrders(
    tenantId ?? undefined,
    {
      organizationId: organizationId ?? undefined,
      page: 1,
      limit: 200,
    }
  );

  const deleteOrderMutation = useDeleteOrder(tenantId ?? undefined, organizationId ?? undefined);
  const confirmOrderMutation = useConfirmOrder(tenantId ?? undefined, organizationId ?? undefined);
  const cancelOrderMutation = useCancelOrder(tenantId ?? undefined, organizationId ?? undefined);

  const { data: customers = [] } = useCustomers(tenantId ?? undefined, organizationId ?? undefined);
  const { data: products = [] } = useProducts(
    tenantId ?? undefined,
    organizationId ?? undefined,
    { page: 1, limit: 500 }
  );
  const createOrderMutation = useCreateOrder(tenantId ?? undefined, organizationId ?? undefined);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      reference: "",
      customer_id: "",
      lines: [{ product_id: "", quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lines" });

  const onSubmitCreateOrder = handleSubmit((values) => {
    createOrderMutation.mutate(
      {
        reference: values.reference,
        customer_id: values.customer_id,
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
            reference: generateOrderReference(),
            customer_id: "",
            lines: [{ product_id: "", quantity: 1, unit_price: 0 }],
          });
          setTimeout(() => {
            setCreateSuccess(false);
            setShowCreateOrderModal(false);
          }, 2000);
        },
      }
    );
  });

  const openCreateOrderModal = () => {
    reset({
      reference: generateOrderReference(),
      customer_id: "",
      lines: [{ product_id: "", quantity: 1, unit_price: 0 }],
    });
    setCreateSuccess(false);
    setShowCreateOrderModal(true);
  };

  // API peut retourner Order[] ou { data: Order[] }
  const ordersList: Order[] = useMemo(() => {
    if (!ordersData) return [];
    return Array.isArray(ordersData) ? ordersData : (ordersData as { data?: Order[] }).data ?? [];
  }, [ordersData]);

  const filteredOrders = useMemo(() => {
    let orders = ordersList;

    if (selectedStatus !== "all") {
      orders = orders.filter((o) => o.status === selectedStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      orders = orders.filter(
        (order) =>
          getOrderDisplayId(order).toLowerCase().includes(q) ||
          getOrderCustomerName(order, customers).toLowerCase().includes(q) ||
          getOrderCustomerPhone(order, customers).toLowerCase().includes(q) ||
          getFirstLineLabel(order, products).toLowerCase().includes(q)
      );
    }

    return orders;
  }, [ordersList, selectedStatus, searchQuery, customers, products]);

  const handleDelete = (orderId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette commande ? (suppression douce)")) return;
    deleteOrderMutation.mutate(orderId, {
      onSuccess: () => setSelectedOrder(null),
    });
  };

  const handleConfirm = (orderId: string) => {
    confirmOrderMutation.mutate(orderId, {
      onSuccess: (updated) => setSelectedOrder(updated),
    });
  };

  const handleCancel = (orderId: string) => {
    if (!confirm("Annuler cette commande ?")) return;
    cancelOrderMutation.mutate(orderId, {
      onSuccess: (updated) => setSelectedOrder(updated),
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 dark:from-black dark:via-zinc-950 dark:to-black">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-green-500/20 border-t-green-500 dark:border-green-600/20 dark:border-t-green-600 mx-auto" />
          </div>
          <p className="text-lg font-semibold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Chargement des commandes...
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
                Erreur lors du chargement des commandes
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-6">
                {error instanceof Error ? error.message : "Une erreur est survenue"}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400 mb-2">
              Commandes
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Gérez vos commandes et livraisons
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg shadow-green-500/20 dark:shadow-green-500/10"
            onClick={() => openCreateOrderModal()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Commande
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 dark:text-zinc-600 group-focus-within:text-green-500 dark:group-focus-within:text-green-400 transition-colors" />
              <Input
                type="text"
                placeholder="Rechercher par n° commande, client, téléphone, produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 h-14 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-zinc-200/80 dark:border-zinc-800/80 focus:border-green-500 dark:focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:focus:ring-green-500/10 text-base shadow-lg shadow-zinc-200/50 dark:shadow-zinc-900/50 transition-all duration-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_FILTERS.map((filter) => (
              <Button
                key={filter.value}
                onClick={() => setSelectedStatus(filter.value)}
                variant="ghost"
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  selectedStatus === filter.value
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg shadow-green-500/20 dark:shadow-green-500/10"
                    : "bg-white/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-green-500/50 dark:hover:border-green-500/30"
                }`}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200/80 bg-gradient-to-r from-zinc-50 to-white dark:border-zinc-900/50 dark:from-zinc-950/50 dark:to-zinc-900/30">
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-700 uppercase tracking-wider dark:text-zinc-300">
                      N° commande
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                      Téléphone
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-900/50">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <ShoppingCart className="h-12 w-12 text-zinc-400 dark:text-zinc-600 mb-4" />
                          <p className="text-zinc-600 dark:text-zinc-400 font-medium">
                            Aucune commande trouvée
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const displayStatus = getDisplayStatus(order);
                      const totalQty = getTotalQuantity(order);
                      const canConfirm =
                        (order.status === "draft" || order.status === "pending") &&
                        !confirmOrderMutation.isPending;
                      const canCancel =
                        order.status !== "cancelled" && !cancelOrderMutation.isPending;

                      return (
                        <tr
                          key={order.id}
                          className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">
                              {getOrderDisplayId(order)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-700 dark:text-zinc-300">
                              {formatDate(order.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-700 dark:text-zinc-300">
                              {getOrderCustomerName(order, customers)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-700 dark:text-zinc-300">
                              {getOrderCustomerPhone(order, customers)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-zinc-700 dark:text-zinc-300">
                              {getFirstLineLabel(order, products)}
                            </div>
                            {order.lines && order.lines.length > 1 && (
                              <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                                +{order.lines.length - 1} autre(s)
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-700 dark:text-zinc-300">
                              {totalQty}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Voir"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                              </Button>
                              {canConfirm && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600 hover:text-green-700 dark:text-green-400"
                                  title="Confirmer"
                                  onClick={() => handleConfirm(order.id)}
                                  disabled={confirmOrderMutation.isPending}
                                >
                                  {confirmOrderMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                              {canCancel && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-orange-600 hover:text-orange-700 dark:text-orange-400"
                                  title="Annuler"
                                  onClick={() => handleCancel(order.id)}
                                  disabled={cancelOrderMutation.isPending}
                                >
                                  {cancelOrderMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Modifier"
                                onClick={() => {}}
                              >
                                <Edit className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 dark:text-red-400"
                                title="Supprimer (soft)"
                                onClick={() => handleDelete(order.id)}
                                disabled={deleteOrderMutation.isPending}
                              >
                                {deleteOrderMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
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

        {/* Modal Nouvelle commande */}
        {showCreateOrderModal &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setShowCreateOrderModal(false)}
            >
              <Card
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-600/20">
                        <ShoppingCart className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          Nouvelle commande
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Référence, client et lignes (API POST /api/v1/orders)
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowCreateOrderModal(false)}
                      className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {createSuccess && (
                    <div className="mx-6 mt-5 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15 p-4 text-sm text-emerald-800 dark:text-emerald-200">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold">Commande créée avec succès (201)</span>
                    </div>
                  )}

                  {createOrderMutation.error && !createSuccess && (
                    <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
                      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                      <span>
                        {(createOrderMutation.error as { message?: string })?.message ??
                          "Erreur lors de la création de la commande."}
                      </span>
                    </div>
                  )}

                  <form onSubmit={onSubmitCreateOrder} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="create-order-reference" className="flex items-center gap-2 text-sm font-medium">
                          <Hash className="h-3.5 w-3.5 text-zinc-400" />
                          Référence <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="create-order-reference"
                          placeholder="Auto-généré (modifiable)"
                          {...register("reference")}
                          className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-mono"
                        />
                        {errors.reference && (
                          <p className="text-xs text-red-500">{errors.reference.message}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="create-order-customer" className="flex items-center gap-2 text-sm font-medium">
                          <User className="h-3.5 w-3.5 text-zinc-400" />
                          Client <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="create-order-customer"
                          {...register("customer_id")}
                          className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/30"
                        >
                          <option value="">Sélectionner un client</option>
                          {customers.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} {c.phone ? `– ${c.phone}` : ""}
                            </option>
                          ))}
                        </select>
                        {errors.customer_id && (
                          <p className="text-xs text-red-500">{errors.customer_id.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Package className="h-3.5 w-3.5 text-zinc-400" />
                          Lignes de commande <span className="text-red-500">*</span>
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => append({ product_id: "", quantity: 1, unit_price: 0 })}
                          className="border-zinc-200 dark:border-zinc-800"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Ajouter une ligne
                        </Button>
                      </div>
                      {errors.lines?.message && (
                        <p className="text-xs text-red-500 mb-2">{errors.lines.message}</p>
                      )}
                      <div className="space-y-3">
                        {fields.map((field, index) => (
                          <div
                            key={field.id}
                            className="flex flex-wrap items-end gap-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50"
                          >
                            <div className="flex-1 min-w-[140px] space-y-1">
                              <span className="text-xs font-medium text-zinc-500">Produit</span>
                              <select
                                {...register(`lines.${index}.product_id`, {
                                  onChange: (e) => {
                                    const product = products.find((p) => p.id === e.target.value);
                                    if (product) setValue(`lines.${index}.unit_price`, product.price);
                                  },
                                })}
                                className="flex h-9 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 text-sm"
                              >
                                <option value="">Choisir</option>
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} – {p.price.toLocaleString("fr-FR")} FCFA
                                  </option>
                                ))}
                              </select>
                              {errors.lines?.[index]?.product_id && (
                                <p className="text-xs text-red-500">{errors.lines[index]?.product_id?.message}</p>
                              )}
                            </div>
                            <div className="w-20 space-y-1">
                              <span className="text-xs font-medium text-zinc-500">Qté</span>
                              <Input
                                type="number"
                                min={1}
                                {...register(`lines.${index}.quantity`, { valueAsNumber: true })}
                                className="h-9"
                              />
                              {errors.lines?.[index]?.quantity && (
                                <p className="text-xs text-red-500">{errors.lines[index]?.quantity?.message}</p>
                              )}
                            </div>
                            <div className="w-28 space-y-1">
                              <span className="text-xs font-medium text-zinc-500">Prix unit.</span>
                              <Input
                                type="number"
                                min={0}
                                step={1}
                                {...register(`lines.${index}.unit_price`, { valueAsNumber: true })}
                                className="h-9"
                              />
                              {errors.lines?.[index]?.unit_price && (
                                <p className="text-xs text-red-500">{errors.lines[index]?.unit_price?.message}</p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                              onClick={() => remove(index)}
                              disabled={fields.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateOrderModal(false)}
                        className="flex-1 border-zinc-200 dark:border-zinc-800"
                        disabled={createOrderMutation.isPending}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20 font-semibold"
                        disabled={createOrderMutation.isPending || createSuccess}
                      >
                        {createOrderMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Création...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Créer la commande
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
