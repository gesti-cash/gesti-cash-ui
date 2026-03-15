"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  KeyRound,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useResetPassword, resetPasswordSchema, type ResetPasswordInput } from "@/shared/auth";
import { extractApiError } from "@/shared/api/axios";
import { AUTH_ACCROCHE_IMAGE } from "@/shared/constants";

const AuthAccrocheBackground = () => (
  <div className="absolute inset-0 relative">
    <Image
      src={AUTH_ACCROCHE_IMAGE}
      alt=""
      fill
      className="object-cover object-center opacity-[0.08]"
      priority
    />
  </div>
);

const GlowBackground = () => (
  <>
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#4CAF50]/8 rounded-full blur-[120px] pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-[400px] h-[350px] bg-[#1E88E5]/5 rounded-full blur-[100px] pointer-events-none" />
    <div
      className="absolute inset-0 opacity-[0.03] pointer-events-none"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    />
  </>
);

const LogoHeader = () => (
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
);

const PageFooter = () => (
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
);

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const resetMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    setValue,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: tokenFromUrl, password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password");
  const passwordChecks = {
    length: (passwordValue?.length ?? 0) >= 8,
    uppercase: /[A-Z]/.test(passwordValue ?? ""),
    lowercase: /[a-z]/.test(passwordValue ?? ""),
    digit: /\d/.test(passwordValue ?? ""),
  };

  // Inject token
  if (tokenFromUrl) {
    setValue("token", tokenFromUrl);
  }

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      await resetMutation.mutateAsync(data);
      setIsSuccess(true);
    } catch (error) {
      const apiError = extractApiError(error);
      const msg =
        apiError.statusCode === 400
          ? "Token invalide ou expiré. Veuillez demander un nouveau lien."
          : apiError.message;
      setError("root", { message: msg });
    }
  };

  /* No token */
  if (!tokenFromUrl) {
    return (
      <div className="min-h-screen bg-[#060d16] flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <AuthAccrocheBackground />
        <GlowBackground />
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px] relative z-10"
        >
          <LogoHeader />
          <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 shadow-2xl shadow-black/60 text-center">
            <div className="h-14 w-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-7 w-7 text-yellow-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Lien invalide</h1>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Ce lien de réinitialisation est invalide ou manquant. Veuillez en demander un nouveau.
            </p>
            <Link href="/forgot-password">
              <Button className="w-full h-11 bg-[#4CAF50] hover:bg-[#43A047] text-white font-semibold rounded-xl shadow-lg shadow-[#4CAF50]/20">
                Demander un nouveau lien
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="ghost"
                className="w-full h-10 mt-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la connexion
              </Button>
            </Link>
          </div>
          <PageFooter />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060d16] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <AuthAccrocheBackground />
      <GlowBackground />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px] relative z-10"
      >
        <LogoHeader />

        <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              /* ── FORM ── */
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-[#4CAF50]/10 border border-[#4CAF50]/20 flex items-center justify-center mb-4 shadow-lg shadow-[#4CAF50]/5">
                    <ShieldCheck className="h-7 w-7 text-[#4CAF50]" />
                  </div>
                  <h1 className="text-[1.5rem] font-bold text-white leading-tight">
                    Nouveau mot de passe
                  </h1>
                  <p className="text-zinc-400 text-sm mt-2 leading-relaxed max-w-[300px]">
                    Choisissez un mot de passe fort pour sécuriser votre compte.
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
                  <input {...register("token")} type="hidden" />

                  {/* Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm font-medium text-zinc-300">
                      Nouveau mot de passe
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        {...register("password")}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-11 h-11 bg-zinc-800/60 border-zinc-700/70 text-white placeholder:text-zinc-600 focus-visible:border-[#4CAF50]/60 focus-visible:ring-[#4CAF50]/15 rounded-xl transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-300">
                      Confirmer le mot de passe
                    </Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        {...register("confirmPassword")}
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-11 h-11 bg-zinc-800/60 border-zinc-700/70 text-white placeholder:text-zinc-600 focus-visible:border-[#4CAF50]/60 focus-visible:ring-[#4CAF50]/15 rounded-xl transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Password hints – reflètent la notice et la validation en temps réel */}
                  <div className="bg-zinc-800/40 border border-zinc-700/40 rounded-xl p-3 space-y-1.5">
                    <p className="text-xs text-zinc-500 font-medium mb-2">Le mot de passe doit contenir :</p>
                    {[
                      { label: "Au moins 8 caractères", ok: passwordChecks.length },
                      { label: "Une lettre majuscule", ok: passwordChecks.uppercase },
                      { label: "Une lettre minuscule", ok: passwordChecks.lowercase },
                      { label: "Un chiffre", ok: passwordChecks.digit },
                    ].map(({ label, ok }, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {ok ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#4CAF50] flex-shrink-0" />
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-zinc-600 flex-shrink-0" />
                        )}
                        <span className={`text-xs ${ok ? "text-zinc-400" : "text-zinc-500"}`}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="submit"
                    disabled={resetMutation.isPending}
                    className="w-full h-11 bg-[#4CAF50] hover:bg-[#43A047] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#4CAF50]/20"
                  >
                    {resetMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </motion.div>
                        Réinitialisation...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Réinitialiser le mot de passe
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
              /* ── SUCCESS ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                  className="h-14 w-14 rounded-2xl bg-[#4CAF50]/15 border border-[#4CAF50]/25 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#4CAF50]/10"
                >
                  <CheckCircle2 className="h-7 w-7 text-[#4CAF50]" />
                </motion.div>
                <h1 className="text-[1.5rem] font-bold text-white leading-tight mb-2">
                  Mot de passe mis à jour !
                </h1>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
                </p>
                <Link href="/login">
                  <Button className="w-full h-11 bg-[#4CAF50] hover:bg-[#43A047] text-white font-semibold rounded-xl shadow-lg shadow-[#4CAF50]/20">
                    Aller à la connexion
                  </Button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <PageFooter />
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#060d16] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-zinc-800" />
            <div className="h-4 w-32 bg-zinc-800 rounded" />
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
