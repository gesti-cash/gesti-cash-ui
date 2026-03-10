import type { Tenant } from "../types";
import type { Organization } from "./hooks";

/** Cookie pour indiquer qu'une organisation a été sélectionnée */
export const COOKIE_ORG_SELECTED = "gesticash_org_selected";
const COOKIE_MAX_AGE_DAYS = 365;

export function buildTenantFromOrganization(org: Organization): Tenant {
  return {
    id: org.tenant_id,
    name: org.name,
    slug: org.code?.trim() || org.id,
    domain: "",
    settings: {
      currency: "XOF",
      language: "fr",
      timezone: "Africa/Abidjan",
      dateFormat: "DD/MM/YYYY",
      features: [],
    },
    createdAt: org.created_at ?? "",
    updatedAt: org.updated_at ?? "",
  };
}

export function setOrganizationSelectedCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_ORG_SELECTED}=1; path=/; max-age=${60 * 60 * 24 * COOKIE_MAX_AGE_DAYS}; SameSite=Lax`;
}
