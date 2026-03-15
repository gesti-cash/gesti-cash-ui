"use client";

import * as React from "react";
import { useUser } from "@/shared/auth/store";
import { useUpdateProfile, useChangePassword } from "@/shared/auth/hooks";
import { UserRole } from "@/shared/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar";
import { Pencil, X, Check, Lock, Gift, Copy, CheckCheck } from "lucide-react";
import { extractApiError } from "@/shared/api/axios";

const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return "Admin Manager";
    case UserRole.MANAGER:
      return "Manager";
    case UserRole.USER:
      return "Utilisateur";
    default:
      return "Utilisateur";
  }
};

const getInitials = (firstName?: string, lastName?: string): string => {
  const f = firstName?.trim();
  const l = lastName?.trim();
  if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
  if (f) return f[0].toUpperCase();
  if (l) return l[0].toUpperCase();
  return "?";
};

export default function ProfilePage() {
  const user = useUser();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const [editing, setEditing] = React.useState(false);
  const [showPasswordForm, setShowPasswordForm] = React.useState(false);
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
  });
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileError, setProfileError] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = React.useState(false);
  const [referralCopied, setReferralCopied] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setForm({ firstName: user.firstName || "", lastName: user.lastName || "" });
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    updateProfile.mutate(
      { firstName: form.firstName.trim(), lastName: form.lastName.trim() },
      {
        onSuccess: () => {
          setEditing(false);
        },
        onError: (err) => {
          setProfileError(extractApiError(err).message);
        },
      }
    );
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      return;
    }
    changePassword.mutate(
      { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword },
      {
        onSuccess: () => {
          setPasswordSuccess(true);
          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
          setShowPasswordForm(false);
        },
        onError: (err) => {
          setPasswordError(extractApiError(err).message);
        },
      }
    );
  };

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <p className="text-zinc-500 dark:text-zinc-400">Chargement du profil…</p>
      </div>
    );
  }

  const fullName = `${user.firstName} ${user.lastName}`.trim() || user.email;
  const initials = getInitials(user.firstName, user.lastName);

  // Code de parrainage : API ou fallback dérivé de l'id pour l'affichage
  const referralCode =
    user.referralCode ?? user.id.replace(/-/g, "").slice(0, 8).toUpperCase();

  const copyReferralCode = () => {
    void navigator.clipboard.writeText(referralCode);
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
        Mon profil
      </h2>

      {/* Carte profil */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={fullName} />
              ) : null}
              <AvatarFallback className="bg-green-500/15 text-lg font-semibold text-green-700 dark:text-green-400">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-zinc-800 dark:text-zinc-100">
                {fullName}
              </CardTitle>
              <CardDescription>{getRoleLabel(user.role)}</CardDescription>
            </div>
          </div>
          {!editing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              Modifier
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(false);
                setForm({ firstName: user.firstName || "", lastName: user.lastName || "" });
                setProfileError(null);
              }}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Annuler
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {editing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {profileError && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  {profileError}
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    placeholder="Prénom"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    placeholder="Nom"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email} disabled className="bg-zinc-50 dark:bg-zinc-900" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  L’email ne peut pas être modifié ici.
                </p>
              </div>
              <Button type="submit" disabled={updateProfile.isPending} className="gap-2">
                <Check className="h-4 w-4" />
                Enregistrer
              </Button>
            </form>
          ) : (
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Prénom
                </dt>
                <dd className="mt-1 text-sm text-zinc-800 dark:text-zinc-100">
                  {user.firstName || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Nom
                </dt>
                <dd className="mt-1 text-sm text-zinc-800 dark:text-zinc-100">
                  {user.lastName || "—"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Email
                </dt>
                <dd className="mt-1 text-sm text-zinc-800 dark:text-zinc-100">
                  {user.email}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Rôle
                </dt>
                <dd className="mt-1 text-sm text-zinc-800 dark:text-zinc-100">
                  {getRoleLabel(user.role)}
                </dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>

      {/* Code de parrainage */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
            <Gift className="h-5 w-5 text-green-500" />
            Mon code de parrainage
          </CardTitle>
          <CardDescription>
            Partagez ce code pour parrainer de nouveaux utilisateurs. Ils pourront l&apos;entrer lors de l&apos;inscription.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <code className="flex-1 min-w-0 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-4 py-3 text-lg font-mono font-semibold text-zinc-800 dark:text-zinc-100 tracking-wider border border-zinc-200 dark:border-zinc-700">
              {referralCode}
            </code>
            <Button
              type="button"
              variant="outline"
              onClick={copyReferralCode}
              className="gap-2 shrink-0"
            >
              {referralCopied ? (
                <>
                  <CheckCheck className="h-4 w-4 text-green-500" />
                  Copié
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copier
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mot de passe */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
            <Lock className="h-5 w-5" />
            Mot de passe
          </CardTitle>
          <CardDescription>
            Modifiez votre mot de passe pour sécuriser votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showPasswordForm ? (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  {passwordError}
                </p>
              )}
              {passwordSuccess && (
                <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400">
                  Mot de passe mis à jour.
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))
                  }
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
                  }
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))
                  }
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={changePassword.isPending}>
                  Changer le mot de passe
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setPasswordError(null);
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowPasswordForm(true);
                setPasswordError(null);
                setPasswordSuccess(false);
              }}
              className="gap-2"
            >
              <Lock className="h-4 w-4" />
              Changer le mot de passe
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
