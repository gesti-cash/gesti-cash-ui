"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { useMockCODOrders, useMockDeleteCODOrder } from "@/shared/mock";
import {
  ShoppingCart,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import type { MockCODOrder } from "@/shared/mock/generators";

// Mapping des statuts vers le français
const STATUS_TRANSLATIONS: Record<string, string> = {
  pending: "Nouveau",
  confirmed: "Confirmé",
  shipped: "En livraison",
  in_transit: "En livraison",
  delivered: "Livré",
  returned: "Retourné",
  cancelled: "Annulé",
};

// Mapping pour le statut "Encaissé" (qui semble être un statut spécial)
// On peut utiliser "delivered" avec un flag supplémentaire ou créer un nouveau statut
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
  confirmed: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
  shipped: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  in_transit: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  delivered: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
  returned: "bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30",
  cancelled: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30",
  paid: "bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30", // Encaissé
};

// Filtres de statut disponibles
const STATUS_FILTERS = [
  { value: "all", label: "Tous" },
  { value: "pending", label: "Nouveau" },
  { value: "confirmed", label: "Confirmé" },
  { value: "shipped", label: "En livraison" },
  { value: "delivered", label: "Livré" },
  { value: "paid", label: "Encaissé" },
  { value: "cancelled", label: "Annulé" },
];

// Formater le prix
const formatPrice = (price: number): string => {
  return `${price.toLocaleString("fr-FR")} FCFA`;
};

// Formater la date
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

// Obtenir le statut affiché (gérer le cas "Encaissé")
const getDisplayStatus = (order: MockCODOrder): { label: string; statusKey: string } => {
  // Si la commande est livrée et le montant est encaissé, on peut considérer comme "Encaissé"
  // Pour l'instant, on utilise un simple mapping
  if (order.status === "delivered" && Math.random() > 0.5) {
    // Simuler que certaines commandes livrées sont encaissées
    return { label: "Encaissé", statusKey: "paid" };
  }
  return {
    label: STATUS_TRANSLATIONS[order.status] || order.status,
    statusKey: order.status,
  };
};

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { data, isLoading, error } = useMockCODOrders({
    page: 1,
    limit: 100,
  });
  const deleteOrderMutation = useMockDeleteCODOrder();

  // Filtrer les commandes
  const filteredOrders = useMemo(() => {
    if (!data?.data) return [];

    let orders = data.data;

    // Filtre par statut
    if (selectedStatus !== "all") {
      if (selectedStatus === "paid") {
        // Pour "Encaissé", on filtre les commandes livrées
        orders = orders.filter((order) => order.status === "delivered");
      } else {
        orders = orders.filter((order) => order.status === selectedStatus);
      }
    }

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      orders = orders.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query) ||
          order.customerName.toLowerCase().includes(query) ||
          order.customerPhone.includes(query) ||
          order.products.some((p) => p.productName.toLowerCase().includes(query))
      );
    }

    return orders;
  }, [data?.data, selectedStatus, searchQuery]);

  const handleDelete = async (orderId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-green-500/20 border-t-green-500 dark:border-green-600/20 dark:border-t-green-600"></div>
          <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-2 border-green-500/30 dark:border-green-600/30"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md w-full bg-gradient-to-br from-white via-white to-zinc-50/50 border-red-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-red-900/50 shadow-xl">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 font-semibold">
                Erreur lors du chargement des commandes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400 mb-2">
              Commandes
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Gérez toutes vos commandes
            </p>
          </div>
          <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg shadow-green-500/20 dark:shadow-green-500/10">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Commande
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 dark:text-zinc-600 group-focus-within:text-green-500 dark:group-focus-within:text-green-400 transition-colors" />
              <Input
                type="text"
                placeholder="Rechercher une commande..."
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

          {/* Status Filters */}
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
                      ID
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
                      const firstProduct = order.products[0];
                      const totalQuantity = order.products.reduce(
                        (sum, p) => sum + p.quantity,
                        0
                      );

                      return (
                        <tr
                          key={order.id}
                          className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">
                              {order.orderNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-700 dark:text-zinc-300">
                              {formatDate(order.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-700 dark:text-zinc-300">
                              {order.customerName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-700 dark:text-zinc-300">
                              {order.customerPhone}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-zinc-700 dark:text-zinc-300">
                              {firstProduct?.productName || "-"}
                            </div>
                            {order.products.length > 1 && (
                              <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                                +{order.products.length - 1} autre(s)
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-700 dark:text-zinc-300">
                              {totalQuantity}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">
                              {formatPrice(order.totalAmount)}
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
                            <div className="flex items-center gap-2">
                              <button
                                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                title="Modifier"
                              >
                                <Edit className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                              </button>
                              <button
                                onClick={() => handleDelete(order.id)}
                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                title="Supprimer"
                                disabled={deleteOrderMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </button>
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
      </div>
    </div>
  );
}
