"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useTenantId } from "@/shared/tenant/store";
import {
  useMockCashSessions,
  useMockOpenCashSessionQuery,
  useMockCashTransactions,
  useMockOpenCashSession,
  useMockCloseCashSession,
  useMockAddCashTransaction,
  isMockEnabled,
} from "@/shared/mock";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  DollarSign,
  Plus,
  X,
  ArrowDownCircle,
  ArrowUpCircle,
  Lock,
  Unlock,
  Loader2,
  Receipt,
} from "lucide-react";
import { formatAmount, formatDateTime } from "@/shared/utils";

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 shrink-0">{label}</span>
      <span className="text-sm text-zinc-900 dark:text-zinc-100 text-right break-all">{value}</span>
    </div>
  );
}

export default function CashPage() {
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [openingBalance, setOpeningBalance] = useState("");
  const [closingBalance, setClosingBalance] = useState("");
  const [addTxType, setAddTxType] = useState<"in" | "out">("in");
  const [addTxAmount, setAddTxAmount] = useState("");
  const [addTxLabel, setAddTxLabel] = useState("");

  const tenantId = useTenantId();
  const mockEnabled = isMockEnabled();

  const { data: sessionsData, isLoading: sessionsLoading } = useMockCashSessions({ limit: 50 });
  const { data: openSession, isLoading: openLoading } = useMockOpenCashSessionQuery();
  const { data: transactions = [], isLoading: txLoading } = useMockCashTransactions(openSession?.id ?? null);

  const openCashSession = useMockOpenCashSession();
  const closeCashSession = useMockCloseCashSession();
  const addCashTx = useMockAddCashTransaction(openSession?.id ?? null);

  const sessions = sessionsData?.data ?? [];
  const currentBalance = openSession
    ? openSession.openingBalance + openSession.totalIn - openSession.totalOut
    : 0;

  const handleOpenSession = async () => {
    const balance = parseFloat(openingBalance.replace(/\s/g, "").replace(",", "."));
    if (Number.isNaN(balance) || balance < 0) return;
    await openCashSession.mutateAsync({ openingBalance: balance });
    setShowOpenModal(false);
    setOpeningBalance("");
  };

  const handleCloseSession = async () => {
    if (!openSession) return;
    const balance = parseFloat(closingBalance.replace(/\s/g, "").replace(",", "."));
    if (Number.isNaN(balance)) return;
    await closeCashSession.mutateAsync({
      sessionId: openSession.id,
      closingBalance: balance,
    });
    setShowCloseModal(false);
    setClosingBalance("");
  };

  const handleAddTx = async () => {
    const amount = parseFloat(addTxAmount.replace(/\s/g, "").replace(",", "."));
    if (Number.isNaN(amount) || amount <= 0 || !addTxLabel.trim()) return;
    await addCashTx.mutateAsync({
      type: addTxType,
      amount,
      label: addTxLabel.trim(),
    });
    setShowAddTxModal(false);
    setAddTxAmount("");
    setAddTxLabel("");
  };

  if (!mockEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 bg-clip-text text-transparent mb-2 tracking-tight">Caisse</h1>
          <p className="text-zinc-500 text-sm lg:text-base dark:text-zinc-400 font-medium">
            Gestion des encaissements et de la trésorerie. Activez le mode démo ou connectez le backend.
          </p>
        </div>
        <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl">
          <CardContent className="p-16 text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl animate-pulse" />
              <div className="relative p-6 rounded-full bg-gradient-to-br from-emerald-500/10 to-green-500/10">
                <DollarSign className="h-16 w-16 text-zinc-400 dark:text-zinc-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">Aucune donnée disponible</p>
            <p className="text-sm text-zinc-500">Activez le mode démo ou connectez le backend.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessionsLoading && !sessions.length) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 dark:from-black dark:via-zinc-950 dark:to-black">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500 mx-auto" />
            <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-2 border-emerald-500/30" />
          </div>
          <p className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
            Chargement de la caisse...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/30 to-green-600/30 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 p-3 shadow-2xl shadow-emerald-500/20 ring-2 ring-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                  <DollarSign className="h-full w-full text-emerald-400 dark:text-emerald-500" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 bg-clip-text text-transparent mb-2 tracking-tight">
                  Caisse
                </h1>
                <p className="text-zinc-500 text-sm lg:text-base dark:text-zinc-400 font-medium">
                  Encaissements, décaissements et sessions de caisse
                </p>
              </div>
            </div>
            {!openSession ? (
              <Button
                onClick={() => setShowOpenModal(true)}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/20 px-6 py-2.5 font-semibold transition-all duration-200 hover:scale-105 group"
              >
                <Unlock className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Ouvrir la caisse
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowAddTxModal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/20 font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Encaissement / Dépense
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setClosingBalance(String(currentBalance));
                    setShowCloseModal(true);
                  }}
                  className="border-amber-500/50 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Fermer la caisse
                </Button>
              </div>
            )}
          </div>

          {openSession && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-emerald-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent mb-1">
                    {formatAmount(openSession.openingBalance)} FCFA
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">Ouverture</p>
                </CardContent>
              </Card>
              <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-green-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                      <ArrowDownCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-1">
                    {formatAmount(openSession.totalIn)} FCFA
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">Entrées</p>
                </CardContent>
              </Card>
              <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-red-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-rose-500/20">
                      <ArrowUpCircle className="h-4 w-4 text-red-500" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent mb-1">
                    {formatAmount(openSession.totalOut)} FCFA
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">Sorties</p>
                </CardContent>
              </Card>
              <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 hover:border-emerald-500/40 border-emerald-500/20 transition-all duration-500 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20">
                      <Receipt className="h-4 w-4 text-emerald-500" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent mb-1">
                    {formatAmount(currentBalance)} FCFA
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">Solde actuel</p>
                </CardContent>
              </Card>
            </div>
          )}

          {openSession && (
            <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl mb-6 overflow-hidden">
              <CardContent className="p-0">
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Mouvements de la session
                  </h3>
                  <span className="text-xs text-zinc-500">
                    Ouverte le {formatDateTime(openSession.openedAt)}
                  </span>
                </div>
                {txLoading ? (
                  <div className="p-8 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500">
                    Aucun mouvement. Cliquez sur &quot;Encaissement / Dépense&quot; pour ajouter.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                      <tr className="border-b border-zinc-200/80 bg-gradient-to-r from-zinc-50 to-white dark:border-zinc-900/50 dark:from-zinc-950/50 dark:to-zinc-900/30">
                        <th className="px-6 py-3 text-left text-xs font-bold text-zinc-700 uppercase dark:text-zinc-300">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-zinc-600 uppercase">Libellé</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-zinc-600 uppercase">Type</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-zinc-600 uppercase">Montant</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="group hover:bg-gradient-to-r hover:from-emerald-500/5 hover:to-green-500/5 transition-all duration-300">
                            <td className="px-6 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                              {formatDateTime(tx.createdAt)}
                            </td>
                            <td className="px-6 py-3 font-medium text-zinc-900 dark:text-zinc-100">{tx.label}</td>
                            <td className="px-6 py-3">
                              {tx.type === "in" ? (
                                <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                                  <ArrowDownCircle className="h-4 w-4" /> Entrée
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                                  <ArrowUpCircle className="h-4 w-4" /> Sortie
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-3 text-right font-medium">
                              <span className={tx.type === "in" ? "text-green-600" : "text-red-600"}>
                                {tx.type === "in" ? "+" : "-"} {formatAmount(tx.amount)} FCFA
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-emerald-500/5 to-green-500/5">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Historique des sessions</h3>
                <p className="text-xs text-zinc-500">Sessions ouvertes et fermées</p>
              </div>
              {sessions.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">Aucune session.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-200/80 bg-gradient-to-r from-zinc-50 to-white dark:border-zinc-900/50 dark:from-zinc-950/50 dark:to-zinc-900/30">
                        <th className="px-6 py-3 text-left text-xs font-bold text-zinc-700 uppercase dark:text-zinc-300">Ouverture</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-zinc-600 uppercase">Fermeture</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-zinc-600 uppercase">Solde ouverture</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-zinc-600 uppercase">Solde clôture</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-zinc-600 uppercase">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                      {sessions.map((s) => (
                        <tr key={s.id} className="group hover:bg-gradient-to-r hover:from-emerald-500/5 hover:to-green-500/5 transition-all duration-300">
                          <td className="px-6 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                            {formatDateTime(s.openedAt)}
                          </td>
                          <td className="px-6 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                            {s.closedAt ? formatDateTime(s.closedAt) : "—"}
                          </td>
                          <td className="px-6 py-3 text-right font-medium">{formatAmount(s.openingBalance)} FCFA</td>
                          <td className="px-6 py-3 text-right font-medium">
                            {s.closingBalance != null ? `${formatAmount(s.closingBalance)} FCFA` : "—"}
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                s.status === "open"
                                  ? "bg-green-500/20 text-green-700 dark:text-green-400"
                                  : "bg-zinc-500/20 text-zinc-700 dark:text-zinc-400"
                              }`}
                            >
                              {s.status === "open" ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                              {s.status === "open" ? "Ouverte" : "Fermée"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal ouvrir caisse */}
        {showOpenModal && typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setShowOpenModal(false)}
            >
              <Card className="relative w-full max-w-md bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-t-xl">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Ouvrir la caisse</h2>
                    <Button variant="ghost" size="icon" onClick={() => setShowOpenModal(false)}><X className="h-5 w-5" /></Button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <Label>Solde d&apos;ouverture (FCFA)</Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={openingBalance}
                        onChange={(e) => setOpeningBalance(e.target.value)}
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" className="flex-1" onClick={() => setShowOpenModal(false)}>Annuler</Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/20 font-semibold"
                        onClick={handleOpenSession}
                        disabled={openCashSession.isPending || !openingBalance.trim()}
                      >
                        {openCashSession.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ouvrir"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>,
            document.body
          )}

        {/* Modal fermer caisse */}
        {showCloseModal && openSession && typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setShowCloseModal(false)}
            >
              <Card className="relative w-full max-w-md bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-t-xl">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Fermer la caisse</h2>
                    <Button variant="ghost" size="icon" onClick={() => setShowCloseModal(false)}><X className="h-5 w-5" /></Button>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Solde calculé : <strong>{formatAmount(currentBalance)} FCFA</strong>. Ajustez si besoin avant clôture.
                    </p>
                    <div>
                      <Label>Solde de clôture (FCFA)</Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={closingBalance}
                        onChange={(e) => setClosingBalance(e.target.value)}
                        placeholder={String(currentBalance)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" className="flex-1" onClick={() => setShowCloseModal(false)}>Annuler</Button>
                      <Button
                        className="flex-1 bg-amber-600 hover:bg-amber-700"
                        onClick={handleCloseSession}
                        disabled={closeCashSession.isPending || !closingBalance.trim()}
                      >
                        {closeCashSession.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fermer la caisse"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>,
            document.body
          )}

        {/* Modal ajout mouvement */}
        {showAddTxModal && typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setShowAddTxModal(false)}
            >
              <Card className="relative w-full max-w-md bg-gradient-to-br from-white via-white to-zinc-50/50 border-zinc-200/80 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-900/30 dark:border-zinc-900/50 shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                <CardContent className="p-0">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-t-xl">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Encaissement / Dépense</h2>
                    <Button variant="ghost" size="icon" onClick={() => setShowAddTxModal(false)}><X className="h-5 w-5" /></Button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <Label>Type</Label>
                      <select
                        value={addTxType}
                        onChange={(e) => setAddTxType(e.target.value as "in" | "out")}
                        className="mt-1 w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3"
                      >
                        <option value="in">Entrée (encaissement)</option>
                        <option value="out">Sortie (dépense)</option>
                      </select>
                    </div>
                    <div>
                      <Label>Montant (FCFA)</Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={addTxAmount}
                        onChange={(e) => setAddTxAmount(e.target.value)}
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Libellé</Label>
                      <Input
                        value={addTxLabel}
                        onChange={(e) => setAddTxLabel(e.target.value)}
                        placeholder="Ex: Vente boutique"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" className="flex-1" onClick={() => setShowAddTxModal(false)}>Annuler</Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/20 font-semibold"
                        onClick={handleAddTx}
                        disabled={addCashTx.isPending || !addTxAmount.trim() || !addTxLabel.trim()}
                      >
                        {addCashTx.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>,
            document.body
          )}
      </div>
    </div>
  );
}
