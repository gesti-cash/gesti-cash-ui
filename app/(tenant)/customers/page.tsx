"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { phoneSchema, phoneSchemaOptional, formatPhoneDisplay } from "@/shared/constants";
import { PhoneInput } from "@/shared/ui/phone-input";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { SearchableSelect } from "@/shared/ui/searchable-select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  useTenantId,
  useSelectedOrganizationId,
  useSetSelectedOrganizationId,
} from "@/shared/tenant/store";
import { useOrganizations } from "@/shared/organizations/hooks";
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "@/shared/customers/hooks";
import { extractApiError } from "@/shared/api/axios";
import type { Customer } from "@/shared/customers/hooks";
import {
  Users,
  Plus,
  Search,
  X,
  Eye,
  MoreVertical,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Phone,
  Building2,
  ExternalLink,
  Pencil,
  Trash2,
} from "lucide-react";

// ─── Schémas de validation ───────────────────────────────────────────────────

const createCustomerSchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  phone: phoneSchema,
  organization_id: z
    .string()
    .min(1, "Veuillez sélectionner une organisation"),
});

const updateCustomerSchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères").optional(),
  phone: phoneSchemaOptional,
  organization_id: z.string().optional(),
});

type CreateCustomerFormValues = z.infer<typeof createCustomerSchema>;
type UpdateCustomerFormValues = z.infer<typeof updateCustomerSchema>;

// ─── Composant principal ──────────────────────────────────────────────────────

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const tenantId = useTenantId();
  const persistedOrgId = useSelectedOrganizationId(tenantId ?? undefined);
  const setSelectedOrganizationId = useSetSelectedOrganizationId();
  const { data: organizations = [] } = useOrganizations(tenantId);
  const defaultOrg =
    organizations.find((o) => o.is_default) ?? organizations[0];

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCustomerFormValues>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: "",
      phone: "",
      organization_id: "",
    },
  });

  const updateForm = useForm<UpdateCustomerFormValues>({
    resolver: zodResolver(updateCustomerSchema),
    defaultValues: {
      name: "",
      phone: "",
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

  const selectedOrgId = watch("organization_id");

  useEffect(() => {
    if (tenantId && selectedOrgId) {
      setSelectedOrganizationId(tenantId, selectedOrgId);
    }
  }, [tenantId, selectedOrgId, setSelectedOrganizationId]);

  const organizationOptions = React.useMemo(
    () =>
      organizations.map((org) => ({
        value: org.id,
        label: `${org.name}${org.is_default ? " (par défaut)" : ""}`,
      })),
    [organizations]
  );

  const { data: customers = [], isLoading, error } = useCustomers(
    tenantId,
    selectedOrgId || defaultOrg?.id
  );

  const createCustomer = useCreateCustomer(tenantId, selectedOrgId);
  const updateCustomer = useUpdateCustomer(tenantId, selectedOrgId);
  const deleteCustomer = useDeleteCustomer(tenantId, selectedOrgId);

  const onSubmitCreate = handleSubmit(async (values) => {
    await createCustomer.mutateAsync(
      {
        name: values.name,
        phone: values.phone,
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
    if (!editingCustomer) return;
    await updateCustomer.mutateAsync(
      {
        id: editingCustomer.id,
        ...(values.name && { name: values.name }),
        ...(values.phone !== undefined && { phone: values.phone }),
        ...(values.organization_id && {
          organization_id: values.organization_id,
        }),
      },
      {
        onSuccess: () => {
          setEditingCustomer(null);
        },
      }
    );
  });

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`Supprimer le client « ${customer.name} » ?`)) return;
    setDeletingId(customer.id);
    await deleteCustomer.mutateAsync(customer.id, {
      onSettled: () => setDeletingId(null),
      onSuccess: () => setSelectedCustomer(null),
    });
  };

  useEffect(() => {
    if (editingCustomer) {
      updateForm.reset({
        name: editingCustomer.name,
        phone: editingCustomer.phone,
        organization_id: editingCustomer.organization_id,
      });
    }
  }, [editingCustomer, updateForm]);

  const canSubmitCreate =
    !!selectedOrgId &&
    !!tenantId &&
    !createCustomer.isPending &&
    !createSuccess;
  const showNoOrgMessage = organizations.length === 0 || !selectedOrgId;

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery))
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 dark:from-black dark:via-zinc-950 dark:to-black">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500 mx-auto" />
          </div>
          <p className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            Chargement des clients...
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
                  : "Une erreur est survenue lors du chargement des clients"}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-600/30 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 p-3 shadow-2xl shadow-emerald-500/20 ring-2 ring-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                  <Users className="h-full w-full text-emerald-400 dark:text-emerald-500" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent mb-2 tracking-tight">
                  Clients
                </h1>
                <p className="text-zinc-500 text-sm lg:text-base dark:text-zinc-400 font-medium">
                  Gérez vos clients
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 px-6 py-2.5 font-semibold transition-all duration-200 hover:scale-105 group"
            >
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Nouveau client
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-emerald-500/40 transition-all duration-500 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                    <Users className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent mb-1">
                  {customers.length}
                </div>
                <p className="text-xs text-zinc-500 font-medium">
                  Clients au total
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="relative group mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              type="text"
              placeholder="Rechercher par nom ou téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 h-14 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-zinc-200/80 dark:border-zinc-800/80 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-base shadow-lg transition-all duration-300"
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
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl animate-pulse" />
                <div className="relative p-6 rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                  <Users className="h-16 w-16 text-zinc-400 dark:text-zinc-600" />
                </div>
              </div>
              <p className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Aucun client trouvé
              </p>
              <p className="text-sm text-zinc-500 mb-6">
                {searchQuery
                  ? "Essayez de modifier votre recherche"
                  : "Commencez par créer votre premier client"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau client
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
                        Organisation
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider dark:text-zinc-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-900/50">
                    {filtered.map((customer) => (
                      <tr
                        key={customer.id}
                        className="group hover:bg-gradient-to-r hover:from-emerald-500/5 hover:to-teal-500/5 transition-all duration-300"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-emerald-500/15">
                              <Users className="h-3.5 w-3.5 text-emerald-500" />
                            </div>
                            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                              {customer.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-zinc-400" />
                            {formatPhoneDisplay(customer.phone ?? "")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            {organizations.find((o) => o.id === customer.organization_id)
                              ?.name ?? customer.organization_id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[140px]">
                              <DropdownMenuItem
                                onClick={() => setSelectedCustomer(customer)}
                                className="text-emerald-600 focus:text-emerald-700 dark:text-emerald-400 cursor-pointer"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setEditingCustomer(customer)}
                                className="cursor-pointer"
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(customer)}
                                disabled={deletingId === customer.id}
                                variant="destructive"
                                className="cursor-pointer"
                              >
                                {deletingId === customer.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal détail */}
        {selectedCustomer &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setSelectedCustomer(null)}
            >
              <Card
                className="relative w-full max-w-lg bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20">
                        <Users className="h-5 w-5 text-emerald-500" />
                      </div>
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {selectedCustomer.name}
                      </h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedCustomer(null)}
                      className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="p-6 space-y-4">
                    <DetailRow
                      label="Téléphone"
                      value={formatPhoneDisplay(selectedCustomer.phone ?? "")}
                    />
                    <DetailRow
                      label="Organisation"
                      value={
                        organizations.find(
                          (o) => o.id === selectedCustomer.organization_id
                        )?.name ?? selectedCustomer.organization_id
                      }
                    />
                    {selectedCustomer.created_at && (
                      <DetailRow
                        label="Créé le"
                        value={new Date(
                          selectedCustomer.created_at
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
                        setEditingCustomer(selectedCustomer);
                        setSelectedCustomer(null);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/50"
                      onClick={() => handleDelete(selectedCustomer)}
                      disabled={deletingId === selectedCustomer.id}
                    >
                      {deletingId === selectedCustomer.id ? (
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

        {/* Modal création */}
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
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20">
                        <Users className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          Nouveau client
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
                        Client créé avec succès !
                      </span>
                    </div>
                  )}

                  {createCustomer.error && !createSuccess && (
                    <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
                      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                      <span>
                        {extractApiError(createCustomer.error).message}
                      </span>
                    </div>
                  )}

                  {showNoOrgMessage && !createCustomer.error && (
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
                      <Label htmlFor="cust-name" className="flex items-center gap-2 text-sm font-medium">
                        Nom <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="cust-name"
                        placeholder="ex: Jean Dupont"
                        {...register("name")}
                        className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500">{errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cust-phone" className="flex items-center gap-2 text-sm font-medium">
                        <Phone className="h-3.5 w-3.5 text-zinc-400" />
                        Téléphone <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        name="phone"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <PhoneInput
                            id="cust-phone"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="6 12 34 56 78"
                            className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                            containerClassName="focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500"
                            error={!!errors.phone}
                          />
                        )}
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-500">{errors.phone.message}</p>
                      )}
                    </div>
                    {organizations.length > 0 && (
                      <div className="space-y-1.5">
                        <Label htmlFor="cust-org" className="flex items-center gap-2 text-sm font-medium">
                          <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                          Organisation <span className="text-red-500">*</span>
                        </Label>
                        <SearchableSelect
                          id="cust-org"
                          options={organizationOptions}
                          value={watch("organization_id") ?? ""}
                          onChange={(v) => setValue("organization_id", v)}
                          placeholder="Sélectionner une organisation"
                          searchPlaceholder="Rechercher une organisation…"
                          emptyMessage="Aucune organisation trouvée"
                        />
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
                        disabled={createCustomer.isPending}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 font-semibold"
                        disabled={!canSubmitCreate}
                      >
                        {createCustomer.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Création...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Créer le client
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

        {/* Modal modification */}
        {editingCustomer &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setEditingCustomer(null)}
            >
              <Card
                className="relative w-full max-w-lg bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-t-xl">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      Modifier le client
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingCustomer(null)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  {updateCustomer.error && (
                    <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
                      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                      <span>
                        {extractApiError(updateCustomer.error).message}
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
                      <Controller
                        name="phone"
                        control={updateForm.control}
                        render={({ field }) => (
                          <PhoneInput
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="6 12 34 56 78"
                            className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                            error={!!updateForm.formState.errors.phone}
                          />
                        )}
                      />
                      {updateForm.formState.errors.phone && (
                        <p className="text-xs text-red-500">
                          {updateForm.formState.errors.phone.message}
                        </p>
                      )}
                    </div>
                    {organizations.length > 0 && (
                      <div className="space-y-1.5">
                        <Label>Organisation</Label>
                        <SearchableSelect
                          options={organizationOptions}
                          value={updateForm.watch("organization_id") ?? ""}
                          onChange={(v) => updateForm.setValue("organization_id", v)}
                          placeholder="—"
                          searchPlaceholder="Rechercher une organisation…"
                          emptyMessage="Aucune organisation trouvée"
                        />
                      </div>
                    )}
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingCustomer(null)}
                        className="flex-1"
                        disabled={updateCustomer.isPending}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                        disabled={updateCustomer.isPending}
                      >
                        {updateCustomer.isPending ? (
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
