"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { motion } from "framer-motion";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Building2, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2,
  User,
  Shield,
  Zap
} from "lucide-react";
import { 
  HiSparkles, 
  HiCreditCard, 
  HiBolt, 
  HiGlobeAlt 
} from "react-icons/hi2";
import Link from "next/link";
import Image from "next/image";
import { z } from "zod";

// Schema de validation
const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  confirmPassword: z.string(),
  tenantSlug: z.string()
    .min(3, "Le nom de l'organisation doit contenir au moins 3 caractères")
    .regex(/^[a-z0-9-]+$/, "Uniquement lettres minuscules, chiffres et tirets"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions d'utilisation",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterInput = z.infer<typeof registerSchema>;

// Password strength indicator
function getPasswordStrength(password: string): { strength: number; label: string; color: string } {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  if (strength <= 2) return { strength: 1, label: "Faible", color: "bg-red-500" };
  if (strength <= 4) return { strength: 2, label: "Moyen", color: "bg-yellow-500" };
  return { strength: 3, label: "Fort", color: "bg-green-500" };
}

export default function RegisterPage() {
  const t = useTranslations("auth");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, label: "", color: "" });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      tenantSlug: "",
      acceptTerms: false,
    },
  });

  const password = watch("password");

  // Update password strength indicator
  useState(() => {
    if (password) {
      setPasswordStrength(getPasswordStrength(password));
    } else {
      setPasswordStrength({ strength: 0, label: "", color: "" });
    }
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      // TODO: Implement registration API call
      console.log("Registration data:", data);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
      // Redirect to dashboard or login
    } catch (error) {
      setError("root", { message: "Une erreur s'est produite. Veuillez réessayer." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8 bg-background py-12">
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
                Créer un compte
              </CardTitle>
              <CardDescription className="text-center">
                Commencez votre essai gratuit de 30 jours
              </CardDescription>
            </CardHeader>
            
            <CardContent>
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">
                    Nom complet
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      {...register("name")}
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className="pl-10 h-11"
                    />
                  </div>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive flex items-center gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {errors.name.message}
                    </motion.p>
                  )}
                </div>

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

                {/* Tenant Slug */}
                <div className="space-y-2">
                  <Label htmlFor="tenantSlug" className="text-sm font-semibold">
                    Nom de votre organisation
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      {...register("tenantSlug")}
                      id="tenantSlug"
                      type="text"
                      placeholder="mon-entreprise"
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
                  <p className="text-xs text-muted-foreground">
                    Sera utilisé dans votre URL : gesticash.com/<span className="font-semibold">mon-entreprise</span>
                  </p>
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
                      onChange={(e) => {
                        register("password").onChange(e);
                        setPasswordStrength(getPasswordStrength(e.target.value));
                      }}
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
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              level <= passwordStrength.strength
                                ? passwordStrength.color
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Force du mot de passe: <span className="font-semibold">{passwordStrength.label}</span>
                      </p>
                    </div>
                  )}
                  
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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold">
                    Confirmer le mot de passe
                  </Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      {...register("confirmPassword")}
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive flex items-center gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {errors.confirmPassword.message}
                    </motion.p>
                  )}
                </div>

                {/* Terms & Conditions */}
                <div className="space-y-2">
                  <label className="flex items-start gap-3 text-sm cursor-pointer group">
                    <input
                      {...register("acceptTerms")}
                      type="checkbox"
                      className="h-4 w-4 mt-0.5 rounded border-input accent-primary cursor-pointer"
                    />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                      J'accepte les{" "}
                      <Link href="/terms" className="text-primary hover:underline font-semibold">
                        conditions d'utilisation
                      </Link>{" "}
                      et la{" "}
                      <Link href="/privacy" className="text-primary hover:underline font-semibold">
                        politique de confidentialité
                      </Link>
                    </span>
                  </label>
                  {errors.acceptTerms && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive flex items-center gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {errors.acceptTerms.message}
                    </motion.p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-primary hover:bg-primary/90 font-semibold text-base group"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <UserPlus className="h-5 w-5" />
                      </motion.div>
                      Création du compte...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                      Créer mon compte
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
                    Déjà un compte ?
                  </span>
                </div>
              </div>

              {/* Sign In Link */}
              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full h-11 font-semibold text-base border-2 hover:bg-secondary/10 hover:border-secondary"
                >
                  Se connecter
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

      {/* Right Side - Branding & Benefits */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-secondary via-secondary to-primary relative overflow-hidden">
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
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 mb-6">
              <Zap className="h-5 w-5 text-yellow-300" />
              <span className="text-sm font-semibold">Offre de lancement</span>
            </div>

            <h2 className="text-4xl font-bold mb-6">
              Démarrez gratuitement dès aujourd'hui
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Rejoignez des centaines d'entrepreneurs qui ont repris le contrôle de leur business
            </p>

            <div className="space-y-4 mb-8">
              {[
                { icon: HiSparkles, text: "30 jours d'essai gratuit" },
                { icon: HiCreditCard, text: "Aucune carte bancaire requise" },
                { icon: HiBolt, text: "Configuration en 5 minutes" },
                { icon: HiGlobeAlt, text: "Support en français inclus" },
              ].map((benefit, idx) => {
                const IconComponent = benefit.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg text-white/95">{benefit.text}</span>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
            >
              <h3 className="font-semibold text-lg mb-4">
                Ce qui est inclus dans l'essai gratuit :
              </h3>
              <ul className="space-y-2 text-white/90">
                {[
                  "Toutes les fonctionnalités Pro",
                  "Support prioritaire",
                  "Formation personnalisée",
                  "Sans engagement",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
