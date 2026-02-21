"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { useMockProducts } from "@/shared/mock";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  MapPin,
  TrendingUp,
  DollarSign,
  Activity,
  Filter,
  X,
  Eye,
  ChevronDown,
  ChevronUp,
  Calendar,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { MockProduct } from "@/shared/mock/generators";

// Catégories disponibles pour les filtres
const FILTER_CATEGORIES = [
  "Tous",
  "Électronique",
  "Mode",
  "Beauté",
  "Maison",
  "Sport",
  "Alimentation",
  "Autre",
];

// Mapping des catégories de filtre vers les catégories réelles
const CATEGORY_MAP: Record<string, string[]> = {
  "Tous": [],
  "Électronique": ["Électronique", "Téléphonie", "Informatique"],
  "Mode": ["Mode & Vêtements", "Accessoires"],
  "Beauté": ["Beauté & Cosmétiques"],
  "Maison": ["Maison & Déco"],
  "Sport": ["Sport & Loisirs"],
  "Alimentation": ["Alimentation"],
  "Autre": ["Bijouterie"],
};

// Calculer la marge
const calculateMargin = (product: MockProduct): number => {
  if (!product.cost || product.cost === 0) return 0;
  return ((product.price - product.cost) / product.cost) * 100;
};

// Formater le prix
const formatPrice = (price: number): string => {
  return `${price.toLocaleString("fr-FR")} FCFA`;
};

const ITEMS_PER_PAGE = 10;

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedProduct, setSelectedProduct] = useState<MockProduct | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    stockFilter: "all", // "all" | "low" | "inStock" | "outOfStock"
    marginFilter: "all", // "all" | "high" | "medium" | "low"
    priceRange: { min: "", max: "" },
    statusFilter: "all", // "all" | "active" | "inactive"
  });
  const { data, isLoading, error } = useMockProducts({
    page: 1,
    limit: 100,
  });

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => new Set(prev).add(productId));
  };

  // Filtrer les produits par recherche et catégorie
  const filteredProducts = useMemo(() => {
    if (!data?.data) return [];
    
    let products = data.data;
    
    // Filtre par catégorie
    if (selectedCategory !== "Tous") {
      const mappedCategories = CATEGORY_MAP[selectedCategory] || [];
      if (mappedCategories.length > 0) {
        products = products.filter((product) =>
          mappedCategories.includes(product.category)
        );
      }
    }
    
    // Filtre de recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
    }

    // Filtre par stock
    if (filters.stockFilter !== "all") {
      products = products.filter((product) => {
        const isLowStock = product.minStock && product.stock <= product.minStock;
        switch (filters.stockFilter) {
          case "low":
            return isLowStock;
          case "inStock":
            return product.stock > 0;
          case "outOfStock":
            return product.stock === 0;
          default:
            return true;
        }
      });
    }

    // Filtre par marge
    if (filters.marginFilter !== "all") {
      products = products.filter((product) => {
        const margin = calculateMargin(product);
        switch (filters.marginFilter) {
          case "high":
            return margin >= 50;
          case "medium":
            return margin >= 20 && margin < 50;
          case "low":
            return margin < 20;
          default:
            return true;
        }
      });
    }

    // Filtre par prix
    if (filters.priceRange.min || filters.priceRange.max) {
      products = products.filter((product) => {
        const min = filters.priceRange.min ? parseFloat(filters.priceRange.min) : 0;
        const max = filters.priceRange.max ? parseFloat(filters.priceRange.max) : Infinity;
        return product.price >= min && product.price <= max;
      });
    }

    // Filtre par statut
    if (filters.statusFilter !== "all") {
      products = products.filter((product) => {
        return filters.statusFilter === "active" ? product.isActive : !product.isActive;
      });
    }
    
    return products;
  }, [data?.data, searchQuery, selectedCategory, filters]);

  // Pagination
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, filters]);

  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Afficher toutes les pages si moins de maxVisible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Toujours afficher la première page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push("...");
      }
      
      // Afficher les pages autour de la page actuelle
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      
      // Toujours afficher la dernière page
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Compter les produits en alerte de stock
  const lowStockCount = useMemo(() => {
    if (!data?.data) return 0;
    return data.data.filter(
      (product) => product.minStock && product.stock <= product.minStock
    ).length;
  }, [data?.data]);

  // Statistiques
  const stats = useMemo(() => {
    if (!data?.data) {
      return {
        total: 0,
        totalValue: 0,
        averageMargin: 0,
        lowStock: 0,
      };
    }
    
    const products = data.data;
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const margins = products
      .map((p) => calculateMargin(p))
      .filter((m) => m > 0);
    const averageMargin =
      margins.length > 0
        ? margins.reduce((sum, m) => sum + m, 0) / margins.length
        : 0;

    return {
      total: products.length,
      totalValue,
      averageMargin,
      lowStock: lowStockCount,
    };
  }, [data?.data, lowStockCount]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 dark:from-black dark:via-zinc-950 dark:to-black">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-green-500/20 border-t-green-500 dark:border-green-600/20 dark:border-t-green-600 mx-auto"></div>
            <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-2 border-green-500/30 dark:border-green-600/30"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Chargement des produits...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full bg-gradient-to-br from-white via-white to-zinc-50/50 border-red-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-red-900/50 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 rounded-full bg-red-500/20 blur-2xl animate-pulse"></div>
                <div className="relative p-4 rounded-full bg-gradient-to-br from-red-500/10 to-rose-500/10 dark:from-red-500/5 dark:to-rose-500/5">
                  <AlertTriangle className="h-12 w-12 text-red-500 dark:text-red-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Erreur de chargement
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-6">
                {error instanceof Error ? error.message : "Une erreur est survenue lors du chargement des produits"}
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
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header avec logo et icône */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-600/30 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 p-3 shadow-2xl shadow-green-500/20 ring-2 ring-green-500/20 dark:from-green-500/10 dark:to-emerald-600/10 dark:ring-green-500/10 group-hover:scale-105 transition-transform duration-300">
                  <Package className="h-full w-full text-green-400 dark:text-green-500" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent mb-2 dark:from-green-500 dark:via-emerald-400 dark:to-green-400 tracking-tight">
                  Produits
                </h1>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                  <p className="text-zinc-500 text-sm lg:text-base dark:text-zinc-400 font-medium">
                    Gérez votre catalogue de produits
                  </p>
                </div>
              </div>
            </div>
            <Button
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20 dark:shadow-green-500/10 px-6 py-2.5 font-semibold transition-all duration-200 hover:scale-105 group"
            >
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Nouveau Produit
            </Button>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-green-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 dark:hover:border-green-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-green-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 dark:from-green-500/15 dark:to-emerald-500/15">
                    <Package className="h-4 w-4 text-green-500 dark:text-green-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400 mb-1">
                  {stats.total}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">
                  Produits totaux
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-emerald-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 dark:hover:border-emerald-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-emerald-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 dark:from-emerald-500/15 dark:to-teal-500/15">
                    <DollarSign className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400 mb-1">
                  {formatPrice(stats.totalValue)}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">
                  Valeur totale
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-blue-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 dark:hover:border-blue-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-blue-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-500/15 dark:to-cyan-500/15">
                    <TrendingUp className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-400 mb-1">
                  {stats.averageMargin.toFixed(1)}%
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">
                  Marge moyenne
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-yellow-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-yellow-500/10 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 dark:hover:border-yellow-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-yellow-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 dark:from-yellow-500/15 dark:to-amber-500/15">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent dark:from-yellow-500 dark:to-amber-500 mb-1">
                  {stats.lowStock}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">
                  En alerte stock
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stock Alert Banner - Amélioré */}
          {lowStockCount > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 border border-yellow-500/30 dark:from-yellow-500/10 dark:via-amber-500/10 dark:to-yellow-500/10 dark:border-yellow-500/20 animate-in fade-in slide-in-from-top-4 duration-500 shadow-lg shadow-yellow-500/10 dark:shadow-yellow-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="p-2 rounded-lg bg-yellow-500/30 dark:bg-yellow-500/15 shadow-lg shadow-yellow-500/20 dark:shadow-yellow-500/10">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-yellow-900 dark:text-yellow-200">
                      {lowStockCount} produit(s) en alerte de stock!
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">
                      Vérifiez vos stocks et réapprovisionnez rapidement
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/20 dark:hover:bg-yellow-500/10"
                >
                  Voir les alertes
                </Button>
              </div>
            </div>
          )}

          {/* Search and Filters Section */}
          <div className="mb-6 space-y-4">
            {/* Search Bar - Amélioré */}
            <div className="relative group">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 dark:text-zinc-600 group-focus-within:text-green-500 dark:group-focus-within:text-green-400 transition-colors" />
                <Input
                  type="text"
                  placeholder="Rechercher un produit par nom, SKU ou catégorie..."
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

            {/* Filtres avec badges/chips */}
            <div className="space-y-4">
              {/* Catégories */}
              <div className="flex items-center gap-2 flex-wrap gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <Filter className="h-4 w-4 text-zinc-500 dark:text-zinc-500" />
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Catégories:
                  </span>
                </div>
                {FILTER_CATEGORIES.map((category) => (
                  <Badge
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`cursor-pointer px-4 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                      selectedCategory === category
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg shadow-green-500/20 dark:shadow-green-500/10"
                        : "bg-white/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-green-500/50 dark:hover:border-green-500/30"
                    }`}
                  >
                    {category}
                  </Badge>
                ))}
              </div>

              {/* Filtres rapides - Stock, Marge, Statut */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <Activity className="h-4 w-4 text-zinc-500 dark:text-zinc-500" />
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Filtres:
                  </span>
                </div>
                
                {/* Filtre Stock */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { value: "all", label: "Tous", icon: Package },
                    { value: "low", label: "Stock faible", icon: AlertTriangle },
                    { value: "inStock", label: "En stock", icon: Package },
                    { value: "outOfStock", label: "Rupture", icon: X },
                  ].map(({ value, label, icon: Icon }) => (
                    <Badge
                      key={value}
                      onClick={() => setFilters({ ...filters, stockFilter: value })}
                      className={`cursor-pointer px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1 ${
                        filters.stockFilter === value
                          ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 shadow-lg shadow-yellow-500/20"
                          : "bg-white/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-yellow-500/50"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {label}
                    </Badge>
                  ))}
                </div>

                {/* Filtre Marge */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { value: "all", label: "Toutes", icon: TrendingUp },
                    { value: "high", label: "≥50%", icon: TrendingUp },
                    { value: "medium", label: "20-50%", icon: Activity },
                    { value: "low", label: "<20%", icon: TrendingUp },
                  ].map(({ value, label, icon: Icon }) => (
                    <Badge
                      key={value}
                      onClick={() => setFilters({ ...filters, marginFilter: value })}
                      className={`cursor-pointer px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1 ${
                        filters.marginFilter === value
                          ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0 shadow-lg shadow-blue-500/20"
                          : "bg-white/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {label}
                    </Badge>
                  ))}
                </div>

                {/* Filtre Statut */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { value: "all", label: "Tous", icon: Info },
                    { value: "active", label: "Actif", icon: Activity },
                    { value: "inactive", label: "Inactif", icon: X },
                  ].map(({ value, label, icon: Icon }) => (
                    <Badge
                      key={value}
                      onClick={() => setFilters({ ...filters, statusFilter: value })}
                      className={`cursor-pointer px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1 ${
                        filters.statusFilter === value
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg shadow-green-500/20"
                          : "bg-white/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-green-500/50"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Filtre Prix avec range */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <DollarSign className="h-4 w-4 text-zinc-500 dark:text-zinc-500" />
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Prix:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min (FCFA)"
                    value={filters.priceRange.min}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        priceRange: { ...filters.priceRange, min: e.target.value },
                      })
                    }
                    className="w-32 h-9 text-sm"
                  />
                  <span className="text-zinc-400">-</span>
                  <Input
                    type="number"
                    placeholder="Max (FCFA)"
                    value={filters.priceRange.max}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        priceRange: { ...filters.priceRange, max: e.target.value },
                      })
                    }
                    className="w-32 h-9 text-sm"
                  />
                </div>
              </div>

              {/* Bouton réinitialiser */}
              {(selectedCategory !== "Tous" ||
                filters.stockFilter !== "all" ||
                filters.marginFilter !== "all" ||
                filters.priceRange.min ||
                filters.priceRange.max ||
                filters.statusFilter !== "all" ||
                searchQuery) && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("Tous");
                      setFilters({
                        stockFilter: "all",
                        marginFilter: "all",
                        priceRange: { min: "", max: "" },
                        statusFilter: "all",
                      });
                    }}
                    className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Réinitialiser tous les filtres
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Data Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl">
            <CardContent className="p-16 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 rounded-full bg-green-500/20 blur-2xl animate-pulse"></div>
                <div className="relative p-6 rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5">
                  <Package className="h-16 w-16 text-zinc-400 dark:text-zinc-600" />
                </div>
              </div>
              <p className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Aucun produit trouvé
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-6">
                {searchQuery
                  ? "Essayez de modifier votre recherche ou vos filtres"
                  : "Commencez par ajouter votre premier produit"}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("Tous");
                  }}
                  className="mt-4"
                >
                  <X className="h-4 w-4 mr-2" />
                  Réinitialiser les filtres
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200/80 bg-gradient-to-r from-zinc-50 to-white dark:border-zinc-900/50 dark:from-zinc-950/50 dark:to-zinc-900/30">
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-700 uppercase tracking-wider dark:text-zinc-300">
                        Image
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-700 uppercase tracking-wider dark:text-zinc-300">
                        Produit
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                        Catégorie
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                        Prix Achat
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                        Prix Vente
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                        Marge
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
                    {paginatedProducts.map((product, index) => {
                      const margin = calculateMargin(product);
                      const isLowStock =
                        product.minStock && product.stock <= product.minStock;

                      return (
                        <tr
                          key={product.id}
                          className="group hover:bg-gradient-to-r hover:from-green-500/5 hover:to-emerald-500/5 dark:hover:from-green-500/5 dark:hover:to-emerald-500/5 transition-all duration-300"
                          style={{
                            animationDelay: `${index * 50}ms`,
                          }}
                        >
                          {/* Image */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800">
                              {product.imageUrl && !imageErrors.has(product.id) ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  onError={() => handleImageError(product.id)}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-zinc-400 dark:text-zinc-600" />
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Produit (Nom + SKU) */}
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                {product.name}
                              </div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-500 font-mono mt-1">
                                {product.sku}
                              </div>
                            </div>
                          </td>

                          {/* Catégorie */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
                              {product.category}
                            </Badge>
                          </td>

                          {/* Prix Achat */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                              {formatPrice(product.cost || 0)}
                            </div>
                          </td>

                          {/* Prix Vente */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">
                              {formatPrice(product.price)}
                            </div>
                          </td>

                          {/* Stock */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-bold ${
                                  isLowStock
                                    ? "text-yellow-600 dark:text-yellow-500"
                                    : "text-zinc-700 dark:text-zinc-300"
                                }`}
                              >
                                {product.stock}
                              </span>
                              {isLowStock && (
                                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 animate-pulse" />
                              )}
                            </div>
                            {product.minStock && (
                              <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                                Min: {product.minStock}
                              </div>
                            )}
                          </td>

                          {/* Marge */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">
                              {margin.toFixed(1)}%
                            </div>
                          </td>

                          {/* Statut */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              className={
                                product.isActive
                                  ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30 dark:border-green-500/20 text-xs font-semibold"
                                  : "bg-zinc-500/20 text-zinc-700 dark:text-zinc-400 border-zinc-500/30 dark:border-zinc-500/20 text-xs font-semibold"
                              }
                            >
                              {product.isActive ? "Actif" : "Inactif"}
                            </Badge>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedProduct(product)}
                              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-500/10"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Voir
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalItems > 0 && (
          <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Informations de pagination */}
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Affichage de <span className="font-semibold text-zinc-900 dark:text-zinc-100">{startIndex + 1}</span> à{" "}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {Math.min(endIndex, totalItems)}
                  </span>{" "}
                  sur <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalItems}</span> produit{totalItems > 1 ? "s" : ""}
                </div>

                {/* Contrôles de pagination */}
                <div className="flex items-center gap-2">
                  {/* Bouton Précédent */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>

                  {/* Numéros de page */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => {
                      if (page === "...") {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 text-zinc-400 dark:text-zinc-600"
                          >
                            ...
                          </span>
                        );
                      }

                      const pageNumber = page as number;
                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                          className={
                            currentPage === pageNumber
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg shadow-green-500/20 dark:shadow-green-500/10 min-w-[2.5rem]"
                              : "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 min-w-[2.5rem]"
                          }
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Bouton Suivant */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal de détails produit */}
        {selectedProduct && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSelectedProduct(null)}
          >
            <Card
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <CardContent className="p-0">
                {/* Header du modal */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800">
                      {selectedProduct.imageUrl && !imageErrors.has(selectedProduct.id) ? (
                        <img
                          src={selectedProduct.imageUrl}
                          alt={selectedProduct.name}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(selectedProduct.id)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-zinc-400 dark:text-zinc-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        {selectedProduct.name}
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-500 font-mono mt-1">
                        {selectedProduct.sku}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedProduct(null)}
                    className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Contenu du modal */}
                <div className="p-6 space-y-6">
                  {/* Informations principales */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Catégorie et Statut */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2 block">
                          Catégorie
                        </label>
                        <Badge className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 text-sm font-semibold px-3 py-1.5">
                          {selectedProduct.category}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2 block">
                          Statut
                        </label>
                        <Badge
                          className={
                            selectedProduct.isActive
                              ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30 dark:border-green-500/20 text-sm font-semibold px-3 py-1.5"
                              : "bg-zinc-500/20 text-zinc-700 dark:text-zinc-400 border-zinc-500/30 dark:border-zinc-500/20 text-sm font-semibold px-3 py-1.5"
                          }
                        >
                          {selectedProduct.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2 block">
                          Date de création
                        </label>
                        <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                          <Calendar className="h-4 w-4 text-zinc-400" />
                          {new Date(selectedProduct.createdAt).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2 block">
                          Dernière mise à jour
                        </label>
                        <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                          <Calendar className="h-4 w-4 text-zinc-400" />
                          {new Date(selectedProduct.updatedAt).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prix et Marge */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900/50 dark:to-zinc-900/30 border-zinc-200 dark:border-zinc-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-zinc-500" />
                          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                            Prix d'achat
                          </span>
                        </div>
                        <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                          {formatPrice(selectedProduct.cost || 0)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 border-green-500/20 dark:border-green-500/10">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                            Prix de vente
                          </span>
                        </div>
                        <p className="text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">
                          {formatPrice(selectedProduct.price)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5 border-blue-500/20 dark:border-blue-500/10">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                            Marge
                          </span>
                        </div>
                        <p className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-400">
                          {calculateMargin(selectedProduct).toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Stock */}
                  <Card
                    className={`${
                      selectedProduct.minStock &&
                      selectedProduct.stock <= selectedProduct.minStock
                        ? "bg-gradient-to-br from-yellow-500/10 to-amber-500/10 dark:from-yellow-500/5 dark:to-amber-500/5 border-yellow-500/20 dark:border-yellow-500/10"
                        : "bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900/50 dark:to-zinc-900/30 border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-zinc-500" />
                            <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                              Stock actuel
                            </span>
                            {selectedProduct.minStock &&
                              selectedProduct.stock <= selectedProduct.minStock && (
                                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 animate-pulse" />
                              )}
                          </div>
                          <p
                            className={`text-2xl font-bold ${
                              selectedProduct.minStock &&
                              selectedProduct.stock <= selectedProduct.minStock
                                ? "text-yellow-600 dark:text-yellow-500"
                                : "text-zinc-900 dark:text-zinc-100"
                            }`}
                          >
                            {selectedProduct.stock} unités
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          {selectedProduct.minStock && (
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                              Stock minimum: {selectedProduct.minStock}
                            </div>
                          )}
                          {selectedProduct.maxStock && (
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                              Stock maximum: {selectedProduct.maxStock}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Description */}
                  {selectedProduct.description && (
                    <div>
                      <label className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2 block">
                        Description
                      </label>
                      <Card className="bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900/50 dark:to-zinc-900/30 border-zinc-200 dark:border-zinc-800">
                        <CardContent className="p-4">
                          <p className="text-sm text-zinc-700 dark:text-zinc-300">
                            {selectedProduct.description}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
