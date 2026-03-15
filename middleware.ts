import { NextRequest, NextResponse } from "next/server";
import { getTenantFromDomain, isDeploymentPlatformDomain } from "./shared/config/env";

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/tenant-required", "/privacy", "/terms"];

// Routes qui nécessitent un tenant
const tenantRoutes = [
  "/dashboard",
  "/settings",
  "/transactions",
  "/users",
  "/reports",
  "/mock-demo",
  "/products",
  "/orders",
  "/customers",
  "/stock",
  "/inventory",
  "/movements",
  "/cash",
  "/finances",
  "/roas",
  "/organizations",
];

// Vérifier si le mode mock est activé (via variable d'environnement ou config)
function isMockModeEnabled(): boolean {
  // En développement, on considère que le mock est activé par défaut
  // Vous pouvez aussi utiliser une variable d'environnement
  return process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_MOCK_ENABLED === "true";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  
  // Extraire le slug du tenant depuis le sous-domaine
  const tenantSlug = getTenantFromDomain(hostname);
  
  // Récupérer les tokens depuis les cookies
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  
  // Vérifier si la route nécessite un tenant
  const requiresTenant = tenantRoutes.some(route => pathname.startsWith(route));
  
  // Vérifier si c'est une route publique
  // Note: on utilise la correspondance exacte pour "/" pour éviter de matcher tous les chemins
  const isPublicRoute = publicRoutes.some(route =>
    route === "/" ? pathname === "/" : pathname.startsWith(route)
  );
  
  // En mode mock, permettre l'accès sans tenant si l'utilisateur est authentifié
  const mockEnabled = isMockModeEnabled();
  
  // En mode mock, permettre l'accès aux routes tenant sans vérifier les cookies
  // (car l'authentification est gérée côté client via localStorage)
  if (mockEnabled && requiresTenant) {
    const response = NextResponse.next();
    response.headers.set("x-tenant-slug", "demo"); // Slug par défaut en mode mock
    return response;
  }
  
  // Si la route nécessite un tenant mais qu'il n'y en a pas
  // Exception : sur un domaine de déploiement (ex. Vercel), on laisse passer (tenant optionnel)
  const onDeploymentDomain = isDeploymentPlatformDomain(hostname);
  if (requiresTenant && !tenantSlug && !onDeploymentDomain) {
    const url = request.nextUrl.clone();
    url.pathname = "/tenant-required";
    return NextResponse.redirect(url);
  }
  
  // Si l'utilisateur n'est pas authentifié et que la route n'est pas publique
  if (!accessToken && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }
  
  // Si l'utilisateur est authentifié et accède à une route publique
  // Ne pas rediriger vers /organizations/select si une organisation a déjà été sélectionnée (cookie)
  const hasSelectedOrg = request.cookies.get("gesticash_org_selected")?.value === "1";
  if (accessToken && isPublicRoute && pathname !== "/organizations/select") {
    const url = request.nextUrl.clone();
    url.pathname = hasSelectedOrg ? "/dashboard" : "/organizations/select";
    return NextResponse.redirect(url);
  }
  
  // Créer la réponse
  const response = NextResponse.next();
  
  // Ajouter le tenant slug dans les headers pour y accéder dans les composants
  if (tenantSlug) {
    response.headers.set("x-tenant-slug", tenantSlug);
  }
  
  return response;
}

// Configuration du matcher pour optimiser les performances
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _next/data (RSC/data requests - avoid redirecting these to prevent loops)
     * - favicon.ico (favicon file)
     * - public folder / static assets
     */
    "/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
