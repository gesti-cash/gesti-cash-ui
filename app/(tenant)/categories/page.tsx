"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
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
import { useCategories, useCreateCategory } from "@/shared/categories/hooks";
import { extractApiError } from "@/shared/api/axios";
import type { Category } from "@/shared/categories/hooks";
import {
  FolderOpen,
  Plus,
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Tag,
  Activity,
  Building2,
  Hash,
  AlignLeft,
  ToggleRight,
  ChevronRight,
  Layers,
  ExternalLink,
} from "lucide-react";

// ─── Schéma de validation ───────────────────────────────────────────────────

const createCategorySchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  slug: z
    .string()
    .min(2, "Le slug doit comporter au moins 2 caractères")
    .regex(
      /^[a-z0-9-]+$/,
      "Seulement des lettres minuscules, chiffres et tirets"
    ),
  description: z.string().optional(),
  parent_id: z.string().optional(),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean(),
  organization_id: z.string().min(1, "Veuillez sélectionner une organisation"),
});

type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

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
  } = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parent_id: "",
      sort_order: 0,
      is_active: true,
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

  // Auto-générer le slug depuis le nom
  const nameValue = watch("name");
  useEffect(() => {
    setValue("slug", slugify(nameValue ?? ""));
  }, [nameValue, setValue]);

  const selectedOrgId = watch("organization_id");

  // Persister la sélection quand l'utilisateur change d'organisation
  useEffect(() => {
    if (tenantId && selectedOrgId) {
      setSelectedOrganizationId(tenantId, selectedOrgId);
    }
  }, [tenantId, selectedOrgId, setSelectedOrganizationId]);

  const { data: categories = [], isLoading, error } = useCategories(
    tenantId,
    selectedOrgId || defaultOrg?.id
  );

  const createCategory = useCreateCategory(tenantId, selectedOrgId);

  const onSubmitCreate = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      slug: values.slug,
      description: values.description || undefined,
      parent_id: values.parent_id || undefined,
      sort_order: values.sort_order ?? 0,
      is_active: Boolean(values.is_active),
    };

    await createCategory.mutateAsync(payload, {
      onSuccess: () => {
        setCreateSuccess(true);
        reset();
        if (defaultOrg?.id) setValue("organization_id", defaultOrg.id);
        setTimeout(() => {
          setCreateSuccess(false);
          setShowCreateModal(false);
        }, 2000);
      },
    });
  });

  const canSubmitCategory =
    !!selectedOrgId && !!tenantId && !createCategory.isPending && !createSuccess;
  const showNoOrgMessage = organizations.length === 0 || !selectedOrgId;

  // Filtre de recherche
  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Séparer catégories parentes et enfants
  const rootCategories = filtered.filter((c) => !c.parent_id);
  const childCategories = filtered.filter((c) => !!c.parent_id);

  const getChildren = (parentId: string) =>
    childCategories.filter((c) => c.parent_id === parentId);

  // ─── Chargement ────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 dark:from-black dark:via-zinc-950 dark:to-black">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-500 mx-auto" />
            <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-2 border-violet-500/30" />
          </div>
          <p className="text-lg font-semibold bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
            Chargement des catégories...
          </p>
        </div>
      </div>
    );
  }

  // ─── Erreur ─────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full border-red-200/80 dark:border-red-900/50 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="p-4 rounded-full bg-red-500/10 inline-block mb-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Erreur de chargement
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                {error instanceof Error
                  ? error.message
                  : "Une erreur est survenue lors du chargement des catégories"}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
              >
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Rendu principal ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black p-6 lg:p-8 relative overflow-hidden">
      {/* Décors de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* En-tête */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-600/30 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 p-3 shadow-2xl shadow-violet-500/20 ring-2 ring-violet-500/20 group-hover:scale-105 transition-transform duration-300">
                  <FolderOpen className="h-full w-full text-violet-400 dark:text-violet-500" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-violet-500 bg-clip-text text-transparent mb-2 tracking-tight">
                  Catégories
                </h1>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-violet-500 animate-pulse" />
                  <p className="text-zinc-500 text-sm lg:text-base dark:text-zinc-400 font-medium">
                    Organisez vos produits par catégories
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/20 px-6 py-2.5 font-semibold transition-all duration-200 hover:scale-105 group"
            >
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Nouvelle Catégorie
            </Button>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-violet-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                    <FolderOpen className="h-4 w-4 text-violet-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent mb-1">
                  {categories.length}
                </div>
                <p className="text-xs text-zinc-500 font-medium">
                  Catégories totales
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-purple-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-violet-500/20">
                    <Layers className="h-4 w-4 text-purple-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-violet-500 bg-clip-text text-transparent mb-1">
                  {rootCategories.length}
                </div>
                <p className="text-xs text-zinc-500 font-medium">
                  Catégories parentes
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-green-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                    <ToggleRight className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-1">
                  {categories.filter((c) => c.is_active).length}
                </div>
                <p className="text-xs text-zinc-500 font-medium">
                  Actives
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Barre de recherche */}
          <div className="relative group mb-6">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-violet-500 transition-colors" />
              <Input
                type="text"
                placeholder="Rechercher une catégorie par nom ou slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 h-14 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-zinc-200/80 dark:border-zinc-800/80 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-base shadow-lg transition-all duration-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="h-4 w-4 text-zinc-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tableau / liste */}
        {filtered.length === 0 ? (
          <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl">
            <CardContent className="p-16 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-2xl animate-pulse" />
                <div className="relative p-6 rounded-full bg-gradient-to-br from-violet-500/10 to-purple-500/10">
                  <FolderOpen className="h-16 w-16 text-zinc-400 dark:text-zinc-600" />
                </div>
              </div>
              <p className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Aucune catégorie trouvée
              </p>
              <p className="text-sm text-zinc-500 mb-6">
                {searchQuery
                  ? "Essayez de modifier votre recherche"
                  : "Commencez par créer votre première catégorie"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Catégorie
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
                        Nom
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                        Slug
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                        Parent
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                        Ordre
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
                    {rootCategories.map((category, index) => {
                      const children = getChildren(category.id);
                      return (
                        <React.Fragment key={category.id}>
                          <CategoryRow
                            category={category}
                            index={index}
                            onSelect={setSelectedCategory}
                            isRoot
                          />
                          {children.map((child, ci) => (
                            <CategoryRow
                              key={child.id}
                              category={child}
                              index={ci}
                              onSelect={setSelectedCategory}
                              isRoot={false}
                            />
                          ))}
                        </React.Fragment>
                      );
                    })}
                    {/* Orphelins (parent inconnu dans la liste filtrée) */}
                    {childCategories
                      .filter(
                        (c) => !rootCategories.find((r) => r.id === c.parent_id)
                      )
                      .map((cat, i) => (
                        <CategoryRow
                          key={cat.id}
                          category={cat}
                          index={i}
                          onSelect={setSelectedCategory}
                          isRoot={false}
                        />
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal détail (portail pour passer au-dessus du header) */}
        {selectedCategory &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setSelectedCategory(null)}
            >
            <Card
              className="relative w-full max-w-lg bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <CardContent className="p-0">
                <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-500/20">
                      <FolderOpen className="h-5 w-5 text-violet-500" />
                    </div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {selectedCategory.name}
                    </h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedCategory(null)}
                    className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="p-6 space-y-4">
                  <DetailRow label="Slug" value={selectedCategory.slug} mono />
                  {selectedCategory.description && (
                    <DetailRow
                      label="Description"
                      value={selectedCategory.description}
                    />
                  )}
                  <DetailRow
                    label="Ordre de tri"
                    value={String(selectedCategory.sort_order ?? 0)}
                  />
                  <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-sm font-semibold text-zinc-500">
                      Statut
                    </span>
                    <Badge
                      className={
                        selectedCategory.is_active
                          ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30"
                          : "bg-zinc-500/20 text-zinc-700 dark:text-zinc-400 border-zinc-500/30"
                      }
                    >
                      {selectedCategory.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {selectedCategory.created_at && (
                    <DetailRow
                      label="Créée le"
                      value={new Date(
                        selectedCategory.created_at
                      ).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>,
          document.body
        )}

        {/* Modal de création (portail pour passer au-dessus du header) */}
        {showCreateModal &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setShowCreateModal(false)}
            >
            <Card
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <CardContent className="p-0">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-500/20">
                      <FolderOpen className="h-5 w-5 text-violet-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        Nouvelle Catégorie
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Renseignez les informations de la catégorie
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
                  <div className="mx-6 mt-5 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-200">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    <span className="font-semibold">
                      Catégorie créée avec succès !
                    </span>
                  </div>
                )}

                {/* Erreur */}
                {createCategory.error && !createSuccess && (
                  <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>
                      {extractApiError(createCategory.error).message}
                    </span>
                  </div>
                )}

                {/* Message : aucune organisation */}
                {showNoOrgMessage && !createCategory.error && (
                  <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
                    <Building2 className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">
                        {organizations.length === 0
                          ? "Aucune organisation disponible"
                          : "Sélectionnez une organisation"}
                      </p>
                      <p className="mt-1 text-xs opacity-90">
                        {organizations.length === 0
                          ? "Créez ou sélectionnez une organisation pour pouvoir créer des catégories."
                          : "Choisissez l'organisation dans la liste ci-dessous."}
                      </p>
                      {organizations.length === 0 && (
                        <Link
                          href="/organizations/select"
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Aller à la page Organisations
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Formulaire */}
                <form onSubmit={onSubmitCreate} className="p-6 space-y-5">
                  {/* Nom */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="cat-name"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <Tag className="h-3.5 w-3.5 text-zinc-400" />
                      Nom <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="cat-name"
                      placeholder="ex: Électronique"
                      {...register("name")}
                      className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Slug */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="cat-slug"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <Hash className="h-3.5 w-3.5 text-zinc-400" />
                      Slug <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="cat-slug"
                      placeholder="ex: electronique"
                      {...register("slug")}
                      className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 font-mono"
                    />
                    {errors.slug && (
                      <p className="text-xs text-red-500">{errors.slug.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="cat-desc"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <AlignLeft className="h-3.5 w-3.5 text-zinc-400" />
                      Description
                    </Label>
                    <textarea
                      id="cat-desc"
                      rows={3}
                      placeholder="Description optionnelle..."
                      {...register("description")}
                      className="flex w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 focus-visible:border-violet-500/50 resize-none"
                    />
                  </div>

                  {/* Catégorie parente */}
                  {categories.filter((c) => !c.parent_id).length > 0 && (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="cat-parent"
                        className="flex items-center gap-2 text-sm font-medium"
                      >
                        <Layers className="h-3.5 w-3.5 text-zinc-400" />
                        Catégorie parente
                      </Label>
                      <select
                        id="cat-parent"
                        {...register("parent_id")}
                        className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 focus-visible:border-violet-500/50"
                      >
                        <option value="">Aucune (catégorie racine)</option>
                        {categories
                          .filter((c) => !c.parent_id)
                          .map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  {/* Ordre de tri */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="cat-order"
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                      Ordre de tri
                    </Label>
                    <Input
                      id="cat-order"
                      type="number"
                      min="0"
                      placeholder="0"
                      {...register("sort_order", { valueAsNumber: true })}
                      className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>

                  {/* Statut actif */}
                  <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-2">
                      <ToggleRight className="h-4 w-4 text-zinc-500" />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Catégorie active
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      {...register("is_active")}
                      defaultChecked
                      className="h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                    />
                  </div>

                  {/* Organisation */}
                  {organizations.length > 0 && (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="cat-org"
                        className="flex items-center gap-2 text-sm font-medium"
                      >
                        <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                        Organisation <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="cat-org"
                        {...register("organization_id")}
                        className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 focus-visible:border-violet-500/50"
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
                      disabled={createCategory.isPending}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/20 font-semibold"
                      disabled={!canSubmitCategory}
                    >
                      {createCategory.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Création...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Créer la catégorie
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
      </div>
    </div>
  );
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function CategoryRow({
  category,
  index,
  onSelect,
  isRoot,
}: {
  category: Category;
  index: number;
  onSelect: (c: Category) => void;
  isRoot: boolean;
}) {
  return (
    <tr
      className="group hover:bg-gradient-to-r hover:from-violet-500/5 hover:to-purple-500/5 transition-all duration-300"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Nom */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {!isRoot && (
            <ChevronRight className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          )}
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-md ${
                isRoot
                  ? "bg-violet-500/15"
                  : "bg-purple-500/10"
              }`}
            >
              <FolderOpen
                className={`h-3.5 w-3.5 ${
                  isRoot ? "text-violet-500" : "text-purple-400"
                }`}
              />
            </div>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              {category.name}
            </span>
          </div>
        </div>
      </td>

      {/* Slug */}
      <td className="px-6 py-4">
        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
          {category.slug}
        </span>
      </td>

      {/* Description */}
      <td className="px-6 py-4">
        <span className="text-sm text-zinc-500 dark:text-zinc-400 truncate max-w-[200px] block">
          {category.description || "—"}
        </span>
      </td>

      {/* Parent */}
      <td className="px-6 py-4">
        {category.parent_id ? (
          <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20 text-xs">
            Sous-catégorie
          </Badge>
        ) : (
          <Badge className="bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20 text-xs">
            Racine
          </Badge>
        )}
      </td>

      {/* Ordre */}
      <td className="px-6 py-4">
        <span className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">
          {category.sort_order ?? 0}
        </span>
      </td>

      {/* Statut */}
      <td className="px-6 py-4">
        <Badge
          className={
            category.is_active
              ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30 text-xs font-semibold"
              : "bg-zinc-500/20 text-zinc-700 dark:text-zinc-400 border-zinc-500/30 text-xs font-semibold"
          }
        >
          {category.is_active ? "Active" : "Inactive"}
        </Badge>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelect(category)}
          className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 hover:bg-violet-500/10"
        >
          Voir
        </Button>
      </td>
    </tr>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
      <span className="text-sm font-semibold text-zinc-500">{label}</span>
      <span
        className={`text-sm text-zinc-800 dark:text-zinc-200 ${
          mono ? "font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
