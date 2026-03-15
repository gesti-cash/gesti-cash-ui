"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/shared/auth/hooks";
import { useOrganizations, useCreateOrganization, useUpdateOrganization } from "@/shared/organizations/hooks";
import { useTenantStore } from "@/shared/tenant/store";
import type { Organization } from "@/shared/organizations/hooks";
import { buildTenantFromOrganization, setOrganizationSelectedCookie } from "@/shared/organizations/utils";
import { useCountries, useCities } from "@/shared/reference/hooks";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { SearchableSelect } from "@/shared/ui/searchable-select";
import { AlertCircle, Building2, CheckCircle2, MapPin, Plus, Home, Loader2, X, Pencil } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/ui/accordion";
import { cn } from "@/shared/utils/cn";

const selectInputClasses = cn(
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:border-primary/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
);

const initialFormState = () => ({
  name: "",
  code: "",
  country_id: "",
  city_id: "",
  address: "",
  is_default: true,
});

type FormState = ReturnType<typeof initialFormState>;

function CreateOrganizationFormSlot({
  slotId,
  slotIndex,
  form,
  setForm,
  onSubmit,
  isPending,
  tenantId,
  countries,
  countriesLoading,
  formError,
  createSuccess,
  onDismissSuccess,
  onRemove,
  canRemove,
}: {
  slotId: string;
  slotIndex: number;
  form: FormState;
  setForm: (updater: FormState | ((prev: FormState) => FormState)) => void;
  onSubmit: (e: React.FormEvent, id: string) => void;
  isPending: boolean;
  tenantId: string | undefined;
  countries: { id: string; name: string; code?: string }[];
  countriesLoading: boolean;
  formError: string | null;
  createSuccess: string | null;
  onDismissSuccess: () => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const { data: cities = [], isLoading: citiesLoading } = useCities(form.country_id || null);
  return (
    <div className="space-y-5">
      {createSuccess && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15 p-4 text-sm text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold">Organisation créée</p>
            <p className="text-xs opacity-90 truncate mt-0.5">&quot;{createSuccess}&quot; a été ajoutée.</p>
          </div>
          <button type="button" onClick={onDismissSuccess} className="shrink-0 rounded-lg p-1.5 hover:bg-emerald-500/20 transition-colors" aria-label="Fermer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {formError && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}
      <form onSubmit={(e) => onSubmit(e, slotId)} className="space-y-5">
        {canRemove && (
          <div className="flex justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-muted-foreground">
              <X className="h-4 w-4 mr-1" /> Retirer ce formulaire
            </Button>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor={`name-${slotId}`} className="text-sm font-medium">Nom</Label>
          <Input
            id={`name-${slotId}`}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ex. Mon entreprise"
            className="rounded-lg h-11"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`code-${slotId}`} className="text-sm font-medium">Code <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
          <Input
            id={`code-${slotId}`}
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            placeholder="Ex. ORG-001"
            className="rounded-lg h-11"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`country_id-${slotId}`} className="text-sm font-medium">Pays</Label>
            <SearchableSelect
              id={`country_id-${slotId}`}
              options={countries.map((c) => ({ value: c.id, label: `${c.name}${c.code ? ` (${c.code})` : ""}` }))}
              value={form.country_id}
              onChange={(v) => setForm((f) => ({ ...f, country_id: v, city_id: "" }))}
              placeholder="Sélectionner un pays"
              searchPlaceholder="Rechercher un pays…"
              emptyMessage="Aucun pays trouvé"
              className="[&_button]:h-11 [&_button]:rounded-lg"
            />
            {countriesLoading && <p className="text-xs text-muted-foreground">Chargement...</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`city_id-${slotId}`} className="text-sm font-medium">Ville</Label>
            <SearchableSelect
              id={`city_id-${slotId}`}
              options={cities.map((city) => ({ value: city.id, label: city.name }))}
              value={form.city_id}
              onChange={(v) => setForm((f) => ({ ...f, city_id: v }))}
              placeholder="Sélectionner une ville"
              searchPlaceholder="Rechercher une ville…"
              emptyMessage="Aucune ville trouvée"
              disabled={!form.country_id}
              className="[&_button]:h-11 [&_button]:rounded-lg"
            />
            {citiesLoading && form.country_id && <p className="text-xs text-muted-foreground">Chargement...</p>}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`address-${slotId}`} className="text-sm font-medium">Adresse <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
          <Input
            id={`address-${slotId}`}
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            placeholder="Adresse complète"
            className="rounded-lg h-11"
          />
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
          <input
            id={`is_default-${slotId}`}
            type="checkbox"
            className="mt-1 h-4 w-4 rounded-md border-input accent-primary"
            checked={form.is_default}
            onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
          />
          <label htmlFor={`is_default-${slotId}`} className="text-sm text-muted-foreground cursor-pointer leading-tight">
            Définir comme organisation par défaut
          </label>
        </div>
        <Button
          type="submit"
          className="w-full h-12 rounded-xl font-semibold text-base shadow-lg shadow-primary/15 hover:shadow-xl hover:shadow-primary/20 transition-shadow"
          size="lg"
          disabled={isPending || !tenantId}
        >
          {isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Création...</>
          ) : (
            <><Plus className="h-4 w-4" /> Créer cette organisation</>
          )}
        </Button>
      </form>
    </div>
  );
}

function EditOrganizationModal({
  organization,
  form,
  setForm,
  onSubmit,
  onClose,
  isPending,
  error,
  countries,
  countriesLoading,
  selectInputClasses,
}: {
  organization: Organization;
  form: FormState;
  setForm: (updater: FormState | ((prev: FormState) => FormState)) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isPending: boolean;
  error: string | null;
  countries: { id: string; name: string; code?: string }[];
  countriesLoading: boolean;
  selectInputClasses: string;
}) {
  const { data: cities = [], isLoading: citiesLoading } = useCities(form.country_id || null);
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <Card
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto border border-border/60 bg-card shadow-2xl rounded-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Pencil className="h-4 w-4" strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Modifier l'organisation</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{organization.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <CardContent className="p-6">
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive mb-5">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-medium">Nom</Label>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ex. Mon entreprise"
                className="rounded-lg h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-code" className="text-sm font-medium">Code <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
              <Input
                id="edit-code"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="Ex. ORG-001"
                className="rounded-lg h-11"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-country_id" className="text-sm font-medium">Pays</Label>
                <SearchableSelect
                  id="edit-country_id"
                  options={countries.map((c) => ({ value: c.id, label: `${c.name}${c.code ? ` (${c.code})` : ""}` }))}
                  value={form.country_id}
                  onChange={(v) => setForm((f) => ({ ...f, country_id: v, city_id: "" }))}
                  placeholder="Sélectionner un pays"
                  searchPlaceholder="Rechercher un pays…"
                  emptyMessage="Aucun pays trouvé"
                  className="[&_button]:h-11 [&_button]:rounded-lg"
                />
                {countriesLoading && <p className="text-xs text-muted-foreground">Chargement...</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-city_id" className="text-sm font-medium">Ville</Label>
                <SearchableSelect
                  id="edit-city_id"
                  options={cities.map((city) => ({ value: city.id, label: city.name }))}
                  value={form.city_id}
                  onChange={(v) => setForm((f) => ({ ...f, city_id: v }))}
                  placeholder="Sélectionner une ville"
                  searchPlaceholder="Rechercher une ville…"
                  emptyMessage="Aucune ville trouvée"
                  disabled={!form.country_id}
                  className="[&_button]:h-11 [&_button]:rounded-lg"
                />
                {citiesLoading && form.country_id && <p className="text-xs text-muted-foreground">Chargement...</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address" className="text-sm font-medium">Adresse <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
              <Input
                id="edit-address"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Adresse complète"
                className="rounded-lg h-11"
              />
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
              <input
                id="edit-is_default"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded-md border-input accent-primary"
                checked={form.is_default}
                onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
              />
              <label htmlFor="edit-is_default" className="text-sm text-muted-foreground cursor-pointer leading-tight">
                Définir comme organisation par défaut
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isPending}>
                Annuler
              </Button>
              <Button type="submit" className="flex-1 h-11 rounded-xl font-semibold" disabled={isPending}>
                {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Enregistrement...</> : <>Enregistrer</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SelectOrganizationPage() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const tenantId = user?.tenantId;
  const tenant = useTenantStore((s) => s.tenant);

  const { data: organizations, isLoading, isError } = useOrganizations(tenantId);

  // Nom de l'entreprise : tenant du store ou organisation par défaut/première
  const companyName =
    tenant?.name ??
    (organizations?.length
      ? (organizations.find((o) => o.is_default) ?? organizations[0])?.name
      : null);
  const createOrganizationMutation = useCreateOrganization(tenantId);
  const updateOrganizationMutation = useUpdateOrganization(tenantId);

  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [editForm, setEditForm] = useState<FormState>(initialFormState());
  const [accordionValue, setAccordionValue] = useState<string[]>([]);
  const [slots, setSlots] = useState<string[]>(() => ["create-1"]);
  const [formBySlot, setFormBySlot] = useState<Record<string, ReturnType<typeof initialFormState>>>(() => ({ "create-1": initialFormState() }));
  const [formError, setFormError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [editFormError, setEditFormError] = useState<string | null>(null);

  const { data: countries = [], isLoading: countriesLoading } = useCountries();

  // Sélection automatique : organisation par défaut ou seule organisation
  useEffect(() => {
    if (!organizations || organizations.length === 0) return;
    const defaultOrg = organizations.find((o) => o.is_default) ?? organizations[0];
    if (defaultOrg && selectedOrgId === null) {
      setSelectedOrgId(defaultOrg.id);
    }
  }, [organizations, selectedOrgId]);

  const handleContinue = () => {
    if (!selectedOrgId || !organizations) return;
    const org = organizations.find((o) => o.id === selectedOrgId);
    if (!org) return;
    const tenant = buildTenantFromOrganization(org);
    useTenantStore.getState().setTenant(tenant);
    useTenantStore.getState().setSelectedOrganizationId(tenant.id, selectedOrgId);
    setOrganizationSelectedCookie();
    router.push("/dashboard");
  };

  const handleCreateOrganization = async (e: React.FormEvent, slotId: string) => {
    e.preventDefault();
    setFormError(null);
    const form = formBySlot[slotId];
    if (!form) return;

    if (!tenantId) {
      setFormError("Tenant introuvable. Veuillez vous reconnecter.");
      return;
    }

    try {
      const org = await createOrganizationMutation.mutateAsync(form);
      setSelectedOrgId(org.id);
      setCreateSuccess(org.name);
      setFormError(null);
      setFormBySlot((prev) => ({ ...prev, [slotId]: initialFormState() }));
      setAccordionValue((prev) => prev.filter((v) => v !== slotId));
      setTimeout(() => setCreateSuccess(null), 5000);
    } catch (error: any) {
      setFormError(error?.message ?? "Impossible de créer l'organisation");
    }
  };

  const addOrganizationSlot = () => {
    const newId = `create-${Date.now()}`;
    setSlots((prev) => [...prev, newId]);
    setFormBySlot((prev) => ({ ...prev, [newId]: initialFormState() }));
    setAccordionValue((prev) => [...prev, newId]);
  };

  const removeSlot = (slotId: string) => {
    if (slots.length <= 1) return;
    setSlots((prev) => prev.filter((id) => id !== slotId));
    setFormBySlot((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
    setAccordionValue((prev) => prev.filter((v) => v !== slotId));
  };

  // Pré-remplir le formulaire d’édition quand une organisation est sélectionnée
  useEffect(() => {
    if (editingOrganization) {
      setEditForm({
        name: editingOrganization.name,
        code: editingOrganization.code ?? "",
        country_id: editingOrganization.country_id ?? "",
        city_id: editingOrganization.city_id ?? "",
        address: editingOrganization.address ?? "",
        is_default: editingOrganization.is_default,
      });
      setEditFormError(null);
    }
  }, [editingOrganization]);

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrganization || !tenantId) return;
    setEditFormError(null);
    try {
      await updateOrganizationMutation.mutateAsync({
        id: editingOrganization.id,
        name: editForm.name,
        code: editForm.code || undefined,
        country_id: editForm.country_id || undefined,
        city_id: editForm.city_id || undefined,
        address: editForm.address || undefined,
        is_default: editForm.is_default,
      });
      setEditingOrganization(null);
    } catch (error: any) {
      setEditFormError(error?.message ?? "Impossible de modifier l'organisation");
    }
  };

  const hasOrganizations = organizations && organizations.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--primary)/.08),var(--background)]">
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="container max-w-5xl mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/10">
                <Building2 className="h-6 w-6" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">Choisir une organisation</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Sélectionnez ou créez l’organisation avec laquelle travailler</p>
              </div>
            </div>
            {companyName && (
              <Badge variant="secondary" className="w-fit text-xs font-medium px-3 py-1.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                {companyName}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-5xl mx-auto px-4 py-8 md:py-10">
      <div className="grid gap-8 lg:grid-cols-[1.35fr,1fr] lg:gap-10">
        {/* Colonne gauche : sélection */}
        <Card className="overflow-hidden border border-border/60 bg-card shadow-xl shadow-black/5 rounded-2xl">
          <CardHeader className="pb-4 pt-6 px-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-4 w-4" strokeWidth={2} />
              </span>
              <div>
                <CardTitle className="text-lg font-semibold tracking-tight">Sélectionner</CardTitle>
                <CardDescription className="text-sm mt-0.5">
                  Choisissez l’organisation avec laquelle accéder au tableau de bord.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-muted-foreground">
                <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                <span className="text-sm font-medium">Chargement des organisations...</span>
              </div>
            )}

            {isError && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>Impossible de charger les organisations. Vérifiez votre connexion ou réessayez.</span>
              </div>
            )}

            {hasOrganizations ? (
              <>
                <p className="text-xs font-medium text-muted-foreground/90 mb-4 uppercase tracking-wider">
                  {organizations!.length} organisation{organizations!.length > 1 ? "s" : ""} disponible{organizations!.length > 1 ? "s" : ""}
                </p>
                <div className="space-y-3 mb-6" role="listbox" aria-label="Liste des organisations">
                  {organizations!.map((org) => (
                    <div
                      key={org.id}
                      className={cn(
                        "group flex w-full items-start justify-between gap-3 rounded-2xl border-2 px-4 py-3.5 transition-all duration-200",
                        selectedOrgId === org.id
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/10 ring-2 ring-primary/20"
                          : "border-border/80 bg-muted/20 hover:border-primary/30 hover:bg-muted/40 hover:shadow-sm"
                      )}
                    >
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedOrgId === org.id}
                        onClick={() => setSelectedOrgId(org.id)}
                        className="flex flex-1 min-w-0 items-start gap-3 text-left"
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className={cn(
                            "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                            selectedOrgId === org.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                          )}>
                            <Building2 className="h-5 w-5" strokeWidth={2} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-foreground">{org.name}</span>
                              {org.is_default && (
                                <Badge variant="outline" className="text-[10px] font-medium rounded-md border-primary/30 text-primary">Par défaut</Badge>
                              )}
                            </div>
                            {org.code != null && org.code !== "" && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?$/i.test(org.code.trim()) && (
                              <p className="text-xs text-muted-foreground mt-0.5">Code <span className="font-mono font-medium">{org.code}</span></p>
                            )}
                            {org.address != null && org.address !== "" && (
                              <p className="mt-1 text-xs text-muted-foreground line-clamp-2 flex items-center gap-1">
                                <MapPin className="h-3 w-3 shrink-0 opacity-70" />
                                <span className="line-clamp-2">{org.address}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        {selectedOrgId === org.id && (
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                          </span>
                        )}
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingOrganization(org);
                        }}
                        aria-label="Modifier cette organisation"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  size="lg"
                  className={cn(
                    "w-full rounded-xl font-semibold h-12 text-base transition-all",
                    selectedOrgId ? "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25" : ""
                  )}
                  disabled={!selectedOrgId}
                  onClick={handleContinue}
                >
                  <Home className="h-5 w-5" />
                  Continuer vers le tableau de bord
                </Button>
              </>
            ) : (
              !isLoading && (
                <div className="flex flex-col items-center justify-center gap-5 py-14 px-6 text-center rounded-2xl bg-gradient-to-b from-muted/40 to-muted/20 border-2 border-dashed border-border/80">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground">
                    <Building2 className="h-8 w-8" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Aucune organisation</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                      Créez votre première organisation dans le formulaire à droite pour continuer.
                    </p>
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>

        {/* Colonne droite : création (accordéon) */}
        <Card className="overflow-hidden border border-border/60 bg-card shadow-xl shadow-black/5 rounded-2xl">
          <CardHeader className="pb-2 pt-6 px-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Plus className="h-4 w-4" strokeWidth={2} />
              </span>
              <div>
                <CardTitle className="text-lg font-semibold tracking-tight">Créer des organisations</CardTitle>
                <CardDescription className="text-sm mt-0.5">
                  Dépliez un panneau pour ajouter une organisation. Vous pouvez en ajouter plusieurs.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <Accordion
              type="multiple"
              value={accordionValue}
              onValueChange={setAccordionValue}
              className="w-full"
            >
              {slots.map((slotId, index) => (
                <AccordionItem key={slotId} value={slotId} className="border-border/60 px-0">
                  <AccordionTrigger className="py-4 hover:no-underline [&[data-state=open]]:border-b [&[data-state=open]]:border-border/40 [&[data-state=open]]:pb-4">
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary shrink-0" />
                      Créer une organisation {slots.length > 1 ? ` (${index + 1})` : ""}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CreateOrganizationFormSlot
                      slotId={slotId}
                      slotIndex={index}
                      form={formBySlot[slotId] ?? initialFormState()}
                      setForm={(updater) =>
                        setFormBySlot((prev) => ({
                          ...prev,
                          [slotId]: typeof updater === "function" ? updater(prev[slotId] ?? initialFormState()) : updater,
                        }))
                      }
                      onSubmit={handleCreateOrganization}
                      isPending={createOrganizationMutation.isPending}
                      tenantId={tenantId}
                      countries={countries}
                      countriesLoading={countriesLoading}
                      formError={formError}
                      createSuccess={createSuccess}
                      onDismissSuccess={() => setCreateSuccess(null)}
                      onRemove={() => removeSlot(slotId)}
                      canRemove={slots.length > 1}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Button
              type="button"
              variant="outline"
              className="w-full mt-4 rounded-xl border-dashed"
              onClick={addOrganizationSlot}
            >
              <Plus className="h-4 w-4" />
              Ajouter une organisation
            </Button>
            <p className="text-xs text-muted-foreground flex items-center gap-2 pt-4">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
              Vous pourrez modifier les organisations plus tard dans les paramètres.
            </p>
          </CardContent>
        </Card>
      </div>

        {/* Modal modification organisation */}
        {editingOrganization &&
          typeof document !== "undefined" &&
          createPortal(
            <EditOrganizationModal
              organization={editingOrganization}
              form={editForm}
              setForm={setEditForm}
              onSubmit={handleUpdateOrganization}
              onClose={() => setEditingOrganization(null)}
              isPending={updateOrganizationMutation.isPending}
              error={editFormError}
              countries={countries}
              countriesLoading={countriesLoading}
              selectInputClasses={selectInputClasses}
            />,
            document.body
          )}
      </main>
    </div>
  );
}
