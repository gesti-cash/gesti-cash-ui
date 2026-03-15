/**
 * Exemples d'utilisation du système de mock data
 * 
 * Ce fichier montre comment utiliser les hooks mock dans vos composants
 */

"use client";

import { useState } from "react";
import {
  useMockTransactions,
  useMockCreateTransaction,
  useMockUpdateTransaction,
  useMockDeleteTransaction,
  useMockProducts,
  useMockCODOrders,
  useMockDashboardStats,
  useMockCustomers,
} from "./index";
import { formatPriceFCFA } from "@/shared/utils";

// ============================================
// Exemple 1 : Liste de transactions
// ============================================

export function TransactionsExample() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: undefined as "income" | "expense" | undefined,
    category: undefined as string | undefined,
  });

  // Récupérer les transactions
  const { data, isLoading, error } = useMockTransactions({
    ...filters,
    page,
    limit: 10,
  });

  // Hook pour créer une transaction
  const createMutation = useMockCreateTransaction();
  const updateMutation = useMockUpdateTransaction();
  const deleteMutation = useMockDeleteTransaction();

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        amount: 50000,
        description: "Nouvelle vente",
        type: "income",
        category: "Électronique",
      });
      alert("Transaction créée !");
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: { amount: 75000 },
      });
      alert("Transaction mise à jour !");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr ?")) return;
    
    try {
      await deleteMutation.mutateAsync(id);
      alert("Transaction supprimée !");
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="p-4">Chargement des transactions...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Erreur : {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">
          Transactions ({data?.meta.total})
        </h2>
        
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Création..." : "Créer une transaction"}
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 mb-4">
        <select
          value={filters.type ?? ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              type: e.target.value as any,
            })
          }
          className="px-3 py-2 border rounded"
        >
          <option value="">Tous les types</option>
          <option value="income">Revenus</option>
          <option value="expense">Dépenses</option>
        </select>
      </div>

      {/* Liste des transactions */}
      <div className="space-y-2">
        {data?.data.map((transaction) => (
          <div
            key={transaction.id}
            className="p-4 border rounded flex items-center justify-between"
          >
            <div>
              <div className="font-semibold">{transaction.description}</div>
              <div className="text-sm text-gray-500">
                {transaction.category} • {transaction.paymentMethod}
              </div>
              <div className="text-xs text-gray-400">
                {new Date(transaction.date).toLocaleDateString("fr-FR")}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div
                className={`text-lg font-bold ${
                  transaction.type === "income"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatPriceFCFA(transaction.amount)}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdate(transaction.id)}
                  className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                  disabled={updateMutation.isPending}
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(transaction.id)}
                  className="px-3 py-1 text-sm bg-red-200 text-red-700 rounded hover:bg-red-300"
                  disabled={deleteMutation.isPending}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex gap-2 mt-4 justify-center">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Précédent
        </button>
        <span className="px-4 py-2">
          Page {data?.meta.page} / {data?.meta.totalPages}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === data?.meta.totalPages}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

// ============================================
// Exemple 2 : Liste de produits
// ============================================

export function ProductsExample() {
  const { data, isLoading } = useMockProducts({
    page: 1,
    limit: 20,
  });

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Produits ({data?.meta.total})
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.data.map((product) => (
          <div key={product.id} className="border rounded p-4">
            <div className="font-semibold">{product.name}</div>
            <div className="text-sm text-gray-500">{product.category}</div>
            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
            <div className="mt-2">
              <div className="text-lg font-bold">
                {formatPriceFCFA(product.price)}
              </div>
              <div className="text-sm">
                Stock: {product.stock} unités
                {product.minStock && product.stock <= product.minStock && (
                  <span className="ml-2 text-red-600">⚠️ Stock faible</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Exemple 3 : Dashboard avec statistiques
// ============================================

export function DashboardExample() {
  const { data: stats, isLoading } = useMockDashboardStats();

  if (isLoading) return <div>Chargement...</div>;
  if (!stats) return null;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>

      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Revenus</div>
          <div className="text-2xl font-bold text-green-600">
            {formatPriceFCFA(stats.revenue.total)}
          </div>
          <div
            className={`text-sm ${
              stats.revenue.trend === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {stats.revenue.trend === "up" ? "↑" : "↓"}{" "}
            {stats.revenue.change.toFixed(1)}%
          </div>
        </div>

        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Dépenses</div>
          <div className="text-2xl font-bold text-red-600">
            {formatPriceFCFA(stats.expenses.total)}
          </div>
          <div
            className={`text-sm ${
              stats.expenses.trend === "up" ? "text-red-600" : "text-green-600"
            }`}
          >
            {stats.expenses.trend === "up" ? "↑" : "↓"}{" "}
            {stats.expenses.change.toFixed(1)}%
          </div>
        </div>

        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Profit</div>
          <div
            className={`text-2xl font-bold ${
              stats.profit.total > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatPriceFCFA(stats.profit.total)}
          </div>
          <div
            className={`text-sm ${
              stats.profit.trend === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {stats.profit.trend === "up" ? "↑" : "↓"}{" "}
            {stats.profit.change.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Stats commandes */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Commandes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 border rounded text-center">
            <div className="text-2xl font-bold">{stats.orders.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="p-3 border rounded text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.orders.pending}
            </div>
            <div className="text-sm text-gray-500">En attente</div>
          </div>
          <div className="p-3 border rounded text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.orders.delivered}
            </div>
            <div className="text-sm text-gray-500">Livrées</div>
          </div>
          <div className="p-3 border rounded text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.orders.cancelled}
            </div>
            <div className="text-sm text-gray-500">Annulées</div>
          </div>
        </div>
      </div>

      {/* Top produits */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Top Produits</h3>
        <div className="space-y-2">
          {stats.topProducts.map((product, index) => (
            <div key={product.id} className="flex items-center gap-3 p-3 border rounded">
              <div className="text-2xl font-bold text-gray-400">
                #{index + 1}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{product.name}</div>
                <div className="text-sm text-gray-500">
                  {product.sold} unités vendues
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">
                  {formatPriceFCFA(product.revenue)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Exemple 4 : Commandes COD
// ============================================

export function CODOrdersExample() {
  const { data, isLoading } = useMockCODOrders({
    page: 1,
    limit: 10,
  });

  if (isLoading) return <div>Chargement...</div>;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    in_transit: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    returned: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Commandes COD ({data?.meta.total})
      </h2>

      <div className="space-y-3">
        {data?.data.map((order) => (
          <div key={order.id} className="border rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">{order.orderNumber}</div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  statusColors[order.status]
                }`}
              >
                {order.status}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 mb-2">
              <div>{order.customerName}</div>
              <div>{order.customerPhone}</div>
              <div>{order.city}</div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">
                  {order.products.length} produit(s)
                </div>
                {order.trackingNumber && (
                  <div className="text-xs text-gray-400">
                    Suivi: {order.trackingNumber}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className="font-bold">
                  {formatPriceFCFA(order.totalAmount)}
                </div>
                <div className="text-xs text-gray-500">
                  + {formatPriceFCFA(order.deliveryFee)} livraison
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Exemple 5 : Clients
// ============================================

export function CustomersExample() {
  const { data, isLoading } = useMockCustomers({
    page: 1,
    limit: 15,
  });

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Clients ({data?.meta.total})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.data.map((customer) => (
          <div key={customer.id} className="border rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">{customer.name}</div>
              <div className="text-sm text-gray-500">
                {customer.totalOrders} commandes
              </div>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              {customer.email && <div>📧 {customer.email}</div>}
              <div>📱 {customer.phone}</div>
              {customer.city && <div>📍 {customer.city}</div>}
            </div>

            <div className="mt-3 pt-3 border-t">
              <div className="text-sm text-gray-500">Total dépensé</div>
              <div className="text-lg font-bold text-green-600">
                {formatPriceFCFA(customer.totalSpent)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
