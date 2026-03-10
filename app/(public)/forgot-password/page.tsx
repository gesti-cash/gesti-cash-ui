"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Send,
  KeyRound,
  Zap,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useForgotPassword, forgotPasswordSchema, type ForgotPasswordInput } from "@/shared/auth";
import { AUTH_ACCROCHE_IMAGE } from "@/shared/constants";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [emailSent, setEmailSent] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await forgotPasswordMutation.mutateAsync(data);
      setEmailSent(true);
    } catch {
      setError("root", { message: "Une erreur s'est produite. Veuillez réessayer." });
    }
  };

  const handleResendEmail = async () => {
    const email = getValues("email");
    if (!email) return;
    try {
      await forgotPasswordMutation.mutateAsync({ email });
    } catch {
      /* silent */
    }
  };

  return (
    <div className="min-h-screen bg-[#060d16] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Image d'accroche en arrière-plan */}
      <div className="absolute inset-0 relative">
        <Image
          src={AUTH_ACCROCHE_IMAGE}
          alt=""
          fill
          className="object-cover object-center opacity-[0.08]"
          priority
        />
      </div>
      {/* Background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#4CAF50]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[350px] bg-[#1E88E5]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-11 w-11 rounded-xl bg-[#4CAF50]/15 border border-[#4CAF50]/25 flex items-center justify-center shadow-lg shadow-[#4CAF50]/10">
              <Image
                src="/logo/logo.png"
                alt="GestiCash"
                width={30}
                height={30}
                className="h-7 w-7 object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">GestiCash</span>
          </div>
          <p className="text-sm text-zinc-500">Votre argent, enfin sous contrôle</p>
        </motion.div>

        {/* Card */}
        <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
          <AnimatePresence mode="wait">
            {!emailSent ? (
              /* ── FORM STATE ── */
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                {/* Icon + heading */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-[#4CAF50]/10 border border-[#4CAF50]/20 flex items-center justify-center mb-4 shadow-lg shadow-[#4CAF50]/5">
                    <KeyRound className="h-7 w-7 text-[#4CAF50]" />
                  </div>
                  <h1 className="text-[1.5rem] font-bold text-white leading-tight">
                    Mot de passe oublié ?
                  </h1>
                  <p className="text-zinc-400 text-sm mt-2 leading-relaxed max-w-[300px]">
                    Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                  </p>
                </div>

                {/* Error */}
                {errors.root && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 flex items-start gap-3"
                  >
                    <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-400 leading-snug">{errors.root.message}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium text-zinc-300">
                      Adresse email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        {...register("email")}
                        id="email"
                        type="email"
                        placeholder="vous@exemple.com"
                        autoFocus
                        className="pl-10 h-11 bg-zinc-800/60 border-zinc-700/70 text-white placeholder:text-zinc-600 focus-visible:border-[#4CAF50]/60 focus-visible:ring-[#4CAF50]/15 rounded-xl transition-colors"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.email.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={forgotPasswordMutation.isPending}
                    className="w-full h-11 bg-[#4CAF50] hover:bg-[#43A047] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#4CAF50]/20"
                  >
                    {forgotPasswordMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Send className="h-4 w-4" />
                        </motion.div>
                        Envoi en cours...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Envoyer le lien de réinitialisation
                      </span>
                    )}
                  </Button>

                  <Link href="/login">
                    <Button
                      variant="ghost"
                      type="button"
                      className="w-full h-10 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl font-medium transition-all"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour à la connexion
                    </Button>
                  </Link>
                </form>
              </motion.div>
            ) : (
              /* ── SUCCESS STATE ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                <div className="flex flex-col items-center text-center mb-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                    className="h-14 w-14 rounded-2xl bg-[#4CAF50]/15 border border-[#4CAF50]/25 flex items-center justify-center mb-4 shadow-lg shadow-[#4CAF50]/10"
                  >
                    <CheckCircle2 className="h-7 w-7 text-[#4CAF50]" />
                  </motion.div>
                  <h1 className="text-[1.5rem] font-bold text-white leading-tight">
                    Email envoyé !
                  </h1>
                  <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                    Nous avons envoyé un lien à{" "}
                    <span className="text-white font-medium">{getValues("email")}</span>
                  </p>
                </div>

                {/* Steps */}
                <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 mb-5 space-y-3">
                  {[
                    "Vérifiez votre boîte de réception",
                    "Cliquez sur le lien de réinitialisation",
                    "Créez votre nouveau mot de passe",
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-[#4CAF50]/15 border border-[#4CAF50]/25 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-[#4CAF50] font-bold">{i + 1}</span>
                      </div>
                      <span className="text-sm text-zinc-300">{step}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-zinc-600 text-center mb-4">
                  Vérifiez vos spams si vous ne trouvez pas l&apos;email. Le lien expire dans 1h.
                </p>

                <button
                  onClick={handleResendEmail}
                  disabled={forgotPasswordMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 h-10 text-sm text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Renvoyer l&apos;email
                </button>

                <Link href="/login">
                  <Button
                    variant="outline"
                    className="w-full h-11 border-zinc-700/80 bg-transparent text-zinc-300 hover:bg-zinc-800/60 hover:text-white hover:border-zinc-600 rounded-xl font-medium transition-all mt-2"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à la connexion
                  </Button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center justify-center gap-2"
        >
          <Zap className="h-3.5 w-3.5 text-[#4CAF50]/60" />
          <span className="text-xs text-zinc-600">Sécurisé & chiffré</span>
          <span className="text-zinc-700">·</span>
          <Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            Retour à l&apos;accueil
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
