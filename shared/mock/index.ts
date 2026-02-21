/**
 * Point d'entrée principal pour le système de mock data
 * 
 * @example
 * ```ts
 * import { useMockTransactions, mockAPI, setMockEnabled } from "@/shared/mock";
 * 
 * // Dans votre composant
 * const { data, isLoading } = useMockTransactions({ page: 1, limit: 10 });
 * ```
 */

// Configuration
export { MOCK_CONFIG, setMockEnabled, isMockEnabled } from "../config/mock";

// API Mock
export { mockAPI } from "./api";

// Database
export { mockDB } from "./database";

// Generators
export {
  generateTransaction,
  generateProduct,
  generateCODOrder,
  generateCustomer,
  generateDashboardStats,
  generatePaginatedResponse,
  type MockTransaction,
  type MockProduct,
  type MockCODOrder,
  type MockCustomer,
  type MockDashboardStats,
} from "./generators";

// Types
export type {
  TransactionFilters,
  ProductFilters,
  CODOrderFilters,
  CustomerFilters,
  CreateTransactionInput,
  CreateProductInput,
  CreateCODOrderInput,
  CreateCustomerInput,
} from "./types";

// Auth Mock
export {
  mockAuthAPI,
  MOCK_USERS,
  MOCK_TENANT,
  MOCK_CREDENTIALS,
} from "./auth";

export {
  useMockLogin,
  useMockRegister,
  useMockLogout,
  useMockCurrentUser,
  useMockSession,
  mockLoginSchema,
  mockRegisterSchema,
  type MockLoginInput,
  type MockRegisterInput,
} from "./auth-hooks";

// Hooks
export {
  // Transactions
  useMockTransactions,
  useMockTransaction,
  useMockCreateTransaction,
  useMockUpdateTransaction,
  useMockDeleteTransaction,
  
  // Products
  useMockProducts,
  useMockProduct,
  useMockCreateProduct,
  useMockUpdateProduct,
  useMockDeleteProduct,
  
  // COD Orders
  useMockCODOrders,
  useMockCODOrder,
  useMockCreateCODOrder,
  useMockUpdateCODOrder,
  useMockDeleteCODOrder,
  
  // Customers
  useMockCustomers,
  useMockCustomer,
  useMockCreateCustomer,
  useMockUpdateCustomer,
  useMockDeleteCustomer,
  
  // Dashboard
  useMockDashboardStats,
} from "./hooks";
