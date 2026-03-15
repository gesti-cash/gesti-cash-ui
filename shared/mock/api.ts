/**
 * API Mock qui simule les endpoints du backend
 * Utilise la base de données mock pour renvoyer des données réalistes
 */

import { simulateApiCall, isMockEnabled } from "../config/mock";
import { mockDB } from "./database";
import type { PaginatedResponse } from "../types";
import type {
  MockTransaction,
  MockProduct,
  MockCODOrder,
  MockCustomer,
  MockDashboardStats,
  MockStockMovement,
  MockCashSession,
  MockCashTransaction,
  MockRoasCampaign,
} from "./generators";

// ============================================
// Mock API Client
// ============================================

export const mockAPI = {
  // ============================================
  // Transactions
  // ============================================
  
  transactions: {
    list: async (
      tenantId: string,
      filters?: {
        type?: "income" | "expense";
        category?: string;
        dateFrom?: string;
        dateTo?: string;
        page?: number;
        limit?: number;
      }
    ): Promise<PaginatedResponse<MockTransaction>> => {
      return simulateApiCall(() => mockDB.getTransactions(tenantId, filters));
    },

    get: async (id: string): Promise<MockTransaction> => {
      return simulateApiCall(() => {
        const transaction = mockDB.getTransaction(id);
        if (!transaction) {
          throw new Error(`Transaction ${id} not found`);
        }
        return transaction;
      });
    },

    create: async (
      tenantId: string,
      data: {
        amount: number;
        description: string;
        type: "income" | "expense";
        category: string;
        date?: string;
      }
    ): Promise<MockTransaction> => {
      return simulateApiCall(() => {
        return mockDB.createTransaction(tenantId, {
          ...data,
          date: data.date ?? new Date().toISOString(),
        } as any);
      });
    },

    update: async (
      id: string,
      data: Partial<MockTransaction>
    ): Promise<MockTransaction> => {
      return simulateApiCall(() => {
        const updated = mockDB.updateTransaction(id, data);
        if (!updated) {
          throw new Error(`Transaction ${id} not found`);
        }
        return updated;
      });
    },

    delete: async (id: string): Promise<void> => {
      return simulateApiCall(() => {
        const deleted = mockDB.deleteTransaction(id);
        if (!deleted) {
          throw new Error(`Transaction ${id} not found`);
        }
      });
    },
  },

  // ============================================
  // Products
  // ============================================

  products: {
    list: async (
      tenantId: string,
      filters?: {
        category?: string;
        isActive?: boolean;
        lowStock?: boolean;
        page?: number;
        limit?: number;
      }
    ): Promise<PaginatedResponse<MockProduct>> => {
      return simulateApiCall(() => mockDB.getProducts(tenantId, filters));
    },

    get: async (id: string): Promise<MockProduct> => {
      return simulateApiCall(() => {
        const product = mockDB.getProduct(id);
        if (!product) {
          throw new Error(`Product ${id} not found`);
        }
        return product;
      });
    },

    create: async (
      tenantId: string,
      data: {
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
    ): Promise<MockProduct> => {
      return simulateApiCall(() => {
        return mockDB.createProduct(tenantId, {
          ...data,
          isActive: true,
        } as any);
      });
    },

    update: async (
      id: string,
      data: Partial<MockProduct>
    ): Promise<MockProduct> => {
      return simulateApiCall(() => {
        const updated = mockDB.updateProduct(id, data);
        if (!updated) {
          throw new Error(`Product ${id} not found`);
        }
        return updated;
      });
    },

    delete: async (id: string): Promise<void> => {
      return simulateApiCall(() => {
        const deleted = mockDB.deleteProduct(id);
        if (!deleted) {
          throw new Error(`Product ${id} not found`);
        }
      });
    },
  },

  // ============================================
  // COD Orders
  // ============================================

  codOrders: {
    list: async (
      tenantId: string,
      filters?: {
        status?: string;
        city?: string;
        page?: number;
        limit?: number;
      }
    ): Promise<PaginatedResponse<MockCODOrder>> => {
      return simulateApiCall(() => mockDB.getCODOrders(tenantId, filters));
    },

    get: async (id: string): Promise<MockCODOrder> => {
      return simulateApiCall(() => {
        const order = mockDB.getCODOrder(id);
        if (!order) {
          throw new Error(`COD Order ${id} not found`);
        }
        return order;
      });
    },

    create: async (
      tenantId: string,
      data: {
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
    ): Promise<MockCODOrder> => {
      return simulateApiCall(() => {
        return mockDB.createCODOrder(tenantId, {
          ...data,
          status: "pending",
        } as any);
      });
    },

    update: async (
      id: string,
      data: Partial<MockCODOrder>
    ): Promise<MockCODOrder> => {
      return simulateApiCall(() => {
        const updated = mockDB.updateCODOrder(id, data);
        if (!updated) {
          throw new Error(`COD Order ${id} not found`);
        }
        return updated;
      });
    },

    delete: async (id: string): Promise<void> => {
      return simulateApiCall(() => {
        const deleted = mockDB.deleteCODOrder(id);
        if (!deleted) {
          throw new Error(`COD Order ${id} not found`);
        }
      });
    },
  },

  // ============================================
  // Customers
  // ============================================

  customers: {
    list: async (
      tenantId: string,
      filters?: {
        page?: number;
        limit?: number;
      }
    ): Promise<PaginatedResponse<MockCustomer>> => {
      return simulateApiCall(() => mockDB.getCustomers(tenantId, filters));
    },

    get: async (id: string): Promise<MockCustomer> => {
      return simulateApiCall(() => {
        const customer = mockDB.getCustomer(id);
        if (!customer) {
          throw new Error(`Customer ${id} not found`);
        }
        return customer;
      });
    },

    create: async (
      tenantId: string,
      data: {
        name: string;
        email?: string;
        phone: string;
        address?: string;
        city?: string;
      }
    ): Promise<MockCustomer> => {
      return simulateApiCall(() => {
        return mockDB.createCustomer(tenantId, {
          ...data,
          totalOrders: 0,
          totalSpent: 0,
        } as any);
      });
    },

    update: async (
      id: string,
      data: Partial<MockCustomer>
    ): Promise<MockCustomer> => {
      return simulateApiCall(() => {
        const updated = mockDB.updateCustomer(id, data);
        if (!updated) {
          throw new Error(`Customer ${id} not found`);
        }
        return updated;
      });
    },

    delete: async (id: string): Promise<void> => {
      return simulateApiCall(() => {
        const deleted = mockDB.deleteCustomer(id);
        if (!deleted) {
          throw new Error(`Customer ${id} not found`);
        }
      });
    },
  },

  // ============================================
  // Dashboard
  // ============================================

  dashboard: {
    getStats: async (
      tenantId: string,
      period?: string
    ): Promise<MockDashboardStats> => {
      return simulateApiCall(() => mockDB.getDashboardStats(tenantId, period));
    },
  },

  // ============================================
  // Stock Movements (Mouvements)
  // ============================================

  movements: {
    list: async (
      tenantId: string,
      filters?: {
        type?: string;
        dateFrom?: string;
        dateTo?: string;
        productId?: string;
        page?: number;
        limit?: number;
      }
    ): Promise<PaginatedResponse<MockStockMovement>> => {
      return simulateApiCall(() => mockDB.getStockMovements(tenantId, filters));
    },
    create: async (
      tenantId: string,
      data: Omit<MockStockMovement, "id" | "tenantId" | "createdAt">
    ): Promise<MockStockMovement> => {
      return simulateApiCall(() => mockDB.createStockMovement(tenantId, data));
    },
  },

  // ============================================
  // Cash (Caisse)
  // ============================================

  cash: {
    sessions: {
      list: async (
        tenantId: string,
        filters?: { status?: "open" | "closed"; page?: number; limit?: number }
      ): Promise<PaginatedResponse<MockCashSession>> => {
        return simulateApiCall(() => mockDB.getCashSessions(tenantId, filters));
      },
      getOpen: async (tenantId: string): Promise<MockCashSession | null> => {
        return simulateApiCall(() => mockDB.getOpenCashSession(tenantId));
      },
      open: async (
        tenantId: string,
        data: { openingBalance: number; openedBy?: string; organizationId?: string }
      ): Promise<MockCashSession> => {
        return simulateApiCall(() => mockDB.openCashSession(tenantId, data));
      },
      close: async (
        sessionId: string,
        data: { closingBalance: number; closedBy?: string }
      ): Promise<MockCashSession> => {
        return simulateApiCall(() => {
          const s = mockDB.closeCashSession(sessionId, data.closingBalance, data.closedBy);
          if (!s) throw new Error("Session not found or already closed");
          return s;
        });
      },
    },
    transactions: {
      list: async (sessionId: string): Promise<MockCashTransaction[]> => {
        return simulateApiCall(() => mockDB.getCashTransactions(sessionId));
      },
      add: async (
        sessionId: string,
        tenantId: string,
        data: { type: "in" | "out"; amount: number; label: string; reference?: string; createdBy?: string }
      ): Promise<MockCashTransaction> => {
        const tx = mockDB.addCashTransaction(sessionId, tenantId, data);
        if (!tx) throw new Error("Session not found or closed");
        return tx;
      },
    },
  },

  // ============================================
  // ROAS Campaigns
  // ============================================

  roas: {
    list: async (
      tenantId: string,
      filters?: { status?: string; channel?: string; page?: number; limit?: number }
    ): Promise<PaginatedResponse<MockRoasCampaign>> => {
      return simulateApiCall(() => mockDB.getRoasCampaigns(tenantId, filters));
    },
    create: async (
      tenantId: string,
      data: Omit<MockRoasCampaign, "id" | "tenantId" | "createdAt" | "roas">
    ): Promise<MockRoasCampaign> => {
      return simulateApiCall(() => mockDB.createRoasCampaign(tenantId, data));
    },
  },

  // ============================================
  // Utility
  // ============================================

  reset: () => {
    mockDB.reset();
  },
};

// ============================================
// Helper to check if mock is enabled
// ============================================

export { isMockEnabled };
