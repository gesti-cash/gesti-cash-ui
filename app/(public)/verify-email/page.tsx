"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Mail,
  Loader2,
  Zap,
  Send,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useVerifyEmail, useResendVerification } from "@/shared/auth";
import { extractApiError } from "@/shared/api/axios";
import { Input } from "@/shared/ui/input";
import { AUTH_ACCROCHE_IMAGE } from "@/shared/constants";

type Status = "idle" | "loading" | "success" | "error";

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

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");
  const [resendEmailInput, setResendEmailInput] = useState("");
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();

  useEffect(() => {
    if (!tokenFromUrl) return;
    let cancelled = false;
    setStatus("loading");
    verifyMutation
      .mutateAsync({ token: tokenFromUrl })
      .then(() => {
        if (!cancelled) setStatus("success");
      })
      .catch((error) => {
        if (!cancelled) {
          const apiError = extractApiError(error);
          setErrorMessage(
            apiError.statusCode === 400
              ? "Token invalide ou expiré. Vérifiez le lien reçu par email ou demandez-en un nouveau."
              : apiError.message
          );
          setStatus("error");
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenFromUrl]);

  /* ── NO TOKEN : Confirmez votre email (après login/register) + relance ── */
  if (!tokenFromUrl) {
    const emailFromQuery = searchParams.get("email") ?? "";
    const emailToResend = emailFromQuery || resendEmailInput.trim();
    const handleResend = async () => {
      setResendError("");
      setResendSuccess(false);
      if (!emailToResend) {
        setResendError("Veuillez saisir votre adresse email.");
        return;
      }
      try {
        await resendMutation.mutateAsync({ email: emailToResend });
        setResendSuccess(true);
        setResendError("");
      } catch (err) {
        const apiError = extractApiError(err);
        setResendError(apiError.message || "Impossible d'envoyer l'email. Réessayez plus tard.");
        setResendSuccess(false);
      }
    };
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
            <div className="h-14 w-14 rounded-2xl bg-[#1E88E5]/10 border border-[#1E88E5]/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-7 w-7 text-[#1E88E5]" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Confirmez votre adresse email</h1>
            <p className="text-zinc-400 text-sm leading-relaxed mb-2">
              Vous devez confirmer votre adresse email pour accéder à votre compte. Consultez votre boîte de réception et cliquez sur le lien envoyé. Le lien peut expirer : vous pouvez en demander un nouveau ci-dessous.
            </p>
            {emailFromQuery ? (
              <p className="text-zinc-300 text-sm font-medium mb-4">Lien envoyé à : <span className="text-white">{emailFromQuery}</span></p>
            ) : (
              <p className="text-zinc-500 text-sm mb-4">Si vous ne voyez pas l&apos;email, vérifiez vos spams.</p>
            )}
            <div className="mb-6 space-y-3 text-left">
              {!emailFromQuery && (
                <div>
                  <label htmlFor="resend-email" className="block text-xs font-medium text-zinc-400 mb-1.5">Votre adresse email</label>
                  <Input
                    id="resend-email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={resendEmailInput}
                    onChange={(e) => setResendEmailInput(e.target.value)}
                    className="h-10 bg-zinc-800/80 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl"
                  />
                </div>
              )}
              <Button
                type="button"
                onClick={handleResend}
                disabled={resendMutation.isPending || (!emailFromQuery && !emailToResend)}
                className="w-full h-11 bg-[#1E88E5] hover:bg-[#1976D2] text-white font-semibold rounded-xl"
              >
                {resendMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi en cours...</>
                ) : (
                  <><Send className="mr-2 h-4 w-4" /> Renvoyer l&apos;email de vérification</>
                )}
              </Button>
              {resendSuccess && <p className="text-sm text-[#4CAF50] font-medium">Un nouvel email de vérification a été envoyé. Consultez votre boîte de réception (et les spams).</p>}
              {resendError && <p className="text-sm text-red-400 font-medium flex items-center gap-1"><AlertCircle className="h-4 w-4 flex-shrink-0" />{resendError}</p>}
            </div>
            <Link href="/login">
              <Button variant="outline" className="w-full h-11 border-zinc-700/80 bg-transparent text-zinc-300 hover:bg-zinc-800/60 hover:text-white rounded-xl">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la connexion
              </Button>
            </Link>
          </div>
          <PageFooter />
        </motion.div>
      </div>
    );
  }

  /* ── LOADING ── */
  if (status === "loading") {
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
          <div className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-12 shadow-2xl shadow-black/60 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <Loader2 className="h-10 w-10 text-[#4CAF50]" />
            </motion.div>
            <p className="text-white font-semibold text-lg mb-1">Vérification en cours...</p>
            <p className="text-zinc-500 text-sm">Nous vérifions votre adresse email.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── SUCCESS / ERROR ── */
  const isSuccess = status === "success";

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
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
            className={`h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
              isSuccess
                ? "bg-[#4CAF50]/15 border border-[#4CAF50]/25 shadow-[#4CAF50]/10"
                : "bg-red-500/10 border border-red-500/20 shadow-red-500/5"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-7 w-7 text-[#4CAF50]" />
            ) : (
              <AlertCircle className="h-7 w-7 text-red-400" />
            )}
          </motion.div>

          <h1 className="text-[1.5rem] font-bold text-white leading-tight mb-2">
            {isSuccess ? "Email vérifié !" : "Échec de la vérification"}
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            {isSuccess
              ? "Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant vous connecter."
              : errorMessage}
          </p>

          {isSuccess ? (
            <Link href="/login">
              <Button className="w-full h-11 bg-[#4CAF50] hover:bg-[#43A047] text-white font-semibold rounded-xl shadow-lg shadow-[#4CAF50]/20">
                Aller à la connexion
              </Button>
            </Link>
          ) : (
            <div className="space-y-2">
              <Link href="/forgot-password">
                <Button className="w-full h-11 bg-[#4CAF50] hover:bg-[#43A047] text-white font-semibold rounded-xl shadow-lg shadow-[#4CAF50]/20">
                  Demander un nouveau lien
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full h-11 border-zinc-700/80 bg-transparent text-zinc-300 hover:bg-zinc-800/60 hover:text-white rounded-xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          )}
        </div>

        <PageFooter />
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
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
      <VerifyEmailContent />
    </Suspense>
  );
}
