"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useLogin, loginSchema, type LoginInput } from "@/shared/auth/hooks";
import { useMockLogin, mockLoginSchema, type MockLoginInput } from "@/shared/mock";
import { MOCK_CREDENTIALS, isMockEnabled } from "@/shared/mock";
import { useTenantSlug } from "@/shared/tenant/store";
import { extractApiError } from "@/shared/api/axios";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, Building2, LogIn, AlertCircle, CheckCircle2 } from "lucide-react";
import { HiSparkles } from "react-icons/hi2";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const t = useTranslations("auth");
  const tenantSlug = useTenantSlug();
  const loginMutation = useLogin();
  const mockLoginMutation = useMockLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [useMock, setUseMock] = useState(isMockEnabled());

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
  } = useForm<LoginInput | MockLoginInput>({
    resolver: zodResolver(useMock ? mockLoginSchema : loginSchema),
    defaultValues: {
      email: "",
      password: "",
      tenantSlug: tenantSlug || "",
    },
  });

  const onSubmit = async (data: LoginInput | MockLoginInput) => {
    try {
      if (useMock) {
        await mockLoginMutation.mutateAsync(data as MockLoginInput);
      } else {
        await loginMutation.mutateAsync(data as LoginInput);
      }
    } catch (error) {
      const apiError = extractApiError(error);
      setError("root", { message: apiError.message });
    }
  };

  const handleQuickLogin = (email: string, password: string) => {
    setValue("email", email);
    setValue("password", password);
    if (tenantSlug) {
      setValue("tenantSlug", tenantSlug);
    }
    handleSubmit(onSubmit)();
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center justify-center gap-2 mb-4"
            >
              <Image
                src="/logo/logo.png"
                alt="GestiCash Logo"
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                GestiCash
              </h1>
            </motion.div>
            <p className="text-sm text-muted-foreground font-medium">
              Votre argent, enfin sous contrôle
            </p>
          </div>

          <Card className="border-2 shadow-xl">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-2xl font-bold text-center">
                {t("welcomeBack")}
              </CardTitle>
              <CardDescription className="text-center">
                Connectez-vous pour accéder à votre espace
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {/* Mock Mode Banner */}
              {/* {isMockEnabled() && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 rounded-lg bg-blue-50 border-2 border-blue-200 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <HiSparkles className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-2">
                        Mode Développement - Connexion Test
                      </h3>
                      <p className="text-sm text-blue-700 mb-3">
                        Utilisez ces identifiants pour vous connecter rapidement :
                      </p>
                      <div className="space-y-2">
                        {Object.entries(MOCK_CREDENTIALS).map(([key, cred]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between p-2 bg-white rounded border border-blue-100"
                          >
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-blue-900">
                                {cred.role}
                              </div>
                              <div className="text-xs text-blue-700">
                                {cred.email} / {cred.password}
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuickLogin(cred.email, cred.password)}
                              className="text-xs h-7"
                            >
                              Utiliser
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )} */}

              {/* Error Message */}
              {errors.root && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 rounded-lg bg-destructive/10 border border-destructive/30 p-4 flex items-start gap-3"
                >
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive font-medium">
                    {errors.root.message}
                  </p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">
                    {t("email")}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      {...register("email")}
                      id="email"
                      type="email"
                      placeholder="vous@exemple.com"
                      className="pl-10 h-11"
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive flex items-center gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold">
                    {t("password")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      {...register("password")}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive flex items-center gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {errors.password.message}
                    </motion.p>
                  )}
                </div>

                {/* Tenant Slug (hidden if already in URL) */}
                {!tenantSlug && (
                  <div className="space-y-2">
                    <Label htmlFor="tenantSlug" className="text-sm font-semibold">
                      Organisation
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        {...register("tenantSlug")}
                        id="tenantSlug"
                        type="text"
                        placeholder="mon-organisation"
                        className="pl-10 h-11"
                      />
                    </div>
                    {errors.tenantSlug && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive flex items-center gap-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        {errors.tenantSlug.message}
                      </motion.p>
                    )}
                  </div>
                )}

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm cursor-pointer group">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                    />
                    <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                      {t("rememberMe")}
                    </span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors hover:underline"
                  >
                    {t("forgotPassword")}
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={useMock ? mockLoginMutation.isPending : loginMutation.isPending}
                  className="w-full h-11 bg-primary hover:bg-primary/90 font-semibold text-base group"
                >
                  {(useMock ? mockLoginMutation.isPending : loginMutation.isPending) ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <LogIn className="h-5 w-5" />
                      </motion.div>
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      {t("login")}
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground font-medium">
                    Nouveau sur GestiCash ?
                  </span>
                </div>
              </div>

              {/* Sign Up Link */}
              <Link href="/register">
                <Button
                  variant="outline"
                  className="w-full h-11 font-semibold text-base border-2 hover:bg-secondary/10 hover:border-secondary"
                >
                  {t("register")}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link
              href="/"
              className="font-medium hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              ← Retour à l'accueil
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Branding & Features */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary via-primary to-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Gérez votre business en toute sérénité
            </h2>
            <p className="text-xl text-white/90 mb-8">
              La solution complète pour maîtriser vos finances, vos ventes et votre stock
            </p>

            <div className="space-y-4">
              {[
                "Suivi en temps réel de votre trésorerie",
                "Gestion COD simplifiée et efficace",
                "Rapports détaillés et analytics avancés",
                "Multi-magasins et multi-utilisateurs",
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg text-white/95">{feature}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="mt-12 p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <HiSparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    30 jours d'essai gratuit
                  </h3>
                  <p className="text-white/80 text-sm">
                    Testez toutes les fonctionnalités sans carte bancaire
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
