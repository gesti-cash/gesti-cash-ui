"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2,
  Send,
  KeyRound,
  Shield
} from "lucide-react";
import { 
  HiShieldCheck, 
  HiClock, 
  HiEnvelope, 
  HiLockClosed,
  HiLightBulb 
} from "react-icons/hi2";
import Link from "next/link";
import Image from "next/image";
import { z } from "zod";

// Schema de validation pour l'email
const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      // TODO: Implement password reset API call
      console.log("Password reset requested for:", data.email);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
      setEmailSent(true);
    } catch (error) {
      setError("root", { message: "Une erreur s'est produite. Veuillez réessayer." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      const email = getValues("email");
      console.log("Resending email to:", email);
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
      // Show success message
    } catch (error) {
      console.error("Error resending email:", error);
    } finally {
      setIsLoading(false);
    }
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
            <AnimatePresence mode="wait">
              {!emailSent ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader className="space-y-2 pb-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <KeyRound className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">
                      Mot de passe oublié ?
                    </CardTitle>
                    <CardDescription className="text-center">
                      Pas de problème. Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
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
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold">
                          Adresse email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            {...register("email")}
                            id="email"
                            type="email"
                            placeholder="vous@exemple.com"
                            className="pl-10 h-11"
                            autoFocus
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
                              <Send className="h-5 w-5" />
                            </motion.div>
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            Envoyer le lien de réinitialisation
                          </>
                        )}
                      </Button>

                      {/* Back to Login */}
                      <Link href="/login">
                        <Button
                          variant="ghost"
                          className="w-full h-11 font-medium"
                          type="button"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Retour à la connexion
                        </Button>
                      </Link>
                    </form>
                  </CardContent>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader className="space-y-2 pb-6">
                    <div className="mx-auto mb-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
                      >
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </motion.div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">
                      Email envoyé !
                    </CardTitle>
                    <CardDescription className="text-center">
                      Nous avons envoyé un lien de réinitialisation à <strong>{getValues("email")}</strong>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="rounded-lg bg-muted/50 border p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Prochaines étapes :
                      </h4>
                      <ol className="space-y-2 text-sm text-muted-foreground ml-6">
                        <li className="list-decimal">Vérifiez votre boîte de réception</li>
                        <li className="list-decimal">Cliquez sur le lien dans l'email</li>
                        <li className="list-decimal">Créez un nouveau mot de passe</li>
                        <li className="list-decimal">Connectez-vous avec votre nouveau mot de passe</li>
                      </ol>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                      <p className="mb-3">
                        Vous n'avez pas reçu l'email ?
                      </p>
                      <Button
                        variant="outline"
                        onClick={handleResendEmail}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? "Envoi..." : "Renvoyer l'email"}
                      </Button>
                    </div>

                    <div className="pt-4 border-t">
                      <Link href="/login">
                        <Button
                          variant="ghost"
                          className="w-full font-medium"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Retour à la connexion
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Besoin d'aide ?{" "}
              <Link
                href="/contact"
                className="font-semibold text-primary hover:underline"
              >
                Contactez notre support
              </Link>
            </p>
          </motion.div>

          {/* Back to Home */}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link
              href="/"
              className="font-medium hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              ← Retour à l'accueil
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Branding & Security Info */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary/90 via-primary to-primary/80 relative overflow-hidden">
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
              <Shield className="h-5 w-5" />
              <span className="text-sm font-semibold">Sécurité maximale</span>
            </div>

            <h2 className="text-4xl font-bold mb-6">
              Votre sécurité est notre priorité
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Nous prenons la protection de vos données très au sérieux
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: HiLockClosed,
                  title: "Chiffrement SSL/TLS",
                  description: "Toutes les communications sont chiffrées de bout en bout"
                },
                {
                  icon: HiShieldCheck,
                  title: "Lien sécurisé",
                  description: "Le lien de réinitialisation expire après 1 heure"
                },
                {
                  icon: HiClock,
                  title: "Validation temporelle",
                  description: "Chaque lien ne peut être utilisé qu'une seule fois"
                },
                {
                  icon: HiEnvelope,
                  title: "Confirmation par email",
                  description: "Vous recevez une notification pour chaque modification"
                },
              ].map((feature, idx) => {
                const IconComponent = feature.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                      <p className="text-white/80 text-sm">{feature.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="mt-12 p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <HiLightBulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Conseil de sécurité
                  </h3>
                  <p className="text-white/80 text-sm">
                    Choisissez un mot de passe unique contenant au moins 8 caractères, 
                    avec des majuscules, minuscules et chiffres. N'utilisez jamais le même 
                    mot de passe sur plusieurs sites.
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
