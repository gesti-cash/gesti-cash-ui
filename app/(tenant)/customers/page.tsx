"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { useMockCustomers, useMockCODOrders } from "@/shared/mock";
import {
  Users,
  TrendingUp,
  UserPlus,
  AlertCircle,
  Search,
  X,
} from "lucide-react";
import type { MockCustomer, MockCODOrder } from "@/shared/mock/generators";

// Calculer les métriques d'un client à partir de ses commandes
interface CustomerMetrics {
  confirmationRate: number;
  deliveryRate: number;
  country: string;
  status: "Fidèle" | "Nouveau" | "À Risque";
}

function calculateCustomerMetrics(
  customer: MockCustomer,
  orders: MockCODOrder[]
): CustomerMetrics {
  // Filtrer les commandes du client (par téléphone ou nom)
  const customerOrders = orders.filter(
    (order) =>
      order.customerPhone === customer.phone ||
      order.customerName.toLowerCase() === customer.name.toLowerCase()
  );

  // Calculer le taux de confirmation (commandes confirmées / total)
  const confirmedOrders = customerOrders.filter(
    (o) => o.status === "confirmed" || o.status === "shipped" || o.status === "delivered"
  ).length;
  const confirmationRate =
    customerOrders.length > 0
      ? (confirmedOrders / customerOrders.length) * 100
      : 0;

  // Calculer le taux de livraison (commandes livrées / total)
  const deliveredOrders = customerOrders.filter(
    (o) => o.status === "delivered"
  ).length;
  const deliveryRate =
    customerOrders.length > 0
      ? (deliveredOrders / customerOrders.length) * 100
      : 0;

  // Déterminer le pays (utiliser la ville ou défaut)
  const country = customer.city || "Côte d'Ivoire";

  // Déterminer le statut
  let status: "Fidèle" | "Nouveau" | "À Risque";
  if (customer.totalOrders >= 3) {
    status = "Fidèle";
  } else if (customer.totalOrders === 1) {
    status = "Nouveau";
  } else {
    // Si confirmation rate < 50% ou delivery rate < 50%, considérer à risque
    if (confirmationRate < 50 || deliveryRate < 50) {
      status = "À Risque";
    } else {
      status = "Nouveau";
    }
  }

  return {
    confirmationRate,
    deliveryRate,
    country,
    status,
  };
}

// Formater le prix
const formatPrice = (price: number): string => {
  return `${price.toLocaleString("fr-FR")} FCFA`;
};

// Formater le téléphone (enlever le préfixe pays si présent)
const formatPhone = (phone: string): string => {
  // Enlever les espaces et le préfixe +221 ou similaire
  return phone.replace(/^\+221\s*/, "").replace(/\s+/g, "");
};

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: customersData, isLoading: customersLoading } = useMockCustomers({
    page: 1,
    limit: 100,
  });
  const { data: ordersData } = useMockCODOrders({
    page: 1,
    limit: 1000,
  });

  // Calculer les statistiques globales
  const stats = useMemo(() => {
    if (!customersData?.data || !ordersData?.data) {
      return {
        total: 0,
        loyal: 0,
        new: 0,
        atRisk: 0,
      };
    }

    const customers = customersData.data;
    const orders = ordersData.data;

    let loyal = 0;
    let newCustomers = 0;
    let atRisk = 0;

    customers.forEach((customer) => {
      const metrics = calculateCustomerMetrics(customer, orders);
      if (metrics.status === "Fidèle") loyal++;
      else if (metrics.status === "Nouveau") newCustomers++;
      else if (metrics.status === "À Risque") atRisk++;
    });

    return {
      total: customers.length,
      loyal,
      new: newCustomers,
      atRisk,
    };
  }, [customersData?.data, ordersData?.data]);

  // Filtrer les clients
  const filteredCustomers = useMemo(() => {
    if (!customersData?.data || !ordersData?.data) return [];

    const customers = customersData.data;
    const orders = ordersData.data;

    let filtered = customers;

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(query) ||
          customer.phone.includes(query) ||
          customer.email?.toLowerCase().includes(query) ||
          customer.city?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [customersData?.data, ordersData?.data, searchQuery]);

  if (customersLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-green-500/20 border-t-green-500 dark:border-green-600/20 dark:border-t-green-600"></div>
          <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-2 border-green-500/30 dark:border-green-600/30"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400 mb-2">
            Clients (CRM COD)
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Gérez votre base de clients
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Clients */}
          <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Total Clients
                  </p>
                  <p className="text-3xl font-bold text-white dark:text-white">
                    {stats.total}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-600/20 dark:from-green-500/10 dark:to-emerald-600/10">
                  <Users className="h-6 w-6 text-green-500 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clients Fidèles */}
          <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Clients Fidèles
                  </p>
                  <p className="text-3xl font-bold text-green-500 dark:text-green-400">
                    {stats.loyal}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-600/20 dark:from-green-500/10 dark:to-emerald-600/10">
                  <TrendingUp className="h-6 w-6 text-green-500 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nouveaux Clients */}
          <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Nouveaux Clients
                  </p>
                  <p className="text-3xl font-bold text-blue-500 dark:text-blue-400">
                    {stats.new}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 dark:from-blue-500/10 dark:to-blue-600/10">
                  <UserPlus className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* À Risque */}
          <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    À Risque
                  </p>
                  <p className="text-3xl font-bold text-red-500 dark:text-red-400">
                    {stats.atRisk}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/20 dark:from-red-500/10 dark:to-red-600/10">
                  <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 dark:text-zinc-600 group-focus-within:text-green-500 dark:group-focus-within:text-green-400 transition-colors" />
            <Input
              type="text"
              placeholder="Rechercher un client..."
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

        {/* Clients Table */}
        <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200/80 bg-gradient-to-r from-zinc-50 to-white dark:border-zinc-900/50 dark:from-zinc-950/50 dark:to-zinc-900/30">
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-700 uppercase tracking-wider dark:text-zinc-300">
                      Nom
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                      Téléphone
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                      Pays
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                      Commandes
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                      Total Dépensé
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                      Taux Confirmation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                      Taux Livraison
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-900/50">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Users className="h-12 w-12 text-zinc-400 dark:text-zinc-600 mb-4" />
                          <p className="text-zinc-600 dark:text-zinc-400 font-medium">
                            Aucun client trouvé
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => {
                      const metrics = calculateCustomerMetrics(
                        customer,
                        ordersData?.data || []
                      );

                      return (
                        <tr
                          key={customer.id}
                          className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                              {customer.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-700 dark:text-zinc-300">
                              {formatPhone(customer.phone)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-700 dark:text-zinc-300">
                              {metrics.country}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-700 dark:text-zinc-300">
                              {customer.totalOrders}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">
                              {formatPrice(customer.totalSpent)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-700 dark:text-zinc-300">
                              {metrics.confirmationRate.toFixed(1)}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-700 dark:text-zinc-300">
                              {metrics.deliveryRate.toFixed(1)}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                metrics.status === "Fidèle"
                                  ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30"
                                  : metrics.status === "Nouveau"
                                  ? "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30"
                                  : "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"
                              }`}
                            >
                              {metrics.status}
                            </Badge>
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
