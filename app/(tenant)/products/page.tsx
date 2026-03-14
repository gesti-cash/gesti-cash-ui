"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { useTenantId, useSelectedOrganizationId, useSetSelectedOrganizationId } from "@/shared/tenant/store";
import { useOrganizations } from "@/shared/organizations/hooks";
import { useCreateProduct, useProducts, useUpdateProduct, useDeleteProduct, type Product } from "@/shared/products/hooks";
import { useCategories } from "@/shared/categories/hooks";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Activity,
  Filter,
  X,
  Eye,
  Calendar,
  Info,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Tag,
  Hash,
  Banknote,
  Building2,
  Pencil,
  Trash2,
} from "lucide-react";

const createProductSchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  sku: z.string().min(2, "Le SKU doit comporter au moins 2 caractères"),
  price: z.number().positive("Le prix doit être supérieur à 0"),
  category_id: z.string().min(1, "Veuillez sélectionner une catégorie"),
  organization_id: z.string().min(1, "Veuillez sélectionner une organisation"),
});

type CreateProductFormValues = z.infer<typeof createProductSchema>;

const updateProductSchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères").optional(),
  sku: z.string().min(2, "Le SKU doit comporter au moins 2 caractères").optional(),
  price: z.number().positive("Le prix doit être supérieur à 0").optional(),
  category_id: z.string().min(1, "Veuillez sélectionner une catégorie").optional(),
});
type UpdateProductFormValues = z.infer<typeof updateProductSchema>;

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

// Résoudre le nom de catégorie à partir de category_id
const getCategoryName = (
  categoryId: string,
  categories: { id: string; name: string }[]
): string =>
  categories.find((c) => c.id === categoryId)?.name ?? categoryId;

// Formater le prix
const formatPrice = (price: number): string => {
  return `${price.toLocaleString("fr-FR")} FCFA`;
};

const ITEMS_PER_PAGE = 10;

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    stockFilter: "all",
    marginFilter: "all",
    priceRange: { min: "", max: "" },
    statusFilter: "all",
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const tenantId = useTenantId();
  const persistedOrgId = useSelectedOrganizationId(tenantId ?? undefined);
  const setSelectedOrganizationId = useSetSelectedOrganizationId();
  const { data: organizations = [] } = useOrganizations(tenantId);
  const defaultOrg = organizations.find((o) => o.is_default) ?? organizations[0];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      sku: "",
      price: undefined,
      category_id: "",
      organization_id: "",
    },
  });

  // Initialiser avec l'org persistée (si valide) ou l'org par défaut
  useEffect(() => {
    if (!tenantId || organizations.length === 0) return;
    const validPersisted =
      persistedOrgId && organizations.some((o) => o.id === persistedOrgId);
    const initialOrgId = validPersisted ? persistedOrgId : defaultOrg?.id ?? "";
    if (initialOrgId) setValue("organization_id", initialOrgId);
  }, [tenantId, organizations, persistedOrgId, defaultOrg?.id, setValue]);

  const selectedOrgId = watch("organization_id");
  const { data: apiCategories = [], isLoading: categoriesLoading } = useCategories(
    tenantId,
    selectedOrgId || defaultOrg?.id
  );
  const activeCategories = useMemo(
    () => apiCategories.filter((c) => c.is_active),
    [apiCategories]
  );

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm<UpdateProductFormValues>({
    resolver: zodResolver(updateProductSchema),
  });

  useEffect(() => {
    if (editingProduct) {
      resetEdit({
        name: editingProduct.name,
        sku: editingProduct.sku,
        price: editingProduct.price,
        category_id: editingProduct.category_id,
      });
    }
  }, [editingProduct, resetEdit]);

  // Persister la sélection quand l'utilisateur change d'organisation
  useEffect(() => {
    if (tenantId && selectedOrgId) {
      setSelectedOrganizationId(tenantId, selectedOrgId);
    }
  }, [tenantId, selectedOrgId, setSelectedOrganizationId]);

  const createProduct = useCreateProduct(tenantId, selectedOrgId);
  const updateProduct = useUpdateProduct(tenantId, selectedOrgId || undefined);
  const deleteProduct = useDeleteProduct(tenantId, selectedOrgId || undefined);

  const onSubmitCreate = handleSubmit(async (values) => {
    await createProduct.mutateAsync(
      {
        name: values.name,
        sku: values.sku,
        price: values.price,
        category_id: values.category_id,
      },
      {
        onSuccess: () => {
          setCreateSuccess(true);
          reset();
          if (defaultOrg?.id) setValue("organization_id", defaultOrg.id);
          setTimeout(() => {
            setCreateSuccess(false);
            setShowCreateModal(false);
          }, 2000);
        },
      }
    );
  });

  const onSubmitEdit = handleSubmitEdit(async (values) => {
    if (!editingProduct) return;
    const payload: Record<string, unknown> = {};
    if (values.name !== undefined) payload.name = values.name;
    if (values.sku !== undefined) payload.sku = values.sku;
    if (values.price !== undefined) payload.price = values.price;
    if (values.category_id !== undefined) payload.category_id = values.category_id;
    await updateProduct.mutateAsync(
      { id: editingProduct.id, ...payload },
      {
        onSuccess: (updated) => {
          setSelectedProduct(updated);
          setEditingProduct(null);
        },
      }
    );
  });

  const handleDeleteProduct = (product: Product) => {
    if (!window.confirm(`Supprimer le produit « ${product.name} » ? (suppression douce)`)) return;
    deleteProduct.mutate(product.id, {
      onSuccess: () => {
        setSelectedProduct(null);
      },
    });
  };

  const { data: apiProducts = [], isLoading, error } = useProducts(
    tenantId ?? undefined,
    selectedOrgId || undefined,
    { page: 1, limit: 100 }
  );

  // Filtrer les produits par recherche et catégorie (données API)
  const filteredProducts = useMemo(() => {
    let products = apiProducts;

    // Filtre par catégorie (nom résolu depuis category_id)
    if (selectedCategory !== "Tous") {
      const mappedCategories = CATEGORY_MAP[selectedCategory] || [];
      if (mappedCategories.length > 0) {
        products = products.filter((product) =>
          mappedCategories.includes(
            getCategoryName(product.category_id, apiCategories)
          )
        );
      }
    }

    // Filtre de recherche (nom, SKU, catégorie)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query) ||
          getCategoryName(product.category_id, apiCategories)
            .toLowerCase()
            .includes(query)
      );
    }

    // Filtre par prix (API fournit price)
    if (filters.priceRange.min || filters.priceRange.max) {
      products = products.filter((product) => {
        const min = filters.priceRange.min
          ? parseFloat(filters.priceRange.min)
          : 0;
        const max = filters.priceRange.max
          ? parseFloat(filters.priceRange.max)
          : Infinity;
        return product.price >= min && product.price <= max;
      });
    }

    return products;
  }, [apiProducts, apiCategories, searchQuery, selectedCategory, filters.priceRange]);

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

  // Compter les produits en alerte de stock (API ne fournit pas le stock)
  const lowStockCount = 0;

  // Statistiques (à partir des produits API)
  const stats = useMemo(() => {
    const total = apiProducts.length;
    const totalValue = apiProducts.reduce((sum, p) => sum + p.price, 0);
    return {
      total,
      totalValue,
      averageMargin: 0,
      lowStock: lowStockCount,
    };
  }, [apiProducts, lowStockCount]);

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
              onClick={() => setShowCreateModal(true)}
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
                      const categoryName = getCategoryName(
                        product.category_id,
                        apiCategories
                      );
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
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-zinc-400 dark:text-zinc-600" />
                              </div>
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
                              {categoryName}
                            </Badge>
                          </td>

                          {/* Prix Achat (non fourni par l'API) */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-400 dark:text-zinc-500">
                              —
                            </div>
                          </td>

                          {/* Prix Vente */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">
                              {formatPrice(product.price)}
                            </div>
                          </td>

                          {/* Stock (non fourni par l'API) */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-400 dark:text-zinc-500">
                              —
                            </div>
                          </td>

                          {/* Marge (non fournie par l'API) */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-400 dark:text-zinc-500">
                              —
                            </div>
                          </td>

                          {/* Statut (non fourni par l'API) */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-400 dark:text-zinc-500">
                              —
                            </div>
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

        {/* Modal de création de produit (portail pour passer au-dessus du header) */}
        {showCreateModal &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setShowCreateModal(false)}
            >
            <Card
              className="relative w-full max-w-lg bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <CardContent className="p-0">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-600/20">
                      <Package className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        Nouveau Produit
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Renseignez les informations du produit
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCreateModal(false)}
                    className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Succès */}
                {createSuccess && (
                  <div className="mx-6 mt-5 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15 p-4 text-sm text-emerald-800 dark:text-emerald-200">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-semibold">Produit créé avec succès !</span>
                  </div>
                )}

                {/* Erreur API */}
                {createProduct.error && !createSuccess && (
                  <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>
                      {(createProduct.error as { message?: string })?.message ??
                        "Une erreur est survenue lors de la création du produit."}
                    </span>
                  </div>
                )}

                {/* Formulaire */}
                <form onSubmit={onSubmitCreate} className="p-6 space-y-5">
                  {/* Nom */}
                  <div className="space-y-1.5">
                    <Label htmlFor="create-name" className="flex items-center gap-2 text-sm font-medium">
                      <Tag className="h-3.5 w-3.5 text-zinc-400" />
                      Nom du produit <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="create-name"
                      placeholder="ex: iPhone 15 Pro"
                      {...register("name")}
                      className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-green-500 dark:focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  {/* SKU */}
                  <div className="space-y-1.5">
                    <Label htmlFor="create-sku" className="flex items-center gap-2 text-sm font-medium">
                      <Hash className="h-3.5 w-3.5 text-zinc-400" />
                      SKU <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="create-sku"
                      placeholder="ex: IPHONE-15-PRO-128"
                      {...register("sku")}
                      className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-green-500 dark:focus:border-green-500 focus:ring-2 focus:ring-green-500/20 font-mono"
                    />
                    {errors.sku && (
                      <p className="text-xs text-red-500">{errors.sku.message}</p>
                    )}
                  </div>

                  {/* Prix */}
                  <div className="space-y-1.5">
                    <Label htmlFor="create-price" className="flex items-center gap-2 text-sm font-medium">
                      <Banknote className="h-3.5 w-3.5 text-zinc-400" />
                      Prix de vente (FCFA) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="create-price"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="ex: 350000"
                      {...register("price", { valueAsNumber: true })}
                      className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-green-500 dark:focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    />
                    {errors.price && (
                      <p className="text-xs text-red-500">{errors.price.message}</p>
                    )}
                  </div>

                  {/* Catégorie (GET /api/v1/categories) */}
                  <div className="space-y-1.5">
                    <Label htmlFor="create-category" className="flex items-center gap-2 text-sm font-medium">
                      <Filter className="h-3.5 w-3.5 text-zinc-400" />
                      Catégorie <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="create-category"
                      {...register("category_id")}
                      disabled={categoriesLoading}
                      className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/30 focus-visible:ring-offset-2 focus-visible:border-green-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">
                        {categoriesLoading
                          ? "Chargement des catégories..."
                          : activeCategories.length === 0
                            ? "Aucune catégorie (créez-en dans Catégories)"
                            : "Sélectionner une catégorie"}
                      </option>
                      {activeCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.category_id && (
                      <p className="text-xs text-red-500">{errors.category_id.message}</p>
                    )}
                  </div>

                  {/* Organisation */}
                  {organizations.length > 0 && (
                    <div className="space-y-1.5">
                      <Label htmlFor="create-org" className="flex items-center gap-2 text-sm font-medium">
                        <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                        Organisation <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="create-org"
                        {...register("organization_id")}
                        className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/30 focus-visible:ring-offset-2 focus-visible:border-green-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Sélectionner une organisation</option>
                        {organizations.map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name}
                            {org.is_default ? " (par défaut)" : ""}
                          </option>
                        ))}
                      </select>
                      {errors.organization_id && (
                        <p className="text-xs text-red-500">
                          {errors.organization_id.message}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 border-zinc-200 dark:border-zinc-800"
                      disabled={createProduct.isPending}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20 font-semibold"
                      disabled={createProduct.isPending || createSuccess}
                    >
                      {createProduct.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Création...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Créer le produit
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

        {/* Modal de détails produit (portail pour passer au-dessus du header) */}
        {selectedProduct &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => {
                setEditingProduct(null);
                setSelectedProduct(null);
              }}
            >
            <Card
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <CardContent className="p-0">
                {/* Header du modal */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                      <Package className="h-8 w-8 text-zinc-400 dark:text-zinc-600" />
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
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProduct(selectedProduct)}
                      className="border-zinc-200 dark:border-zinc-800"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProduct(selectedProduct)}
                      disabled={deleteProduct.isPending}
                      className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50"
                    >
                      {deleteProduct.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-1" />
                      )}
                      Supprimer
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingProduct(null);
                        setSelectedProduct(null);
                      }}
                      className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Contenu du modal (données API) */}
                <div className="p-6 space-y-6">
                  {/* Informations principales */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2 block">
                          Catégorie
                        </label>
                        <Badge className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 text-sm font-semibold px-3 py-1.5">
                          {getCategoryName(selectedProduct.category_id, apiCategories)}
                        </Badge>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-4">
                      {selectedProduct.created_at && (
                        <div>
                          <label className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2 block">
                            Date de création
                          </label>
                          <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                            <Calendar className="h-4 w-4 text-zinc-400" />
                            {new Date(selectedProduct.created_at).toLocaleDateString("fr-FR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      )}
                      {selectedProduct.updated_at && (
                        <div>
                          <label className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2 block">
                            Dernière mise à jour
                          </label>
                          <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                            <Calendar className="h-4 w-4 text-zinc-400" />
                            {new Date(selectedProduct.updated_at).toLocaleDateString("fr-FR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Prix de vente */}
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

                  {/* Formulaire d'édition */}
                  {editingProduct?.id === selectedProduct.id && (
                    <Card className="border-green-500/30 dark:border-green-500/20">
                      <CardContent className="p-4">
                        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
                          Modifier le produit
                        </h3>
                        <form onSubmit={onSubmitEdit} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium">Nom</Label>
                              <Input
                                {...registerEdit("name")}
                                className="h-9"
                              />
                              {errorsEdit.name && (
                                <p className="text-xs text-red-500">{errorsEdit.name.message}</p>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium">SKU</Label>
                              <Input
                                {...registerEdit("sku")}
                                className="h-9 font-mono"
                              />
                              {errorsEdit.sku && (
                                <p className="text-xs text-red-500">{errorsEdit.sku.message}</p>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium">Prix (FCFA)</Label>
                              <Input
                                type="number"
                                min="0"
                                {...registerEdit("price", { valueAsNumber: true })}
                                className="h-9"
                              />
                              {errorsEdit.price && (
                                <p className="text-xs text-red-500">{errorsEdit.price.message}</p>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium">Catégorie</Label>
                              <select
                                {...registerEdit("category_id")}
                                disabled={categoriesLoading}
                                className="flex h-9 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <option value="">
                                  {categoriesLoading ? "Chargement des catégories..." : "Sélectionner une catégorie"}
                                </option>
                                {activeCategories.map((cat) => (
                                  <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                  </option>
                                ))}
                              </select>
                              {errorsEdit.category_id && (
                                <p className="text-xs text-red-500">{errorsEdit.category_id.message}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingProduct(null)}
                              className="border-zinc-200 dark:border-zinc-800"
                            >
                              Annuler
                            </Button>
                            <Button
                              type="submit"
                              size="sm"
                              disabled={updateProduct.isPending}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                            >
                              {updateProduct.isPending ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : null}
                              Enregistrer
                            </Button>
                          </div>
                          {updateProduct.error && (
                            <p className="text-xs text-red-500">
                              {(updateProduct.error as { message?: string })?.message ?? "Erreur lors de la mise à jour"}
                            </p>
                          )}
                        </form>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}
