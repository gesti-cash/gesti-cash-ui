"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useTenantId,
  useSelectedOrganizationId,
  useSetSelectedOrganizationId,
} from "@/shared/tenant/store";
import { useOrganizations } from "@/shared/organizations/hooks";
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from "@/shared/suppliers/hooks";
import type { Supplier } from "@/shared/suppliers/hooks";
import { extractApiError } from "@/shared/api/axios";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Truck,
  Plus,
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Phone,
  MapPin,
  Building2,
  ExternalLink,
  Pencil,
  Trash2,
} from "lucide-react";

const createSupplierSchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  phone: z.string().min(1, "Le téléphone est requis"),
  address: z.string().optional(),
  organization_id: z.string().min(1, "Veuillez sélectionner une organisation"),
});

type CreateSupplierFormValues = z.infer<typeof createSupplierSchema>;

const updateSupplierSchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères").optional(),
  phone: z.string().min(1, "Le téléphone est requis").optional(),
  address: z.string().optional(),
  organization_id: z.string().optional(),
});

type UpdateSupplierFormValues = z.infer<typeof updateSupplierSchema>;

export default function SuppliersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
  } = useForm<CreateSupplierFormValues>({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      organization_id: "",
    },
  });

  useEffect(() => {
    if (!tenantId || organizations.length === 0) return;
    const validPersisted =
      persistedOrgId && organizations.some((o) => o.id === persistedOrgId);
    const initialOrgId = validPersisted ? persistedOrgId : defaultOrg?.id ?? "";
    if (initialOrgId) setValue("organization_id", initialOrgId);
  }, [tenantId, organizations, persistedOrgId, defaultOrg?.id, setValue]);

  const selectedOrgId = watch("organization_id") || persistedOrgId || defaultOrg?.id;

  useEffect(() => {
    if (tenantId && selectedOrgId) {
      setSelectedOrganizationId(tenantId, selectedOrgId);
    }
  }, [tenantId, selectedOrgId, setSelectedOrganizationId]);

  const { data: suppliers = [], isLoading, error } = useSuppliers(
    tenantId,
    selectedOrgId || undefined
  );

  const updateForm = useForm<UpdateSupplierFormValues>({
    resolver: zodResolver(updateSupplierSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      organization_id: "",
    },
  });

  const createSupplier = useCreateSupplier(tenantId, selectedOrgId || undefined);
  const updateSupplier = useUpdateSupplier(tenantId, selectedOrgId || undefined);
  const deleteSupplier = useDeleteSupplier(tenantId, selectedOrgId || undefined);

  const onSubmitCreate = handleSubmit(async (values) => {
    await createSupplier.mutateAsync(
      {
        name: values.name,
        phone: values.phone,
        address: values.address || undefined,
        organization_id: values.organization_id,
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

  const onSubmitUpdate = updateForm.handleSubmit(async (values) => {
    if (!editingSupplier) return;
    await updateSupplier.mutateAsync(
      {
        id: editingSupplier.id,
        ...(values.name && { name: values.name }),
        ...(values.phone !== undefined && { phone: values.phone }),
        ...(values.address !== undefined && { address: values.address }),
        ...(values.organization_id && { organization_id: values.organization_id }),
      },
      {
        onSuccess: () => {
          setEditingSupplier(null);
        },
      }
    );
  });

  const handleDelete = async (supplier: Supplier) => {
    if (!confirm(`Supprimer le fournisseur « ${supplier.name} » ?`)) return;
    setDeletingId(supplier.id);
    await deleteSupplier.mutateAsync(supplier.id, {
      onSettled: () => setDeletingId(null),
      onSuccess: () => setSelectedSupplier(null),
    });
  };

  useEffect(() => {
    if (editingSupplier) {
      updateForm.reset({
        name: editingSupplier.name,
        phone: editingSupplier.phone ?? "",
        address: editingSupplier.address ?? "",
        organization_id: editingSupplier.organization_id ?? "",
      });
    }
  }, [editingSupplier, updateForm]);

  const canSubmitCreate =
    !!selectedOrgId &&
    !!tenantId &&
    !createSupplier.isPending &&
    !createSuccess;
  const showNoOrgMessage = organizations.length === 0 || !selectedOrgId;

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone && s.phone.includes(searchQuery))
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 dark:from-black dark:via-zinc-950 dark:to-black">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-orange-500/20 border-t-orange-500 mx-auto" />
          </div>
          <p className="text-lg font-semibold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
            Chargement des fournisseurs...
          </p>
        </div>
      </div>
    );
  }

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
                  : "Une erreur est survenue lors du chargement des fournisseurs"}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500/30 to-amber-600/30 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-600/20 p-3 shadow-2xl shadow-orange-500/20 ring-2 ring-orange-500/20 group-hover:scale-105 transition-transform duration-300">
                  <Truck className="h-full w-full text-orange-400 dark:text-orange-500" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent mb-2 tracking-tight">
                  Fournisseurs
                </h1>
                <p className="text-zinc-500 text-sm lg:text-base dark:text-zinc-400 font-medium">
                  Gérez vos fournisseurs
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg shadow-orange-500/20 px-6 py-2.5 font-semibold transition-all duration-200 hover:scale-105 group"
            >
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Nouveau fournisseur
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-orange-500/40 transition-all duration-500 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                    <Truck className="h-4 w-4 text-orange-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent mb-1">
                  {suppliers.length}
                </div>
                <p className="text-xs text-zinc-500 font-medium">
                  Fournisseurs au total
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="relative group mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
            <Input
              type="text"
              placeholder="Rechercher par nom ou téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 h-14 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-zinc-200/80 dark:border-zinc-800/80 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-base shadow-lg transition-all duration-300"
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

        {filtered.length === 0 ? (
          <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl">
            <CardContent className="p-16 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-2xl animate-pulse" />
                <div className="relative p-6 rounded-full bg-gradient-to-br from-orange-500/10 to-amber-500/10">
                  <Truck className="h-16 w-16 text-zinc-400 dark:text-zinc-600" />
                </div>
              </div>
              <p className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Aucun fournisseur trouvé
              </p>
              <p className="text-sm text-zinc-500 mb-6">
                {searchQuery
                  ? "Essayez de modifier votre recherche"
                  : "Aucun fournisseur enregistré pour cette organisation."}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau fournisseur
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
                        Téléphone
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                        Adresse
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-900/50">
                    {filtered.map((supplier) => (
                      <tr
                        key={supplier.id}
                        className="group hover:bg-gradient-to-r hover:from-orange-500/5 hover:to-amber-500/5 transition-all duration-300"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-orange-500/15">
                              <Truck className="h-3.5 w-3.5 text-orange-500" />
                            </div>
                            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                              {supplier.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {supplier.phone ? (
                            <span className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                              <Phone className="h-3.5 w-3.5 text-zinc-400" />
                              {supplier.phone}
                            </span>
                          ) : (
                            <span className="text-sm text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {supplier.address ? (
                            <span className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400 max-w-[200px] truncate">
                              <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                              {supplier.address}
                            </span>
                          ) : (
                            <span className="text-sm text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSupplier(supplier)}
                            className="text-orange-600 hover:text-orange-700 dark:text-orange-400 hover:bg-orange-500/10"
                          >
                            Voir
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingSupplier(supplier)}
                            className="text-zinc-600 hover:text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(supplier)}
                            disabled={deletingId === supplier.id}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-500/10"
                          >
                            {deletingId === supplier.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal détail fournisseur */}
        {selectedSupplier &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setSelectedSupplier(null)}
            >
              <Card
                className="relative w-full max-w-lg bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/20">
                        <Truck className="h-5 w-5 text-orange-500" />
                      </div>
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {selectedSupplier.name}
                      </h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedSupplier(null)}
                      className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="p-6 space-y-4">
                    <DetailRow
                      label="Téléphone"
                      value={selectedSupplier.phone || "—"}
                    />
                    <DetailRow
                      label="Adresse"
                      value={selectedSupplier.address || "—"}
                    />
                    <DetailRow
                      label="Organisation"
                      value={
                        organizations.find(
                          (o) => o.id === selectedSupplier.organization_id
                        )?.name ?? selectedSupplier.organization_id
                      }
                    />
                    {selectedSupplier.created_at && (
                      <DetailRow
                        label="Créé le"
                        value={new Date(
                          selectedSupplier.created_at
                        ).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      />
                    )}
                  </div>
                  <div className="px-6 pb-6 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setEditingSupplier(selectedSupplier);
                        setSelectedSupplier(null);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/50"
                      onClick={() => handleDelete(selectedSupplier)}
                      disabled={deletingId === selectedSupplier.id}
                    >
                      {deletingId === selectedSupplier.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>,
            document.body
          )}

        {/* Modal création fournisseur */}
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
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/20">
                        <Truck className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          Nouveau fournisseur
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Nom, téléphone et organisation
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

                  {createSuccess && (
                    <div className="mx-6 mt-5 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-200">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                      <span className="font-semibold">
                        Fournisseur créé avec succès !
                      </span>
                    </div>
                  )}

                  {createSupplier.error && !createSuccess && (
                    <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
                      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                      <span>
                        {extractApiError(createSupplier.error).message}
                      </span>
                    </div>
                  )}

                  {showNoOrgMessage && !createSupplier.error && (
                    <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
                      <Building2 className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">
                          {organizations.length === 0
                            ? "Aucune organisation disponible"
                            : "Sélectionnez une organisation"}
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

                  <form onSubmit={onSubmitCreate} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="sup-name" className="flex items-center gap-2 text-sm font-medium">
                        Nom <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="sup-name"
                        placeholder="ex: Fournisseur SA"
                        {...register("name")}
                        className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="sup-phone" className="flex items-center gap-2 text-sm font-medium">
                        <Phone className="h-3.5 w-3.5 text-zinc-400" />
                        Téléphone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="sup-phone"
                        placeholder="ex: +225 07 00 00 00 00"
                        {...register("phone")}
                        className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-500">{errors.phone.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="sup-address" className="flex items-center gap-2 text-sm font-medium">
                        <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                        Adresse
                      </Label>
                      <Input
                        id="sup-address"
                        placeholder="ex: Abidjan, Cocody"
                        {...register("address")}
                        className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>

                    {organizations.length > 0 && (
                      <div className="space-y-1.5">
                        <Label htmlFor="sup-org" className="flex items-center gap-2 text-sm font-medium">
                          <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                          Organisation <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="sup-org"
                          {...register("organization_id")}
                          className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:border-orange-500/50"
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

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 border-zinc-200 dark:border-zinc-800"
                        disabled={createSupplier.isPending}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg shadow-orange-500/20 font-semibold"
                        disabled={!canSubmitCreate}
                      >
                        {createSupplier.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Création...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Créer le fournisseur
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

        {/* Modal modification fournisseur */}
        {editingSupplier &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setEditingSupplier(null)}
            >
              <Card
                className="relative w-full max-w-lg bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-t-xl">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      Modifier le fournisseur
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingSupplier(null)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  {updateSupplier.error && (
                    <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
                      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                      <span>
                        {extractApiError(updateSupplier.error).message}
                      </span>
                    </div>
                  )}
                  <form onSubmit={onSubmitUpdate} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                      <Label>Nom</Label>
                      <Input
                        {...updateForm.register("name")}
                        className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                      />
                      {updateForm.formState.errors.name && (
                        <p className="text-xs text-red-500">
                          {updateForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Téléphone</Label>
                      <Input
                        {...updateForm.register("phone")}
                        className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                      />
                      {updateForm.formState.errors.phone && (
                        <p className="text-xs text-red-500">
                          {updateForm.formState.errors.phone.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Adresse</Label>
                      <Input
                        {...updateForm.register("address")}
                        className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                      />
                    </div>
                    {organizations.length > 0 && (
                      <div className="space-y-1.5">
                        <Label>Organisation</Label>
                        <select
                          {...updateForm.register("organization_id")}
                          className="flex h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
                        >
                          <option value="">—</option>
                          {organizations.map((org) => (
                            <option key={org.id} value={org.id}>
                              {org.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingSupplier(null)}
                        className="flex-1"
                        disabled={updateSupplier.isPending}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white"
                        disabled={updateSupplier.isPending}
                      >
                        {updateSupplier.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        Enregistrer
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

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
      <span className="text-sm font-semibold text-zinc-500">{label}</span>
      <span className="text-sm text-zinc-800 dark:text-zinc-200">{value}</span>
    </div>
  );
}
