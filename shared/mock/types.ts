/**
 * Types TypeScript pour le système de Mock Data
 * 
 * Ces types sont exportés pour faciliter l'utilisation dans vos composants
 */

// Réexporter tous les types des generators
export type {
  MockTransaction,
  MockProduct,
  MockCODOrder,
  MockCustomer,
  MockDashboardStats,
} from "./generators";

// Types utilitaires pour les filtres
export interface TransactionFilters {
  type?: "income" | "expense";
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ProductFilters {
  category?: string;
  isActive?: boolean;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export interface CODOrderFilters {
  status?: "pending" | "confirmed" | "shipped" | "in_transit" | "delivered" | "returned" | "cancelled";
  city?: string;
  page?: number;
  limit?: number;
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
}

// Types pour les inputs de création
export interface CreateTransactionInput {
  amount: number;
  description: string;
  type: "income" | "expense";
  category: string;
  date?: string;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  category: string;
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
  maxStock?: number;
  description?: string;
}

export interface CreateCODOrderInput {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  city: string;
  products: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  deliveryFee: number;
}

export interface CreateCustomerInput {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
}
