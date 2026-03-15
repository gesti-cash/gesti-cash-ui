/**
 * Base de données en mémoire pour les données mock
 * Simule une vraie base de données avec CRUD operations
 */

import {
  generateId,
  randomInt,
  generateTransaction,
  generateProduct,
  generateCODOrder,
  generateCustomer,
  generateDashboardStats,
  generateStockMovement,
  generateCashSession,
  generateCashTransaction,
  generateRoasCampaign,
  generatePaginatedResponse,
  type MockTransaction,
  type MockProduct,
  type MockCODOrder,
  type MockCustomer,
  type MockDashboardStats,
  type MockStockMovement,
  type MockCashSession,
  type MockCashTransaction,
  type MockRoasCampaign,
} from "./generators";
import type { PaginatedResponse } from "../types";

// ============================================
// Database Storage
// ============================================

class MockDatabase {
  private transactions: Map<string, MockTransaction> = new Map();
  private products: Map<string, MockProduct> = new Map();
  private codOrders: Map<string, MockCODOrder> = new Map();
  private customers: Map<string, MockCustomer> = new Map();
  private dashboardStats: Map<string, MockDashboardStats> = new Map();
  private stockMovements: Map<string, MockStockMovement> = new Map();
  private cashSessions: Map<string, MockCashSession> = new Map();
  private cashTransactions: Map<string, MockCashTransaction> = new Map();
  private roasCampaigns: Map<string, MockRoasCampaign> = new Map();

  constructor() {
    this.seed();
  }

  /**
   * Initialise la base de données avec des données de test
   */
  seed() {
    const defaultTenantId = "tenant-default-123";
    
    // Générer 50 transactions
    for (let i = 0; i < 50; i++) {
      const transaction = generateTransaction(defaultTenantId);
      this.transactions.set(transaction.id, transaction);
    }
    
    // Générer 30 produits
    for (let i = 0; i < 30; i++) {
      const product = generateProduct(defaultTenantId);
      this.products.set(product.id, product);
    }
    
    // Générer 40 commandes COD
    for (let i = 0; i < 40; i++) {
      const order = generateCODOrder(defaultTenantId);
      this.codOrders.set(order.id, order);
    }
    
    // Générer 25 clients
    for (let i = 0; i < 25; i++) {
      const customer = generateCustomer(defaultTenantId);
      this.customers.set(customer.id, customer);
    }
    
    // Générer les stats du dashboard
    const stats = generateDashboardStats(defaultTenantId);
    this.dashboardStats.set(defaultTenantId, stats);

    // Générer 60 mouvements de stock
    for (let i = 0; i < 60; i++) {
      const mov = generateStockMovement(defaultTenantId);
      this.stockMovements.set(mov.id, mov);
    }

    // Générer 15 sessions caisse (dont une ouverte)
    for (let i = 0; i < 15; i++) {
      const session = generateCashSession(defaultTenantId, i === 0 ? { status: "open", closedAt: undefined, closingBalance: undefined } : undefined);
      this.cashSessions.set(session.id, session);
      if (session.status === "open" || (i > 0 && i <= 3)) {
        const sid = session.id;
        for (let j = 0; j < randomInt(5, 20); j++) {
          const ct = generateCashTransaction(sid, defaultTenantId);
          this.cashTransactions.set(ct.id, ct);
        }
      }
    }

    // Générer 12 campagnes ROAS
    for (let i = 0; i < 12; i++) {
      const campaign = generateRoasCampaign(defaultTenantId);
      this.roasCampaigns.set(campaign.id, campaign);
    }
  }

  /**
   * Réinitialise toutes les données
   */
  reset() {
    this.transactions.clear();
    this.products.clear();
    this.codOrders.clear();
    this.customers.clear();
    this.dashboardStats.clear();
    this.stockMovements.clear();
    this.cashSessions.clear();
    this.cashTransactions.clear();
    this.roasCampaigns.clear();
    this.seed();
  }

  // ============================================
  // Transactions CRUD
  // ============================================

  getTransactions(
    tenantId: string,
    filters?: {
      type?: "income" | "expense";
      category?: string;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    }
  ): PaginatedResponse<MockTransaction> {
    let items = Array.from(this.transactions.values())
      .filter((t) => t.tenantId === tenantId);

    // Apply filters
    if (filters?.type) {
      items = items.filter((t) => t.type === filters.type);
    }
    if (filters?.category) {
      items = items.filter((t) => t.category === filters.category);
    }
    if (filters?.dateFrom) {
      items = items.filter((t) => new Date(t.date) >= new Date(filters.dateFrom!));
    }
    if (filters?.dateTo) {
      items = items.filter((t) => new Date(t.date) <= new Date(filters.dateTo!));
    }

    // Sort by date (most recent first)
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return generatePaginatedResponse(
      items,
      filters?.page ?? 1,
      filters?.limit ?? 10
    );
  }

  getTransaction(id: string): MockTransaction | null {
    return this.transactions.get(id) ?? null;
  }

  createTransaction(
    tenantId: string,
    data: Omit<MockTransaction, "id" | "tenantId" | "createdAt" | "updatedAt">
  ): MockTransaction {
    const transaction = generateTransaction(tenantId, data);
    this.transactions.set(transaction.id, transaction);
    
    // Update dashboard stats
    this.updateDashboardStatsAfterTransaction(tenantId, transaction);
    
    return transaction;
  }

  updateTransaction(
    id: string,
    data: Partial<MockTransaction>
  ): MockTransaction | null {
    const existing = this.transactions.get(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.transactions.set(id, updated);
    return updated;
  }

  deleteTransaction(id: string): boolean {
    return this.transactions.delete(id);
  }

  // ============================================
  // Products CRUD
  // ============================================

  getProducts(
    tenantId: string,
    filters?: {
      category?: string;
      isActive?: boolean;
      lowStock?: boolean;
      page?: number;
      limit?: number;
    }
  ): PaginatedResponse<MockProduct> {
    let items = Array.from(this.products.values())
      .filter((p) => p.tenantId === tenantId);

    if (filters?.category) {
      items = items.filter((p) => p.category === filters.category);
    }
    if (filters?.isActive !== undefined) {
      items = items.filter((p) => p.isActive === filters.isActive);
    }
    if (filters?.lowStock) {
      items = items.filter((p) => p.minStock && p.stock <= p.minStock);
    }

    return generatePaginatedResponse(
      items,
      filters?.page ?? 1,
      filters?.limit ?? 10
    );
  }

  getProduct(id: string): MockProduct | null {
    return this.products.get(id) ?? null;
  }

  createProduct(
    tenantId: string,
    data: Omit<MockProduct, "id" | "tenantId" | "createdAt" | "updatedAt">
  ): MockProduct {
    const product = generateProduct(tenantId, data);
    this.products.set(product.id, product);
    return product;
  }

  updateProduct(
    id: string,
    data: Partial<MockProduct>
  ): MockProduct | null {
    const existing = this.products.get(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.products.set(id, updated);
    return updated;
  }

  deleteProduct(id: string): boolean {
    return this.products.delete(id);
  }

  // ============================================
  // COD Orders CRUD
  // ============================================

  getCODOrders(
    tenantId: string,
    filters?: {
      status?: string;
      city?: string;
      page?: number;
      limit?: number;
    }
  ): PaginatedResponse<MockCODOrder> {
    let items = Array.from(this.codOrders.values())
      .filter((o) => o.tenantId === tenantId);

    if (filters?.status) {
      items = items.filter((o) => o.status === filters.status);
    }
    if (filters?.city) {
      items = items.filter((o) => o.city === filters.city);
    }

    // Sort by date (most recent first)
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return generatePaginatedResponse(
      items,
      filters?.page ?? 1,
      filters?.limit ?? 10
    );
  }

  getCODOrder(id: string): MockCODOrder | null {
    return this.codOrders.get(id) ?? null;
  }

  createCODOrder(
    tenantId: string,
    data: Omit<MockCODOrder, "id" | "tenantId" | "createdAt" | "updatedAt">
  ): MockCODOrder {
    const order = generateCODOrder(tenantId, data);
    this.codOrders.set(order.id, order);
    return order;
  }

  updateCODOrder(
    id: string,
    data: Partial<MockCODOrder>
  ): MockCODOrder | null {
    const existing = this.codOrders.get(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.codOrders.set(id, updated);
    return updated;
  }

  deleteCODOrder(id: string): boolean {
    return this.codOrders.delete(id);
  }

  // ============================================
  // Customers CRUD
  // ============================================

  getCustomers(
    tenantId: string,
    filters?: {
      page?: number;
      limit?: number;
    }
  ): PaginatedResponse<MockCustomer> {
    const items = Array.from(this.customers.values())
      .filter((c) => c.tenantId === tenantId)
      .sort((a, b) => b.totalSpent - a.totalSpent);

    return generatePaginatedResponse(
      items,
      filters?.page ?? 1,
      filters?.limit ?? 10
    );
  }

  getCustomer(id: string): MockCustomer | null {
    return this.customers.get(id) ?? null;
  }

  createCustomer(
    tenantId: string,
    data: Omit<MockCustomer, "id" | "tenantId" | "createdAt" | "updatedAt">
  ): MockCustomer {
    const customer = generateCustomer(tenantId, data);
    this.customers.set(customer.id, customer);
    return customer;
  }

  updateCustomer(
    id: string,
    data: Partial<MockCustomer>
  ): MockCustomer | null {
    const existing = this.customers.get(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.customers.set(id, updated);
    return updated;
  }

  deleteCustomer(id: string): boolean {
    return this.customers.delete(id);
  }

  // ============================================
  // Dashboard Stats
  // ============================================

  getDashboardStats(tenantId: string, period?: string): MockDashboardStats {
    let stats = this.dashboardStats.get(tenantId);
    
    if (!stats) {
      stats = generateDashboardStats(tenantId);
      this.dashboardStats.set(tenantId, stats);
    }
    
    // Vous pouvez ajuster les stats selon la période si nécessaire
    return stats;
  }

  // ============================================
  // Stock Movements CRUD
  // ============================================

  getStockMovements(
    tenantId: string,
    filters?: {
      type?: string;
      dateFrom?: string;
      dateTo?: string;
      productId?: string;
      page?: number;
      limit?: number;
    }
  ): PaginatedResponse<MockStockMovement> {
    let items = Array.from(this.stockMovements.values()).filter((m) => m.tenantId === tenantId);
    if (filters?.type) items = items.filter((m) => m.type === filters.type);
    if (filters?.dateFrom) items = items.filter((m) => new Date(m.createdAt) >= new Date(filters.dateFrom!));
    if (filters?.dateTo) items = items.filter((m) => new Date(m.createdAt) <= new Date(filters.dateTo!));
    if (filters?.productId) items = items.filter((m) => m.productId === filters.productId);
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return generatePaginatedResponse(items, filters?.page ?? 1, filters?.limit ?? 20);
  }

  createStockMovement(
    tenantId: string,
    data: Omit<MockStockMovement, "id" | "tenantId" | "createdAt">
  ): MockStockMovement {
    const mov = generateStockMovement(tenantId, { ...data, createdAt: new Date().toISOString() });
    this.stockMovements.set(mov.id, mov);
    return mov;
  }

  // ============================================
  // Cash Sessions & Transactions CRUD
  // ============================================

  getCashSessions(
    tenantId: string,
    filters?: { status?: "open" | "closed"; page?: number; limit?: number }
  ): PaginatedResponse<MockCashSession> {
    let items = Array.from(this.cashSessions.values()).filter((s) => s.tenantId === tenantId);
    if (filters?.status) items = items.filter((s) => s.status === filters.status);
    items.sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime());
    return generatePaginatedResponse(items, filters?.page ?? 1, filters?.limit ?? 20);
  }

  getOpenCashSession(tenantId: string): MockCashSession | null {
    return (
      Array.from(this.cashSessions.values()).find((s) => s.tenantId === tenantId && s.status === "open") ?? null
    );
  }

  getCashSession(id: string): MockCashSession | null {
    return this.cashSessions.get(id) ?? null;
  }

  openCashSession(
    tenantId: string,
    data: { openingBalance: number; openedBy?: string; organizationId?: string }
  ): MockCashSession {
    const session: MockCashSession = {
      id: `session-${generateId()}`,
      tenantId,
      organizationId: data.organizationId,
      openedAt: new Date().toISOString(),
      openingBalance: data.openingBalance,
      totalIn: 0,
      totalOut: 0,
      status: "open",
      openedBy: data.openedBy,
    };
    this.cashSessions.set(session.id, session);
    return session;
  }

  closeCashSession(id: string, closingBalance: number, closedBy?: string): MockCashSession | null {
    const session = this.cashSessions.get(id);
    if (!session || session.status !== "open") return null;
    const updated: MockCashSession = {
      ...session,
      closedAt: new Date().toISOString(),
      closingBalance,
      status: "closed",
      closedBy,
    };
    this.cashSessions.set(id, updated);
    return updated;
  }

  getCashTransactions(sessionId: string): MockCashTransaction[] {
    return Array.from(this.cashTransactions.values())
      .filter((t) => t.sessionId === sessionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addCashTransaction(
    sessionId: string,
    tenantId: string,
    data: { type: "in" | "out"; amount: number; label: string; reference?: string; createdBy?: string }
  ): MockCashTransaction | null {
    const session = this.cashSessions.get(sessionId);
    if (!session || session.status !== "open") return null;
    const tx: MockCashTransaction = {
      id: `cash-tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      sessionId,
      tenantId,
      type: data.type,
      amount: data.amount,
      label: data.label,
      reference: data.reference,
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy,
    };
    this.cashTransactions.set(tx.id, tx);
    const updatedSession: MockCashSession = {
      ...session,
      totalIn: session.totalIn + (data.type === "in" ? data.amount : 0),
      totalOut: session.totalOut + (data.type === "out" ? data.amount : 0),
    };
    this.cashSessions.set(sessionId, updatedSession);
    return tx;
  }

  // ============================================
  // ROAS Campaigns CRUD
  // ============================================

  getRoasCampaigns(
    tenantId: string,
    filters?: { status?: string; channel?: string; page?: number; limit?: number }
  ): PaginatedResponse<MockRoasCampaign> {
    let items = Array.from(this.roasCampaigns.values()).filter((c) => c.tenantId === tenantId);
    if (filters?.status) items = items.filter((c) => c.status === filters.status);
    if (filters?.channel) items = items.filter((c) => c.channel === filters.channel);
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return generatePaginatedResponse(items, filters?.page ?? 1, filters?.limit ?? 20);
  }

  createRoasCampaign(
    tenantId: string,
    data: Omit<MockRoasCampaign, "id" | "tenantId" | "createdAt" | "roas">
  ): MockRoasCampaign {
    const roas = data.revenueCashReal / (data.spend || 1);
    const campaign: MockRoasCampaign = {
      ...data,
      id: `roas-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      tenantId,
      roas,
      createdAt: new Date().toISOString(),
    };
    this.roasCampaigns.set(campaign.id, campaign);
    return campaign;
  }

  private updateDashboardStatsAfterTransaction(
    tenantId: string,
    transaction: MockTransaction
  ) {
    const stats = this.getDashboardStats(tenantId);

    if (transaction.type === "income") {
      stats.revenue.total += transaction.amount;
    } else {
      stats.expenses.total += transaction.amount;
    }

    stats.profit.total = stats.revenue.total - stats.expenses.total;

    this.dashboardStats.set(tenantId, stats);
  }
}

// Singleton instance
export const mockDB = new MockDatabase();
