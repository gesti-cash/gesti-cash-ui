/**
 * Générateurs de données fake pour toutes les entités
 */

import type { PaginatedResponse } from "../types";

// ============================================
// Utilitaires de génération
// ============================================

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

export function randomChoice<T>(array: readonly T[]): T {
  return array[randomInt(0, array.length - 1)];
}

export function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export function randomPastDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysAgo));
  return date;
}

export function randomFutureDate(daysAhead: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + randomInt(0, daysAhead));
  return date;
}

export function generateId(): string {
  return `${Date.now()}-${randomInt(1000, 9999)}`;
}

// ============================================
// Données de référence
// ============================================

const FIRST_NAMES = [
  "Amadou", "Fatou", "Moussa", "Aïcha", "Ibrahim", "Mariama", 
  "Ousmane", "Fatoumata", "Mamadou", "Aminata", "Youssouf", "Kadiatou",
  "Seydou", "Binta", "Mohamed", "Hawa", "Boubacar", "Mariam"
];

const LAST_NAMES = [
  "Diallo", "Ndiaye", "Koné", "Traoré", "Sow", "Bah",
  "Sylla", "Camara", "Keita", "Cissé", "Touré", "Sanogo",
  "Coulibaly", "Dembélé", "Fofana", "Barry"
];

const CITIES = [
  "Dakar", "Abidjan", "Bamako", "Conakry", "Lomé", "Cotonou",
  "Ouagadougou", "Niamey", "Douala", "Yaoundé", "Libreville", "Brazzaville"
];

const PRODUCT_NAMES = [
  "iPhone 15 Pro", "Samsung Galaxy S24", "MacBook Air M3", "iPad Pro",
  "AirPods Pro", "PlayStation 5", "Xbox Series X", "Nintendo Switch",
  "Chemise en coton", "Pantalon jean", "Robe africaine", "Boubou brodé",
  "Chaussures Nike", "Baskets Adidas", "Sandales cuir", "Sac à main",
  "Montre connectée", "Écouteurs Bluetooth", "Chargeur rapide", "Powerbank",
  "Parfum femme", "Parfum homme", "Crème visage", "Huile de coco",
  "Riz parfumé 25kg", "Huile végétale 5L", "Sucre 1kg", "Café moulu"
];

const CATEGORIES = [
  "Électronique", "Mode & Vêtements", "Accessoires", "Beauté & Cosmétiques",
  "Alimentation", "Maison & Déco", "Sport & Loisirs", "Téléphonie",
  "Informatique", "Bijouterie"
];

const TRANSACTION_DESCRIPTIONS = [
  "Vente boutique", "Vente en ligne", "Commande WhatsApp", "Commande Facebook",
  "Client régulier", "Nouvelle cliente", "Grossiste", "Détail",
  "Livraison COD", "Paiement mobile money", "Espèces", "Virement"
];

const COD_STATUSES = [
  "pending", "confirmed", "shipped", "in_transit", "delivered", 
  "returned", "cancelled"
] as const;

const PAYMENT_METHODS = [
  "cash", "mobile_money", "bank_transfer", "card", "cod"
] as const;

// ============================================
// Générateurs d'entités
// ============================================

export interface MockTransaction {
  id: string;
  amount: number;
  description: string;
  type: "income" | "expense";
  category: string;
  date: string;
  tenantId: string;
  customerName?: string;
  paymentMethod?: typeof PAYMENT_METHODS[number];
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function generateTransaction(
  tenantId: string,
  overrides?: Partial<MockTransaction>
): MockTransaction {
  const isIncome = Math.random() > 0.3; // 70% income, 30% expense
  
  return {
    id: generateId(),
    amount: randomFloat(isIncome ? 5000 : 1000, isIncome ? 500000 : 100000),
    description: randomChoice(TRANSACTION_DESCRIPTIONS),
    type: isIncome ? "income" : "expense",
    category: randomChoice(CATEGORIES),
    date: randomPastDate(90).toISOString(),
    tenantId,
    customerName: Math.random() > 0.5 
      ? `${randomChoice(FIRST_NAMES)} ${randomChoice(LAST_NAMES)}` 
      : undefined,
    paymentMethod: randomChoice(PAYMENT_METHODS),
    reference: `REF-${randomInt(10000, 99999)}`,
    notes: Math.random() > 0.7 ? "Note de transaction" : undefined,
    createdAt: randomPastDate(90).toISOString(),
    updatedAt: randomPastDate(30).toISOString(),
    ...overrides,
  };
}

export interface MockProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
  maxStock?: number;
  description?: string;
  imageUrl?: string;
  tenantId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function generateProduct(
  tenantId: string,
  overrides?: Partial<MockProduct>
): MockProduct {
  const price = randomFloat(5000, 500000);
  const cost = randomFloat(price * 0.4, price * 0.7);
  
  return {
    id: generateId(),
    name: randomChoice(PRODUCT_NAMES),
    sku: `SKU-${randomInt(1000, 9999)}`,
    category: randomChoice(CATEGORIES),
    price,
    cost,
    stock: randomInt(0, 200),
    minStock: randomInt(5, 20),
    maxStock: randomInt(100, 300),
    description: "Description du produit",
    imageUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${generateId()}`,
    tenantId,
    isActive: Math.random() > 0.1, // 90% actifs
    createdAt: randomPastDate(180).toISOString(),
    updatedAt: randomPastDate(30).toISOString(),
    ...overrides,
  };
}

export interface MockCODOrder {
  id: string;
  orderNumber: string;
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
  status: typeof COD_STATUSES[number];
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  notes?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export function generateCODOrder(
  tenantId: string,
  overrides?: Partial<MockCODOrder>
): MockCODOrder {
  const status = randomChoice(COD_STATUSES);
  const createdAt = randomPastDate(60);
  const totalAmount = randomFloat(10000, 300000);
  
  // Format GC-YYYYMMDD-XXXX
  const dateStr = createdAt.toISOString().split('T')[0].replace(/-/g, '');
  const orderNumber = `GC-${dateStr}-${randomInt(1000, 9999)}`;
  
  return {
    id: generateId(),
    orderNumber,
    customerName: `${randomChoice(FIRST_NAMES)} ${randomChoice(LAST_NAMES)}`,
    customerPhone: `+221 ${randomInt(70, 79)} ${randomInt(100, 999)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
    customerAddress: `Quartier ${randomInt(1, 50)}, Rue ${randomInt(1, 100)}`,
    city: randomChoice(CITIES),
    products: [
      {
        productId: generateId(),
        productName: randomChoice(PRODUCT_NAMES),
        quantity: randomInt(1, 5),
        price: totalAmount / randomInt(1, 3),
      }
    ],
    totalAmount,
    deliveryFee: randomFloat(1000, 5000),
    status,
    trackingNumber: status !== "pending" ? `TRK-${randomInt(100000, 999999)}` : undefined,
    shippedAt: ["shipped", "in_transit", "delivered"].includes(status) 
      ? randomPastDate(30).toISOString() 
      : undefined,
    deliveredAt: status === "delivered" 
      ? randomPastDate(15).toISOString() 
      : undefined,
    notes: Math.random() > 0.7 ? "Notes de livraison" : undefined,
    tenantId,
    createdAt: createdAt.toISOString(),
    updatedAt: randomPastDate(10).toISOString(),
    ...overrides,
  };
}

export interface MockCustomer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  totalOrders: number;
  totalSpent: number;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export function generateCustomer(
  tenantId: string,
  overrides?: Partial<MockCustomer>
): MockCustomer {
  const firstName = randomChoice(FIRST_NAMES);
  const lastName = randomChoice(LAST_NAMES);
  
  return {
    id: generateId(),
    name: `${firstName} ${lastName}`,
    email: Math.random() > 0.3 
      ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com` 
      : undefined,
    phone: `+221 ${randomInt(70, 79)} ${randomInt(100, 999)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
    address: Math.random() > 0.5 
      ? `Quartier ${randomInt(1, 50)}, Rue ${randomInt(1, 100)}` 
      : undefined,
    city: Math.random() > 0.5 ? randomChoice(CITIES) : undefined,
    totalOrders: randomInt(1, 50),
    totalSpent: randomFloat(50000, 5000000),
    tenantId,
    createdAt: randomPastDate(365).toISOString(),
    updatedAt: randomPastDate(30).toISOString(),
    ...overrides,
  };
}

export interface MockDashboardStats {
  revenue: {
    total: number;
    change: number; // percentage
    trend: "up" | "down";
  };
  expenses: {
    total: number;
    change: number;
    trend: "up" | "down";
  };
  profit: {
    total: number;
    change: number;
    trend: "up" | "down";
  };
  orders: {
    total: number;
    pending: number;
    delivered: number;
    cancelled: number;
  };
  lowStockProducts: number;
  topProducts: Array<{
    id: string;
    name: string;
    sold: number;
    revenue: number;
  }>;
  recentTransactions: MockTransaction[];
}

export function generateDashboardStats(tenantId: string): MockDashboardStats {
  const revenue = randomFloat(1000000, 10000000);
  const expenses = randomFloat(400000, revenue * 0.6);
  const profit = revenue - expenses;
  
  return {
    revenue: {
      total: revenue,
      change: randomFloat(-10, 30),
      trend: Math.random() > 0.3 ? "up" : "down",
    },
    expenses: {
      total: expenses,
      change: randomFloat(-5, 15),
      trend: Math.random() > 0.5 ? "up" : "down",
    },
    profit: {
      total: profit,
      change: randomFloat(-15, 40),
      trend: profit > 0 && Math.random() > 0.4 ? "up" : "down",
    },
    orders: {
      total: randomInt(100, 1000),
      pending: randomInt(10, 50),
      delivered: randomInt(80, 900),
      cancelled: randomInt(5, 30),
    },
    lowStockProducts: randomInt(0, 15),
    topProducts: Array.from({ length: 5 }, () => ({
      id: generateId(),
      name: randomChoice(PRODUCT_NAMES),
      sold: randomInt(10, 200),
      revenue: randomFloat(100000, 2000000),
    })),
    recentTransactions: Array.from({ length: 5 }, () => 
      generateTransaction(tenantId)
    ),
  };
}

// ============================================
// Stock Movements (Mouvements)
// ============================================

export const MOVEMENT_TYPES = ["IN", "OUT", "ADJUSTMENT", "TRANSFER"] as const;
export type MockMovementType = (typeof MOVEMENT_TYPES)[number];

export interface MockStockMovement {
  id: string;
  tenantId: string;
  organizationId?: string;
  productId: string;
  productName: string;
  productSku?: string;
  type: MockMovementType;
  quantity: number;
  quantityBefore?: number;
  quantityAfter?: number;
  reference?: string;
  reason?: string;
  createdAt: string;
  createdBy?: string;
}

export function generateStockMovement(
  tenantId: string,
  overrides?: Partial<MockStockMovement>
): MockStockMovement {
  const type = randomChoice(MOVEMENT_TYPES);
  const qty = randomInt(1, 50);
  const qtyBefore = randomInt(10, 200);
  const isIn = type === "IN" || type === "ADJUSTMENT";
  const quantity = isIn ? qty : -qty;
  return {
    id: generateId(),
    tenantId,
    productId: generateId(),
    productName: randomChoice(PRODUCT_NAMES),
    productSku: `SKU-${randomInt(1000, 9999)}`,
    type,
    quantity,
    quantityBefore: qtyBefore,
    quantityAfter: qtyBefore + quantity,
    reference: `MOV-${randomInt(10000, 99999)}`,
    reason: type === "ADJUSTMENT" ? "Ajustement inventaire" : undefined,
    createdAt: randomPastDate(60).toISOString(),
    createdBy: `${randomChoice(FIRST_NAMES)} ${randomChoice(LAST_NAMES)}`,
    ...overrides,
  };
}

// ============================================
// Cash (Caisse) - Sessions & Transactions
// ============================================

export interface MockCashSession {
  id: string;
  tenantId: string;
  organizationId?: string;
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  closingBalance?: number;
  totalIn: number;
  totalOut: number;
  status: "open" | "closed";
  openedBy?: string;
  closedBy?: string;
}

export interface MockCashTransaction {
  id: string;
  sessionId: string;
  tenantId: string;
  type: "in" | "out";
  amount: number;
  label: string;
  reference?: string;
  createdAt: string;
  createdBy?: string;
}

export function generateCashSession(
  tenantId: string,
  overrides?: Partial<MockCashSession>
): MockCashSession {
  const openingBalance = randomFloat(50000, 500000);
  const totalIn = randomFloat(100000, 2000000);
  const totalOut = randomFloat(50000, totalIn * 0.8);
  const isClosed = Math.random() > 0.3;
  return {
    id: generateId(),
    tenantId,
    openedAt: randomPastDate(30).toISOString(),
    closedAt: isClosed ? randomPastDate(20).toISOString() : undefined,
    openingBalance,
    closingBalance: isClosed ? openingBalance + totalIn - totalOut : undefined,
    totalIn,
    totalOut,
    status: isClosed ? "closed" : "open",
    openedBy: randomChoice(FIRST_NAMES) + " " + randomChoice(LAST_NAMES),
    closedBy: isClosed ? randomChoice(FIRST_NAMES) + " " + randomChoice(LAST_NAMES) : undefined,
    ...overrides,
  };
}

export function generateCashTransaction(
  sessionId: string,
  tenantId: string,
  overrides?: Partial<MockCashTransaction>
): MockCashTransaction {
  const isIn = Math.random() > 0.4;
  return {
    id: generateId(),
    sessionId,
    tenantId,
    type: isIn ? "in" : "out",
    amount: randomFloat(5000, 200000),
    label: isIn ? randomChoice(TRANSACTION_DESCRIPTIONS) : "Dépense caisse",
    reference: `CASH-${randomInt(1000, 9999)}`,
    createdAt: randomPastDate(7).toISOString(),
    createdBy: randomChoice(FIRST_NAMES) + " " + randomChoice(LAST_NAMES),
    ...overrides,
  };
}

// ============================================
// ROAS (Return on Ad Spend)
// ============================================

export interface MockRoasCampaign {
  id: string;
  tenantId: string;
  name: string;
  channel: string;
  spend: number;
  revenueCashReal: number;
  roas: number;
  startDate: string;
  endDate?: string;
  status: "active" | "paused" | "ended";
  createdAt: string;
}

const ROAS_CHANNELS = ["Facebook", "Instagram", "Google Ads", "TikTok", "WhatsApp", "Affiliation"];

export function generateRoasCampaign(
  tenantId: string,
  overrides?: Partial<MockRoasCampaign>
): MockRoasCampaign {
  const spend = randomFloat(50000, 500000);
  const revenueCashReal = randomFloat(spend * 0.5, spend * 4);
  const roas = revenueCashReal / spend;
  return {
    id: generateId(),
    tenantId,
    name: `Campagne ${randomChoice(ROAS_CHANNELS)} ${randomInt(1, 12)}/${new Date().getFullYear()}`,
    channel: randomChoice(ROAS_CHANNELS),
    spend,
    revenueCashReal,
    roas,
    startDate: randomPastDate(90).toISOString().split("T")[0],
    endDate: Math.random() > 0.5 ? randomPastDate(30).toISOString().split("T")[0] : undefined,
    status: randomChoice(["active", "paused", "ended"] as const),
    createdAt: randomPastDate(60).toISOString(),
    ...overrides,
  };
}

// ============================================
// Générateur de réponses paginées
// ============================================

export function generatePaginatedResponse<T>(
  items: T[],
  page = 1,
  limit = 10
): PaginatedResponse<T> {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return {
    data: items.slice(start, end),
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}
