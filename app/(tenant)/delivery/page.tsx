"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { phoneSchema, phoneSchemaOptional, formatPhoneDisplay } from "@/shared/constants";
import { PhoneInput } from "@/shared/ui/phone-input";
import {
  useTenantId,
  useSelectedOrganizationId,
  useSetSelectedOrganizationId,
} from "@/shared/tenant/store";
import { useOrganizations } from "@/shared/organizations/hooks";
import {
  useDrivers,
  useCreateDriver,
  useUpdateDriver,
  useDeleteDriver,
} from "@/shared/drivers/hooks";
import type { Driver } from "@/shared/drivers/hooks";
import { extractApiError } from "@/shared/api/axios";
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
  UserCircle,
  Plus,
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Phone,
  Car,
  Hash,
  Building2,
  ExternalLink,
  Pencil,
  Trash2,
  Eye,
  MoreVertical,
} from "lucide-react";

const createDriverSchema = z.object({
  first_name: z.string().min(2, "Le prénom doit comporter au moins 2 caractères"),
  last_name: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  phone: phoneSchema,
  vehicle_type: z.string().optional(),
  vehicle_plate: z.string().optional(),
  organization_id: z.string().min(1, "Veuillez sélectionner une organisation"),
  is_active: z.boolean().optional(),
});

type CreateDriverFormValues = z.infer<typeof createDriverSchema>;

const updateDriverSchema = z.object({
  first_name: z.string().min(2).optional(),
  last_name: z.string().min(2).optional(),
  phone: phoneSchemaOptional,
  vehicle_type: z.string().optional(),
  vehicle_plate: z.string().optional(),
  organization_id: z.string().optional(),
  is_active: z.boolean().optional(),
});

type UpdateDriverFormValues = z.infer<typeof updateDriverSchema>;

function driverDisplayName(d: Driver) {
  return [d.first_name, d.last_name].filter(Boolean).join(" ") || d.id;
}

export default function DeliveryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const tenantId = useTenantId();
  const persistedOrgId = useSelectedOrganizationId(tenantId ?? undefined);
  const setSelectedOrganizationId = useSetSelectedOrganizationId();
  const { data: organizations = [] } = useOrganizations(tenantId);
  const defaultOrg = organizations.find((o) => o.is_default) ?? organizations[0];

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateDriverFormValues>({
    resolver: zodResolver(createDriverSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      vehicle_type: "",
      vehicle_plate: "",
      organization_id: "",
      is_active: true,
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

  const { data: drivers = [], isLoading, error } = useDrivers(
    tenantId,
    selectedOrgId || undefined
  );

  const updateForm = useForm<UpdateDriverFormValues>({
    resolver: zodResolver(updateDriverSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      vehicle_type: "",
      vehicle_plate: "",
      organization_id: "",
      is_active: true,
    },
  });

  const organizationOptions = React.useMemo(
    () =>
      organizations.map((org) => ({
        value: org.id,
        label: `${org.name}${org.is_default ? " (par défaut)" : ""}`,
      })),
    [organizations]
  );

  const createDriver = useCreateDriver(tenantId, selectedOrgId || undefined);
  const updateDriver = useUpdateDriver(tenantId, selectedOrgId || undefined);
  const deleteDriver = useDeleteDriver(tenantId, selectedOrgId || undefined);

  const onSubmitCreate = handleSubmit(async (values) => {
    await createDriver.mutateAsync(
      {
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone,
        vehicle_type: values.vehicle_type || undefined,
        vehicle_plate: values.vehicle_plate || undefined,
        organization_id: values.organization_id,
        is_active: values.is_active ?? true,
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
    if (!editingDriver) return;
    await updateDriver.mutateAsync(
      {
        id: editingDriver.id,
        ...(values.first_name && { first_name: values.first_name }),
        ...(values.last_name && { last_name: values.last_name }),
        ...(values.phone !== undefined && { phone: values.phone }),
        ...(values.vehicle_type !== undefined && { vehicle_type: values.vehicle_type }),
        ...(values.vehicle_plate !== undefined && { vehicle_plate: values.vehicle_plate }),
        ...(values.organization_id && { organization_id: values.organization_id }),
        ...(values.is_active !== undefined && { is_active: values.is_active }),
      },
      {
        onSuccess: () => {
          setEditingDriver(null);
        },
      }
    );
  });

  const handleDelete = async (driver: Driver) => {
    if (!confirm(`Supprimer le livreur « ${driverDisplayName(driver)} » ?`)) return;
    setDeletingId(driver.id);
    await deleteDriver.mutateAsync(driver.id, {
      onSettled: () => setDeletingId(null),
      onSuccess: () => setSelectedDriver(null),
    });
  };

  useEffect(() => {
    if (editingDriver) {
      updateForm.reset({
        first_name: editingDriver.first_name,
        last_name: editingDriver.last_name,
        phone: editingDriver.phone ?? "",
        vehicle_type: editingDriver.vehicle_type ?? "",
        vehicle_plate: editingDriver.vehicle_plate ?? "",
        organization_id: editingDriver.organization_id ?? "",
        is_active: editingDriver.is_active ?? true,
      });
    }
  }, [editingDriver, updateForm]);

  const canSubmitCreate =
    !!selectedOrgId &&
    !!tenantId &&
    !createDriver.isPending &&
    !createSuccess;
  const showNoOrgMessage = organizations.length === 0 || !selectedOrgId;

  const filtered = drivers.filter(
    (d) =>
      driverDisplayName(d).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.phone && d.phone.includes(searchQuery)) ||
      (d.vehicle_plate && d.vehicle_plate.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 dark:from-black dark:via-zinc-950 dark:to-black">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500 mx-auto" />
          </div>
          <p className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
            Chargement des livreurs...
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
                  : "Une erreur est survenue lors du chargement des livreurs"}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-600/30 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-600/20 p-3 shadow-2xl shadow-blue-500/20 ring-2 ring-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                  <UserCircle className="h-full w-full text-blue-400 dark:text-blue-500" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2 tracking-tight">
                  Livreurs
                </h1>
                <p className="text-zinc-500 text-sm lg:text-base dark:text-zinc-400 font-medium">
                  Gérez vos chauffeurs et livraisons
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/20 px-6 py-2.5 font-semibold transition-all duration-200 hover:scale-105 group"
            >
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Nouveau livreur
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-blue-500/40 transition-all duration-500 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                    <UserCircle className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-1">
                  {drivers.length}
                </div>
                <p className="text-xs text-zinc-500 font-medium">
                  Livreurs au total
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="relative group mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              type="text"
              placeholder="Rechercher par nom, téléphone ou plaque..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 h-14 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-zinc-200/80 dark:border-zinc-800/80 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-base shadow-lg transition-all duration-300"
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
                <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl animate-pulse" />
                <div className="relative p-6 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                  <UserCircle className="h-16 w-16 text-zinc-400 dark:text-zinc-600" />
                </div>
              </div>
              <p className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Aucun livreur trouvé
              </p>
              <p className="text-sm text-zinc-500 mb-6">
                {searchQuery
                  ? "Essayez de modifier votre recherche"
                  : "Aucun livreur enregistré pour cette organisation."}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau livreur
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
                        Véhicule
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
                    {filtered.map((driver) => (
                      <tr
                        key={driver.id}
                        className="group hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-cyan-500/5 transition-all duration-300"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-blue-500/15">
                              <UserCircle className="h-3.5 w-3.5 text-blue-500" />
                            </div>
                            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                              {driverDisplayName(driver)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {driver.phone ? (
                            <span className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                              <Phone className="h-3.5 w-3.5 text-zinc-400" />
                              {formatPhoneDisplay(driver.phone)}
                            </span>
                          ) : (
                            <span className="text-sm text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {driver.vehicle_type || driver.vehicle_plate ? (
                            <span className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                              <Car className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                              {[driver.vehicle_type, driver.vehicle_plate].filter(Boolean).join(" · ") || "—"}
                            </span>
                          ) : (
                            <span className="text-sm text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              driver.is_active !== false
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            {driver.is_active !== false ? "Actif" : "Inactif"}
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
                                onClick={() => setSelectedDriver(driver)}
                                className="text-blue-600 focus:text-blue-700 dark:text-blue-400 cursor-pointer"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setEditingDriver(driver)}
                                className="cursor-pointer"
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(driver)}
                                disabled={deletingId === driver.id}
                                variant="destructive"
                                className="cursor-pointer"
                              >
                                {deletingId === driver.id ? (
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

        {/* Modal détail livreur */}
        {selectedDriver &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setSelectedDriver(null)}
            >
              <Card
                className="relative w-full max-w-lg bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <UserCircle className="h-5 w-5 text-blue-500" />
                      </div>
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {driverDisplayName(selectedDriver)}
                      </h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedDriver(null)}
                      className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="p-6 space-y-4">
                    <DetailRow
                      label="Téléphone"
                      value={formatPhoneDisplay(selectedDriver.phone ?? "")}
                    />
                    <DetailRow
                      label="Type de véhicule"
                      value={selectedDriver.vehicle_type || "—"}
                    />
                    <DetailRow
                      label="Plaque"
                      value={selectedDriver.vehicle_plate || "—"}
                    />
                    <DetailRow
                      label="Organisation"
                      value={
                        organizations.find(
                          (o) => o.id === selectedDriver.organization_id
                        )?.name ?? selectedDriver.organization_id
                      }
                    />
                    <DetailRow
                      label="Statut"
                      value={selectedDriver.is_active !== false ? "Actif" : "Inactif"}
                    />
                    {selectedDriver.created_at && (
                      <DetailRow
                        label="Créé le"
                        value={new Date(
                          selectedDriver.created_at
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
                        setEditingDriver(selectedDriver);
                        setSelectedDriver(null);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/50"
                      onClick={() => handleDelete(selectedDriver)}
                      disabled={deletingId === selectedDriver.id}
                    >
                      {deletingId === selectedDriver.id ? (
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

        {/* Modal création livreur */}
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
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <UserCircle className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          Nouveau livreur
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Prénom, nom, téléphone, véhicule et organisation
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
                        Livreur créé avec succès !
                      </span>
                    </div>
                  )}

                  {createDriver.error && !createSuccess && (
                    <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
                      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                      <span>
                        {extractApiError(createDriver.error).message}
                      </span>
                    </div>
                  )}

                  {showNoOrgMessage && !createDriver.error && (
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="dr-first-name" className="flex items-center gap-2 text-sm font-medium">
                          Prénom <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="dr-first-name"
                          placeholder="ex: Jean"
                          {...register("first_name")}
                          className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        {errors.first_name && (
                          <p className="text-xs text-red-500">{errors.first_name.message}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="dr-last-name" className="flex items-center gap-2 text-sm font-medium">
                          Nom <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="dr-last-name"
                          placeholder="ex: Kouassi"
                          {...register("last_name")}
                          className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        {errors.last_name && (
                          <p className="text-xs text-red-500">{errors.last_name.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="dr-phone" className="flex items-center gap-2 text-sm font-medium">
                        <Phone className="h-3.5 w-3.5 text-zinc-400" />
                        Téléphone <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        name="phone"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <PhoneInput
                            id="dr-phone"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="07 00 00 00 00"
                            className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                            containerClassName="focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500"
                            error={!!errors.phone}
                          />
                        )}
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-500">{errors.phone.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="dr-vehicle-type" className="flex items-center gap-2 text-sm font-medium">
                          <Car className="h-3.5 w-3.5 text-zinc-400" />
                          Type de véhicule
                        </Label>
                        <Input
                          id="dr-vehicle-type"
                          placeholder="ex: Moto, Camion"
                          {...register("vehicle_type")}
                          className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="dr-vehicle-plate" className="flex items-center gap-2 text-sm font-medium">
                          <Hash className="h-3.5 w-3.5 text-zinc-400" />
                          Plaque
                        </Label>
                        <Input
                          id="dr-vehicle-plate"
                          placeholder="ex: CI-1234-AB"
                          {...register("vehicle_plate")}
                          className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    {organizations.length > 0 && (
                      <div className="space-y-1.5">
                        <Label htmlFor="dr-org" className="flex items-center gap-2 text-sm font-medium">
                          <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                          Organisation <span className="text-red-500">*</span>
                        </Label>
                        <SearchableSelect
                          id="dr-org"
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

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="dr-is-active"
                        {...register("is_active")}
                        className="h-4 w-4 rounded border-zinc-300 text-blue-500 focus:ring-blue-500"
                      />
                      <Label htmlFor="dr-is-active" className="text-sm font-medium cursor-pointer">
                        Livreur actif
                      </Label>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 border-zinc-200 dark:border-zinc-800"
                        disabled={createDriver.isPending}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/20 font-semibold"
                        disabled={!canSubmitCreate}
                      >
                        {createDriver.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Création...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Créer le livreur
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

        {/* Modal modification livreur */}
        {editingDriver &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setEditingDriver(null)}
            >
              <Card
                className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-t-xl">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      Modifier le livreur
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingDriver(null)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  {updateDriver.error && (
                    <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
                      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                      <span>
                        {extractApiError(updateDriver.error).message}
                      </span>
                    </div>
                  )}
                  <form onSubmit={onSubmitUpdate} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Prénom</Label>
                        <Input
                          {...updateForm.register("first_name")}
                          className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                        />
                        {updateForm.formState.errors.first_name && (
                          <p className="text-xs text-red-500">
                            {updateForm.formState.errors.first_name.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label>Nom</Label>
                        <Input
                          {...updateForm.register("last_name")}
                          className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                        />
                        {updateForm.formState.errors.last_name && (
                          <p className="text-xs text-red-500">
                            {updateForm.formState.errors.last_name.message}
                          </p>
                        )}
                      </div>
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
                            placeholder="07 00 00 00 00"
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Type de véhicule</Label>
                        <Input
                          {...updateForm.register("vehicle_type")}
                          className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Plaque</Label>
                        <Input
                          {...updateForm.register("vehicle_plate")}
                          className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                        />
                      </div>
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
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...updateForm.register("is_active")}
                        className="h-4 w-4 rounded border-zinc-300 text-blue-500 focus:ring-blue-500"
                      />
                      <Label className="text-sm font-medium cursor-pointer">
                        Livreur actif
                      </Label>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingDriver(null)}
                        className="flex-1"
                        disabled={updateDriver.isPending}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
                        disabled={updateDriver.isPending}
                      >
                        {updateDriver.isPending ? (
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
