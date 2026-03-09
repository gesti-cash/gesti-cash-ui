"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Building2, ArrowRight, LogIn, Sparkles } from "lucide-react";
import Link from "next/link";
import { isMockEnabled, MOCK_CREDENTIALS } from "@/shared/mock";
import { useIsAuthenticated } from "@/shared/auth";

export default function TenantRequiredPage() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const mockEnabled = isMockEnabled();

  // Si l'utilisateur est authentifié en mode mock, rediriger vers le dashboard
  useEffect(() => {
    if (mockEnabled && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [mockEnabled, isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 p-4">
      <Card className="w-full max-w-2xl shadow-xl border-2">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Organisation requise</CardTitle>
          <CardDescription className="text-lg mt-2">
            Pour accéder au tableau de bord, une organisation doit être associée à votre accès.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {mockEnabled ? (
            <>
              {/* Mode Mock - Instructions de connexion */}
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Mode développement — Connexion rapide
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                      Connectez-vous avec l’un des comptes ci-dessous : une organisation de démonstration sera chargée automatiquement.
                    </p>
                    
                    <div className="space-y-3">
                      {Object.entries(MOCK_CREDENTIALS).map(([key, cred]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 rounded border border-blue-200 dark:border-blue-700"
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-blue-900 dark:text-blue-100">
                              {cred.role}
                            </div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                              {cred.email} / {cred.password}
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              {cred.description}
                            </div>
                          </div>
                          <Link href="/login">
                            <Button
                              size="sm"
                              className="ml-4 bg-blue-600 hover:bg-blue-700"
                            >
                              <LogIn className="mr-2 h-4 w-4" />
                              Se connecter
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Après connexion, vous pourrez choisir ou créer une organisation et accéder au tableau de bord.
                </p>
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto">
                    <LogIn className="mr-2 h-5 w-5" />
                    Aller à la page de connexion
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Mode Production - Instructions avec sous-domaine */}
              <div className="space-y-4">
                <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Utilisez l’URL de votre organisation (sous-domaine) :
                  </p>
                  <code className="block p-3 bg-zinc-900 dark:bg-zinc-950 text-green-400 rounded text-sm font-mono">
                    nom-org.localhost:3000
                  </code>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">En développement</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li>Exemples : <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">monentreprise.localhost:3000</code> ou <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">demo.localhost:3000</code></li>
                    <li>Dans le fichier <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">hosts</code> : <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">127.0.0.1 monentreprise.localhost</code></li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">En production</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li>URL de type : <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">votre-org.gesticash.com</code></li>
                    <li>Vérifiez que le DNS pointe bien vers l’application</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <LogIn className="mr-2 h-4 w-4" />
                    Se connecter
                  </Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Retour à l'accueil
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
