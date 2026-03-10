"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/shared/ui/button";
import {
  Package,
  DollarSign,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  FileText,
  Building2,
  Lock,
  Zap,
  ShoppingCart,
  ChevronRight,
  Star,
  ArrowRight,
  ArrowLeft,
  Rocket,
  AlertCircle,
  Clock,
  Receipt,
  Users,
  ArrowUpRight,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { motion, useInView } from "framer-motion";
import { useRef, useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({
  end,
  suffix = "",
  prefix = "",
}: {
  end: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const inc = end / (2000 / 16);
    const t = setInterval(() => {
      start += inc;
      if (start >= end) { setCount(end); clearInterval(t); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [isInView, end]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ─── Hero Dashboard Mockup ────────────────────────────────────────────────────
function DashboardMockup() {
  const bars = [35, 55, 42, 78, 52, 90, 65];
  return (
    <div className="relative w-full max-w-[380px] mx-auto">
      {/* Background glow blob */}
      <div className="pointer-events-none absolute -inset-10 rounded-3xl bg-primary/8 blur-2xl" />

      {/* Main dashboard card */}
      <div className="relative rounded-2xl border border-border/50 bg-white dark:bg-card shadow-2xl p-5 z-10 animate-card-glow animate-scan">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground mb-0.5">
              Revenus du mois
            </p>
            <p className="text-2xl font-bold leading-none">
              1 240 000{" "}
              <span className="text-sm font-normal text-muted-foreground">
                FCFA
              </span>
            </p>
            <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 dark:bg-green-900/30 rounded-md px-2 py-0.5">
              <TrendingUp className="h-2.5 w-2.5" />
              +18% vs mois dernier
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-4.5 w-4.5 text-primary" />
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-1.5 h-[68px] mb-1.5">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t-md"
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                backgroundColor:
                  i === 5
                    ? "var(--color-primary)"
                    : "oklch(66% 0.15 145 / 0.18)",
              }}
            />
          ))}
        </div>
        <div className="flex gap-1.5 mb-4">
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <span
              key={i}
              className="flex-1 text-center text-[10px] text-muted-foreground"
            >
              {d}
            </span>
          ))}
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-2 pt-3.5 border-t border-border/50">
          {[
            { label: "Ventes", value: "247", color: "text-primary" },
            { label: "Colis COD", value: "38", color: "text-blue-500" },
            { label: "En stock", value: "1 204", color: "text-amber-500" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating card 1 — Vente confirmée (top-right) */}
      <div className="animate-float-up absolute -top-5 -right-6 z-20 glass-card rounded-xl shadow-lg px-3 py-2.5 flex items-center gap-2.5 w-[195px]">
        <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
          <DollarSign className="h-3.5 w-3.5 text-green-500" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-foreground">
            +85 000 FCFA
          </p>
          <p className="text-[10px] text-muted-foreground">
            Vente confirmée · 2 min
          </p>
        </div>
      </div>

      {/* Floating card 2 — COD livré (bottom-left) */}
      <div className="animate-float-down absolute -bottom-5 -left-6 z-20 glass-card rounded-xl shadow-lg px-3 py-2.5 flex items-center gap-2.5 w-[195px]">
        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Package className="h-3.5 w-3.5 text-blue-500" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-foreground">
            12 colis livrés
          </p>
          <p className="text-[10px] text-muted-foreground">
            Aujourd&apos;hui · COD
          </p>
        </div>
      </div>

      {/* Floating pill — Stock (right middle) */}
      <div className="animate-float-side absolute top-1/2 -right-16 z-20 glass-card rounded-full shadow-lg px-3 py-1.5 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-[11px] font-semibold whitespace-nowrap">
          Stock OK
        </span>
      </div>
    </div>
  );
}

// ─── Feature Mockups ──────────────────────────────────────────────────────────
function FinancesMockup() {
  return (
    <div className="rounded-2xl border border-border/50 bg-white dark:bg-card shadow-xl p-5 w-full max-w-[340px]">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <DollarSign className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold">Trésorerie</p>
          <p className="text-[10px] text-muted-foreground">Mise à jour en direct</p>
        </div>
        <span className="ml-auto text-[10px] font-semibold text-green-600 bg-green-50 rounded px-1.5 py-0.5">
          Live
        </span>
      </div>
      <div className="rounded-xl bg-primary/5 p-4 mb-4">
        <p className="text-[10px] text-muted-foreground mb-0.5">Solde actuel</p>
        <p className="text-xl font-bold">2 840 000 FCFA</p>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "Entrées", value: "+1,2M", color: "text-green-600", bg: "bg-green-50" },
          { label: "Sorties", value: "-380K", color: "text-rose-500", bg: "bg-rose-50" },
          { label: "Profit", value: "+820K", color: "text-primary", bg: "bg-primary/10" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-lg p-2 text-center`}>
            <p className={`text-xs font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {[
          { label: "Vente #247", amount: "+45 000", color: "text-green-600" },
          { label: "Achat fournisseur", amount: "-28 000", color: "text-rose-500" },
          { label: "Vente #246", amount: "+32 000", color: "text-green-600" },
        ].map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.2 + i * 0.08 }}
            className="flex items-center justify-between text-xs rounded-lg border border-border/40 px-3 py-2 animate-row-flash"
          >
            <span className="text-muted-foreground">{t.label}</span>
            <span className={`font-semibold ${t.color}`}>{t.amount} F</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CodMockup() {
  const statuses = [
    { n: "24", label: "Livrés", color: "bg-green-100 text-green-700" },
    { n: "8", label: "En route", color: "bg-blue-100 text-blue-700" },
    { n: "3", label: "Retournés", color: "bg-rose-100 text-rose-600" },
    { n: "3", label: "Pending", color: "bg-amber-100 text-amber-700" },
  ];
  return (
    <div className="rounded-2xl border border-border/50 bg-white dark:bg-card shadow-xl p-5 w-full max-w-[340px]">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <Package className="h-4 w-4 text-blue-500" />
        </div>
        <div>
          <p className="text-xs font-semibold">Suivi COD</p>
          <p className="text-[10px] text-muted-foreground">38 colis actifs</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {statuses.map((s) => (
          <div
            key={s.label}
            className={`${s.color} rounded-xl p-3 text-center`}
          >
            <p className="text-lg font-bold">{s.n}</p>
            <p className="text-[10px] font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {[
          { id: "#CMD-847", city: "Dakar 🇸🇳", status: "Livré ✅", col: "text-green-600" },
          { id: "#CMD-846", city: "Abidjan 🇨🇮", status: "En route 🔄", col: "text-blue-500" },
          { id: "#CMD-845", city: "Bamako 🇲🇱", status: "Retourné ❌", col: "text-rose-500" },
        ].map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.2 + i * 0.09 }}
            className="flex items-center justify-between text-xs rounded-lg border border-border/40 px-3 py-2 animate-row-flash"
          >
            <div>
              <p className="font-semibold">{c.id}</p>
              <p className="text-muted-foreground">{c.city}</p>
            </div>
            <span className={`font-medium ${c.col}`}>{c.status}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StockMockup() {
  const items = [
    { name: "Sac à main noir", qty: 48, status: "ok" },
    { name: "Robe d'été rouge", qty: 3, status: "low" },
    { name: "Chaussures blanches", qty: 0, status: "out" },
    { name: "Sandales beiges", qty: 22, status: "ok" },
  ];
  return (
    <div className="rounded-2xl border border-border/50 bg-white dark:bg-card shadow-xl p-5 w-full max-w-[340px]">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
          <Package className="h-4 w-4 text-amber-500" />
        </div>
        <div>
          <p className="text-xs font-semibold">Inventaire</p>
          <p className="text-[10px] text-muted-foreground">1 204 articles en stock</p>
        </div>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.07 }}
            className="flex items-center justify-between text-xs rounded-lg border border-border/40 px-3 py-2.5"
          >
            <p className="font-medium">{item.name}</p>
            <div className="flex items-center gap-2">
              <span className="font-bold">{item.qty}</span>
              <span
                className={`h-2 w-2 rounded-full ${
                  item.status === "ok"
                    ? "bg-green-400"
                    : item.status === "low"
                    ? "bg-amber-400"
                    : "bg-rose-400"
                }`}
              />
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-3 flex gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-400" /> OK
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> Stock bas
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-rose-400" /> Rupture
        </span>
      </div>
    </div>
  );
}

function AnalyticsMockup() {
  const bars = [45, 62, 38, 75, 58, 82, 70];
  return (
    <div className="rounded-2xl border border-border/50 bg-white dark:bg-card shadow-xl p-5 w-full max-w-[340px]">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
          <BarChart3 className="h-4 w-4 text-purple-500" />
        </div>
        <div>
          <p className="text-xs font-semibold">Analytics</p>
          <p className="text-[10px] text-muted-foreground">Cette semaine</p>
        </div>
      </div>
      <div className="flex items-end gap-1.5 h-[60px] mb-1.5">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t-md"
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 0.55, delay: i * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              backgroundColor:
                i === 5
                  ? "oklch(60% 0.15 290)"
                  : "oklch(60% 0.15 290 / 0.2)",
            }}
          />
        ))}
      </div>
      <div className="flex gap-1.5 mb-4">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <span key={i} className="flex-1 text-center text-[10px] text-muted-foreground">
            {d}
          </span>
        ))}
      </div>
      <p className="text-[11px] font-semibold text-muted-foreground mb-2">
        Top produits
      </p>
      <div className="space-y-2">
        {[
          { name: "Sac à main noir", sales: 45, pct: 85 },
          { name: "Robe d'été rouge", sales: 32, pct: 60 },
          { name: "Chaussures blanches", sales: 28, pct: 52 },
        ].map((p, i) => (
          <div key={i}>
            <div className="flex justify-between text-[11px] mb-0.5">
              <span className="font-medium">{p.name}</span>
              <span className="text-muted-foreground">{p.sales} ventes</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-purple-400"
                initial={{ width: 0 }}
                animate={{ width: `${p.pct}%` }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Testimonials Carousel ────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: "Amadou Diallo",
    role: "E-commerce",
    flag: "🇸🇳",
    city: "Dakar",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amadou",
    text: "Avant GestiCash, je perdais facilement 200 000 FCFA par mois sans comprendre pourquoi. Maintenant je sais exactement où va chaque franc. +40% de CA en 3 mois.",
    rating: 5,
  },
  {
    name: "Fatou Ndiaye",
    role: "Boutique de mode",
    flag: "🇨🇮",
    city: "Abidjan",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou",
    text: "Le suivi COD était un cauchemar. Avec GestiCash, je sais en temps réel combien de colis sont livrés et combien je dois récupérer. Indispensable.",
    rating: 5,
  },
  {
    name: "Moussa Koné",
    role: "Supérette",
    flag: "🇲🇱",
    city: "Bamako",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Moussa",
    text: "La gestion du stock en temps réel m'a sauvé. Plus de ruptures, plus de surstocks. Je commande juste ce qu'il faut, au bon moment.",
    rating: 5,
  },
  {
    name: "Aïcha Traoré",
    role: "Multi-magasins",
    flag: "🇧🇯",
    city: "Cotonou",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aicha",
    text: "3 magasins, c'était impossible de tout suivre. GestiCash m'a donné une vision consolidée. Je gagne 10h par semaine et je dors tranquille.",
    rating: 5,
  },
  {
    name: "Seydou Ouédraogo",
    role: "Grossiste",
    flag: "🇧🇫",
    city: "Ouagadougou",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Seydou",
    text: "Enfin un outil qui comprend mon business. La gestion des fournisseurs et des bons de commande est devenue un jeu d'enfant.",
    rating: 5,
  },
];

function TestimonialsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () =>
      setSelectedIndex(emblaApi.selectedScrollSnap())
    );
  }, [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] min-w-0 pl-4"
            >
              <div className="h-full rounded-2xl border border-border/50 bg-white dark:bg-card p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 group/avatar">
                  <motion.div
                    className="relative h-10 w-10 rounded-full overflow-hidden bg-primary/10 flex-shrink-0 ring-2 ring-transparent group-hover/avatar:ring-primary"
                    whileHover={{ scale: 1.25, rotate: 6 }}
                    transition={{ type: "spring", stiffness: 400, damping: 14 }}
                  >
                    <Image src={t.image} alt={t.name} fill className="object-cover" unoptimized />
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.flag} {t.role} · {t.city}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 justify-center mt-6">
        <button
          onClick={scrollPrev}
          className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-1.5">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === selectedIndex ? "w-6 bg-primary" : "w-1.5 bg-primary/25"
              }`}
            />
          ))}
        </div>
        <button
          onClick={scrollNext}
          className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Features Tab Data ────────────────────────────────────────────────────────
const FEATURE_TABS = [
  {
    id: "finances",
    label: "Finances",
    icon: DollarSign,
    headline: "Maîtrisez chaque franc qui entre et sort",
    desc: "Suivez votre trésorerie en temps réel, réconciliez vos entrées et sorties, et prenez les bonnes décisions sans jamais perdre de vue votre solde réel.",
    points: [
      "Trésorerie en temps réel",
      "Revenus, dépenses, bénéfice net",
      "Rapprochement automatique",
      "Budgets et prévisions",
    ],
    mockup: <FinancesMockup />,
  },
  {
    id: "cod",
    label: "Ventes & COD",
    icon: ShoppingCart,
    headline: "Chaque colis, chaque franc — tracé en temps réel",
    desc: "Fini les colis perdus et les encaissements manqués. GestiCash suit vos commandes COD de l'envoi au remboursement, avec visibilité totale à chaque étape.",
    points: [
      "Statuts colis : livré, en route, retourné",
      "Réconciliation COD automatique",
      "Historique complet par commande",
      "Retours et remboursements",
    ],
    mockup: <CodMockup />,
  },
  {
    id: "stock",
    label: "Stock",
    icon: Package,
    headline: "Sachez toujours ce que vous avez en stock",
    desc: "Alertes automatiques, mouvements tracés, niveaux min/max configurables. Zéro rupture, zéro surstock — vous commandez juste ce qu'il faut.",
    points: [
      "Stock en temps réel par produit",
      "Alertes seuils minimum",
      "Historique des mouvements",
      "Inventaires rapides",
    ],
    mockup: <StockMockup />,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    headline: "Des données claires pour décider vite",
    desc: "Tableaux de bord personnalisés, rapports détaillés, top produits et tendances. Tout ce qu'il faut pour piloter votre croissance avec confiance.",
    points: [
      "Rapports journaliers / mensuels",
      "Top produits et top clients",
      "Analyse de marge par produit",
      "Export Excel / PDF",
    ],
    mockup: <AnalyticsMockup />,
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto px-5 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <motion.div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"
              whileHover={{ scale: 1.18, rotate: 12 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 14 }}
            >
              <Image
                src="/logo/logo.png"
                alt="GestiCash"
                width={22}
                height={22}
                className="h-[22px] w-[22px] object-contain"
              />
            </motion.div>
            <span className="text-base font-bold tracking-tight">
              GestiCash
            </span>
          </div>
          <nav className="hidden gap-0.5 md:flex items-center">
            {[
              ["Fonctionnalités", "#fonctionnalites"],
              ["Tarifs", "#tarifs"],
              ["Comment ça marche", "#comment-ca-marche"],
              ["FAQ", "#faq"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="px-3.5 py-2 text-sm font-medium text-muted-foreground rounded-lg hover:text-foreground hover:bg-muted transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex gap-2 items-center">
            {mounted && (
              <motion.button
                aria-label="Basculer le thème"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 14 }}
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </motion.button>
            )}
            <Button variant="ghost" size="sm" className="font-medium" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button size="sm" className="rounded-lg font-semibold" asChild>
              <Link href="/register">S&apos;inscrire — gratuit</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── HERO — 2-column + floating dashboard ── */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-20 md:pb-32">
        {/* Background layers */}
        <div className="pointer-events-none absolute inset-0 bg-dot-grid" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-primary/8 via-primary/3 to-transparent" />

        {/* Decorative rings (GeniusPay-style) */}
        <div className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full border-2 border-primary/8" />
        <div className="pointer-events-none absolute -top-20 -right-20 h-[380px] w-[380px] rounded-full border border-primary/6" />
        <div className="pointer-events-none absolute top-0 right-0 h-[180px] w-[180px] rounded-full border border-primary/5" />

        {/* Soft color blobs */}
        <div className="pointer-events-none absolute bottom-0 -left-20 h-72 w-72 rounded-full bg-secondary/6 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 left-1/3 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

        <div className="container relative z-10 mx-auto px-5">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-10 items-center">
            {/* Left column — text */}
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-xs font-semibold text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Gestion commerciale &amp; financière · Afrique
                </div>
              </motion.div>

              <motion.h1
                className="mb-5 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-[3.25rem]"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Votre argent,{" "}
                <span className="hero-soft-text">enfin sous contrôle</span>
              </motion.h1>

              <motion.p
                className="mb-8 text-base md:text-lg text-muted-foreground leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                La solution tout-en-un pour e-commerces et PME
                d&apos;Afrique. Flux d&apos;argent, ventes COD, stock —{" "}
                <strong className="text-foreground font-semibold">
                  zéro perte invisible
                </strong>
                .
              </motion.p>

              <motion.div
                className="flex flex-col gap-3 sm:flex-row mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Button
                  size="lg"
                  className="rounded-xl font-semibold px-7 text-base"
                  asChild
                >
                  <Link href="/register">
                    Démarrer gratuitement
                    <ChevronRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl font-semibold text-base border-2"
                >
                  Voir une démo
                </Button>
              </motion.div>

              <motion.div
                className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[
                  "Sans carte bancaire",
                  "En place en 5 min",
                  "Support en français",
                  "30 jours gratuits",
                ].map((b) => (
                  <span key={b} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    {b}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right column — floating dashboard mockup */}
            <motion.div
              className="hidden lg:flex items-center justify-center relative"
              initial={{ opacity: 0, x: 30, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              whileHover={{ scale: 1.03, y: -6 }}
              transition={{ duration: 0.7, delay: 0.2, type: "spring", stiffness: 200, damping: 22 }}
            >
              <DashboardMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAND ── */}
      <div className="border-y border-border/40 bg-white dark:bg-card py-4">
        <div className="container mx-auto px-5">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              Ils nous font confiance :
            </span>
            {[
              "🛍️ E-commerce",
              "👗 Mode & Textile",
              "🏪 Supérettes",
              "📦 Grossistes",
              "💊 Pharmacies",
            ].map((item) => (
              <span key={item} className="font-medium">
                {item}
              </span>
            ))}
            <span className="font-semibold text-primary">+500 boutiques</span>
          </div>
        </div>
      </div>

      {/* ── MARQUEE ── */}
      <div className="border-b border-border/40 bg-muted/20 overflow-hidden py-3">
        <div className="flex animate-marquee gap-10 whitespace-nowrap" aria-hidden="true">
          {[...Array(2)].flatMap((_, set) =>
            [
              "E-commerce", "Boutique mode", "Supérette", "Restaurant",
              "Pharmacie", "Librairie", "Quincaillerie", "Grossiste",
              "Multi-magasins", "Friperie", "Électronique", "Cosmétiques",
              "Alimentation", "Bijouterie", "Import / Export",
            ].map((type, i) => (
              <span
                key={`${set}-${i}`}
                className="inline-flex items-center gap-2.5 text-sm font-medium text-muted-foreground"
              >
                <span className="h-1 w-1 rounded-full bg-primary/40" />
                {type}
              </span>
            ))
          )}
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="relative py-16 overflow-hidden">
        {/* Decorative circle */}
        <div className="pointer-events-none absolute -right-24 top-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full border-2 border-primary/8" />
        <div className="pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 h-[240px] w-[240px] rounded-full border border-primary/6" />
        <div className="pointer-events-none absolute -left-24 top-1/2 -translate-y-1/2 h-[320px] w-[320px] rounded-full bg-primary/4 blur-3xl" />

        <div className="container relative z-10 mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: 500, suffix: "+", label: "Entrepreneurs actifs" },
              { value: 2, suffix: "M+", label: "FCFA gérés / mois" },
              { value: 10, suffix: "K+", label: "Transactions traitées" },
              { value: 99, suffix: "%", label: "Taux de satisfaction" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1.5">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEMS ── */}
      <section className="relative py-20 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-cross-grid opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="container relative z-10 mx-auto px-5">
          <div className="max-w-xl mx-auto text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-rose-500 mb-3">
              Le problème
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Vous perdez de l&apos;argent sans le savoir
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              En moyenne, les entrepreneurs africains perdent 15–20% de leur CA
              à cause d&apos;une gestion fragmentée.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                icon: <AlertCircle className="h-5 w-5 text-rose-500" />,
                title: "Argent qui disparaît",
                desc: "Vous ne savez jamais combien vous avez réellement gagné ou ce qu'il vous reste.",
              },
              {
                icon: <Package className="h-5 w-5 text-rose-500" />,
                title: "Stock désordonné",
                desc: "Ruptures de stock, surstocks, marchandises perdues — impossible de tout suivre.",
              },
              {
                icon: <Receipt className="h-5 w-5 text-rose-500" />,
                title: "COD non maîtrisé",
                desc: "Combien de colis envoyés ? Livrés ? Encaissés ? Aucune visibilité.",
              },
              {
                icon: <DollarSign className="h-5 w-5 text-rose-500" />,
                title: "Pertes invisibles",
                desc: "Vol, erreurs de caisse, frais cachés — vous perdez sans même le savoir.",
              },
              {
                icon: <FileText className="h-5 w-5 text-rose-500" />,
                title: "Gestion manuelle",
                desc: "Cahiers, Excel, WhatsApp — tout dispersé, des heures perdues à recalculer.",
              },
              {
                icon: <Clock className="h-5 w-5 text-rose-500" />,
                title: "Pas de vision claire",
                desc: "Impossible de savoir si vous êtes rentable ou quels produits marchent vraiment.",
              },
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-500/5 p-5 hover:border-rose-200 dark:hover:border-rose-800/60 transition-colors"
              >
                <div className="mb-3">{p.icon}</div>
                <h4 className="text-sm font-semibold mb-1.5">{p.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {p.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — Maketou alternating rows ── */}
      <section id="comment-ca-marche" className="py-20 bg-muted/20">
        <div className="container mx-auto px-5">
          <div className="max-w-xl mx-auto text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Comment ça marche
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              De l&apos;idée au contrôle en 3 étapes
            </h2>
            <p className="text-muted-foreground text-sm">
              Démarrez en quelques minutes, sans formation technique.
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-20">
            {/* Step 1 — text left, visual right */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div>
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold text-sm mb-5">
                  1
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  Inscrivez-vous gratuitement
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  Créez votre compte en 2 minutes. Aucune carte bancaire
                  requise. Accès complet à toutes les fonctionnalités pendant
                  30 jours sans engagement.
                </p>
                <Button variant="outline" className="rounded-xl font-medium" asChild>
                  <Link href="/register">
                    Créer mon compte
                    <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              {/* Step 1 visual — sign up mockup */}
              <div className="flex justify-center md:justify-end">
                <div className="relative w-full max-w-[300px]">
                  <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-primary/5 blur-xl" />
                  <motion.div
                    className="relative rounded-2xl border border-border/50 bg-white dark:bg-card shadow-xl p-5 z-10 img-shimmer-hover animate-float-gentle animate-scan"
                    whileHover={{ y: -10, scale: 1.03, boxShadow: "0 28px 56px -8px oklch(66% 0.15 145 / 0.22)" }}
                    transition={{ type: "spring", stiffness: 280, damping: 20 }}
                  >
                    <p className="text-sm font-bold mb-4">Créer un compte</p>
                    <div className="space-y-3 mb-4">
                      {[
                        { label: "Nom complet", val: "Amadou Diallo" },
                        { label: "Email", val: "amadou@monshop.sn" },
                        { label: "Mot de passe", val: "••••••••" },
                      ].map((f) => (
                        <div key={f.label}>
                          <p className="text-[10px] text-muted-foreground mb-1">{f.label}</p>
                          <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs font-medium">
                            {f.val}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl bg-primary text-primary-foreground text-xs font-semibold text-center py-2.5">
                      S&apos;inscrire gratuitement
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center mt-2">
                      ✓ Pas de carte bancaire requise
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Step 2 — visual left, text right */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              {/* Step 2 visual — setup mockup */}
              <div className="flex justify-center md:justify-start order-2 md:order-1">
                <div className="relative w-full max-w-[300px]">
                  <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-secondary/5 blur-xl" />
                  <motion.div
                    className="relative rounded-2xl border border-border/50 bg-white dark:bg-card shadow-xl p-5 z-10 img-shimmer-hover animate-float-drift animate-scan"
                    whileHover={{ y: -10, scale: 1.03, boxShadow: "0 28px 56px -8px oklch(56% 0.15 250 / 0.22)" }}
                    transition={{ type: "spring", stiffness: 280, damping: 20 }}
                  >
                    <p className="text-sm font-bold mb-4">Mon entreprise</p>
                    <div className="flex items-center gap-3 rounded-xl bg-primary/5 p-3 mb-4">
                      <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                        S
                      </div>
                      <div>
                        <p className="text-xs font-semibold">Shop Dakar</p>
                        <p className="text-[10px] text-muted-foreground">E-commerce · Dakar 🇸🇳</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {[
                        { label: "Produits ajoutés", val: "24", icon: "📦" },
                        { label: "Utilisateurs invités", val: "3", icon: "👥" },
                        { label: "Magasins configurés", val: "2", icon: "🏪" },
                      ].map((r) => (
                        <div
                          key={r.label}
                          className="flex items-center justify-between text-xs rounded-lg border border-border/40 px-3 py-2"
                        >
                          <span className="text-muted-foreground">
                            {r.icon} {r.label}
                          </span>
                          <span className="font-bold text-primary">{r.val}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-green-600 font-semibold">
                      <CheckCircle2 className="h-3 w-3" />
                      Entreprise prête à gérer
                    </div>
                  </motion.div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold text-sm mb-5">
                  2
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  Configurez votre entreprise
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  Ajoutez vos produits, vos points de vente et invitez votre
                  équipe. Notre assistant vous guide pas à pas — aucune
                  formation technique nécessaire.
                </p>
                <Button variant="outline" className="rounded-xl font-medium" asChild>
                  <Link href="/register">
                    Voir la configuration
                    <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Step 3 — text left, dashboard visual right */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div>
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold text-sm mb-5">
                  3
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  Gérez en toute sérénité
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  Enregistrez vos ventes, suivez vos colis COD, consultez vos
                  rapports. Tout est automatisé — vous voyez, vous décidez,
                  vous dormez tranquille.
                </p>
                <Button variant="outline" className="rounded-xl font-medium" asChild>
                  <Link href="/register">
                    Découvrir les fonctionnalités
                    <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              <motion.div
                className="flex justify-center md:justify-end animate-float-gentle [animation-delay:1.4s] animate-scan"
                whileHover={{ y: -10, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 280, damping: 20 }}
              >
                <FinancesMockup />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURES — Chariow tabs + visual mockup ── */}
      <section id="fonctionnalites" className="py-20">
        <div className="container mx-auto px-5">
          <div className="max-w-xl mx-auto text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Fonctionnalités
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tout pour piloter votre business
            </h2>
            <p className="text-muted-foreground text-sm">
              Un seul outil, toutes les briques pour gérer, analyser et
              développer.
            </p>
          </div>

          {/* Feature tabs — Chariow-style */}
          <div className="max-w-5xl mx-auto">
            <div className="flex gap-2 mb-10 justify-center flex-wrap">
              {FEATURE_TABS.map((tab, i) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFeature(i)}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      activeFeature === i
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-white dark:bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/30"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Active feature content */}
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="grid md:grid-cols-2 gap-12 items-center rounded-3xl border border-border/50 bg-white dark:bg-card p-8 md:p-12 shadow-sm"
            >
              {/* Left: description */}
              <div>
                <h3 className="text-2xl font-bold mb-4">
                  {FEATURE_TABS[activeFeature].headline}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {FEATURE_TABS[activeFeature].desc}
                </p>
                <ul className="space-y-3 mb-7">
                  {FEATURE_TABS[activeFeature].points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      {point}
                    </li>
                  ))}
                </ul>
                <Button className="rounded-xl font-semibold" asChild>
                  <Link href="/register">
                    Essayer gratuitement
                    <ChevronRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Right: visual mockup */}
              <div className="relative flex justify-center md:justify-end">
                {/* Animated glow behind mockup */}
                <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-primary/8 blur-2xl animate-breathe" />
                {/* Rotating ring decoration */}
                <div className="pointer-events-none absolute -inset-3 rounded-3xl border border-primary/10 animate-ring-spin" />
                <motion.div
                  className="relative z-10 animate-float-gentle animate-card-glow animate-scan"
                  initial={{ opacity: 0, scale: 0.94, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  whileHover={{ y: -12, scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  {FEATURE_TABS[activeFeature].mockup}
                </motion.div>
              </div>
            </motion.div>

            {/* Feature grid — extras */}
            <div className="grid gap-4 md:grid-cols-3 mt-8">
              {[
                {
                  icon: <Building2 className="h-5 w-5 text-primary" />,
                  title: "Multi-magasins",
                  desc: "Gérez plusieurs points de vente depuis un tableau de bord unique avec transferts inter-magasins.",
                },
                {
                  icon: <Users className="h-5 w-5 text-primary" />,
                  title: "Multi-utilisateurs",
                  desc: "Invitez votre équipe, définissez les rôles et permissions, suivez toute l'activité.",
                },
                {
                  icon: <Lock className="h-5 w-5 text-primary" />,
                  title: "Sécurité totale",
                  desc: "Chiffrement SSL/TLS, backups automatiques, conformité aux standards internationaux.",
                },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border border-border/50 bg-white dark:bg-card p-5 hover:border-primary/25 hover:shadow-sm transition-all"
                >
                  <div className="mb-3 h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    {f.icon}
                  </div>
                  <h4 className="font-semibold text-sm mb-1.5">{f.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="relative py-20 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-muted/25" />
        {/* Decorative rings */}
        <div className="pointer-events-none absolute -left-32 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full border-2 border-primary/6" />
        <div className="pointer-events-none absolute -left-12 top-1/2 -translate-y-1/2 h-[280px] w-[280px] rounded-full border border-primary/5" />

        <div className="container relative z-10 mx-auto px-5">
          <div className="max-w-xl mx-auto text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Témoignages
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ils ont repris le contrôle
            </h2>
            <p className="text-muted-foreground text-sm">
              Des entrepreneurs à travers l&apos;Afrique témoignent de
              l&apos;impact de GestiCash sur leur quotidien.
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <TestimonialsCarousel />
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="tarifs" className="py-20">
        <div className="container mx-auto px-5">
          <div className="max-w-xl mx-auto text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Tarification
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple et transparent
            </h2>
            <p className="text-muted-foreground text-sm">
              Aucun frais caché. Aucun engagement. Changez de plan à tout
              moment.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Standard */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border/60 bg-white dark:bg-card p-8 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                Standard
              </p>
              <div className="flex items-end gap-1.5 mb-1">
                <span className="text-4xl font-bold">9 900</span>
                <span className="text-base font-semibold text-muted-foreground mb-0.5">
                  FCFA
                </span>
                <span className="text-sm text-muted-foreground mb-0.5">/mois</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Pour les entrepreneurs solo et petites boutiques
              </p>
              <div className="rounded-xl bg-muted/40 p-4 mb-6 text-xs space-y-1.5">
                {[
                  ["1 magasin", "✓"],
                  ["3 utilisateurs max", "✓"],
                  ["100 commandes / mois", "✓"],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-muted-foreground">
                    <span>{label}</span>
                    <span className="font-bold text-foreground">{val}</span>
                  </div>
                ))}
              </div>
              <ul className="space-y-2.5 mb-7">
                {[
                  "Gestion financière complète",
                  "Ventes & COD",
                  "Stock en temps réel",
                  "Facturation illimitée",
                  "Rapports standard",
                  "Support email",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button className="w-full rounded-xl border-2 border-border py-2.5 text-sm font-semibold hover:border-primary/40 hover:bg-primary/5 transition-colors">
                <Link href="/register?plan=standard" className="block">
                  Commencer
                </Link>
              </button>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="rounded-2xl border-2 border-primary bg-primary/5 p-8 relative shadow-sm"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1 text-xs font-semibold text-primary-foreground">
                  <Zap className="h-3 w-3" /> Populaire
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
                Pro
              </p>
              <div className="flex items-end gap-1.5 mb-1">
                <span className="text-4xl font-bold">24 900</span>
                <span className="text-base font-semibold text-muted-foreground mb-0.5">
                  FCFA
                </span>
                <span className="text-sm text-muted-foreground mb-0.5">/mois</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Pour les PME en croissance et multi-magasins
              </p>
              <div className="rounded-xl bg-primary/10 p-4 mb-6 text-xs space-y-1.5">
                {[
                  ["Magasins illimités", "✓"],
                  ["Utilisateurs illimités", "✓"],
                  ["COD illimité", "✓"],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-muted-foreground">
                    <span>{label}</span>
                    <span className="font-bold text-foreground">{val}</span>
                  </div>
                ))}
              </div>
              <ul className="space-y-2.5 mb-7">
                {[
                  "Tout du plan Standard",
                  "Multi-magasins & transferts",
                  "Analytics avancés",
                  "Export personnalisé",
                  "API d'intégration",
                  "Support WhatsApp prioritaire",
                  "Formation personnalisée",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="w-full rounded-xl" asChild>
                <Link href="/register?plan=pro">Commencer</Link>
              </Button>
            </motion.div>
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/6 px-5 py-2.5 text-sm">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>
                <strong>Offre de lancement&nbsp;:</strong> 30 jours
                d&apos;essai gratuit — sans carte bancaire, sans engagement
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 bg-muted/20">
        <div className="container mx-auto px-5">
          <div className="max-w-xl mx-auto text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              FAQ
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Questions fréquentes
            </h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {[
              {
                q: "GestiCash fonctionne-t-il hors ligne ?",
                a: "Actuellement, GestiCash nécessite une connexion internet. Le mode hors-ligne avec synchronisation est prévu prochainement.",
              },
              {
                q: "Puis-je changer de plan à tout moment ?",
                a: "Oui. Passage de Standard à Pro (ou inversement) à tout moment, effet immédiat.",
              },
              {
                q: "Mes données sont-elles sécurisées ?",
                a: "Chiffrement SSL/TLS, backups automatiques quotidiens, hébergement conforme aux standards internationaux.",
              },
              {
                q: "Puis-je importer mes données existantes ?",
                a: "Oui. Import via Excel/CSV pour vos produits, clients et transactions. Notre équipe vous accompagne.",
              },
              {
                q: "Y a-t-il des frais cachés ?",
                a: "Non. Le prix affiché est le prix final. Aucun frais de configuration, aucun frais par transaction.",
              },
              {
                q: "GestiCash est-il adapté à mon pays ?",
                a: "Oui ! Conçu pour l'Afrique. Plusieurs devises supportées (FCFA, EUR, USD…), adapté au COD et au mobile money.",
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                viewport={{ once: true }}
                className="rounded-xl border border-border/50 bg-white dark:bg-card px-5 py-4 hover:border-primary/25 transition-colors"
              >
                <p className="text-sm font-semibold mb-1.5">{faq.q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative py-28 overflow-hidden">
        {/* Background dot grid */}
        <div className="pointer-events-none absolute inset-0 bg-dot-grid" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        {/* Decorative rings */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full border-2 border-primary/8" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[380px] w-[380px] rounded-full border border-primary/10" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[180px] w-[180px] rounded-full border border-primary/12" />
        {/* Soft blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary/6 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-secondary/6 blur-3xl" />

        <div className="container relative z-10 mx-auto px-5">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
              Prêt ?
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-5 leading-tight">
              Reprenez le contrôle de votre business
            </h2>
            <p className="text-muted-foreground mb-8 text-base max-w-lg mx-auto leading-relaxed">
              Rejoignez des centaines d&apos;entrepreneurs qui gèrent leur
              business sereinement avec GestiCash.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center mb-6">
              <Button
                size="lg"
                className="rounded-xl font-semibold px-8 text-base"
                asChild
              >
                <Link href="/register">
                  Commencer gratuitement
                  <ChevronRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl font-semibold text-base border-2"
              >
                Planifier une démo
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-5 text-xs text-muted-foreground">
              {[
                "30 jours d'essai gratuit",
                "Sans engagement",
                "Support en français",
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative border-t border-zinc-800 bg-zinc-950 overflow-hidden">
        {/* Ligne de lumière verte en haut */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        {/* Lueur verte subtile */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[500px] rounded-full bg-primary/8 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

        <div className="container relative z-10 mx-auto px-5 py-14">
          <div className="grid gap-8 md:grid-cols-4 mb-12">
            {/* Brand column */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: -10 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 14 }}
                >
                  <Image
                    src="/logo/logo.png"
                    alt="GestiCash"
                    width={32}
                    height={32}
                    className="h-[32px] w-[32px] object-contain"
                  />
                </motion.div>
                <span className="font-bold text-white text-base">GestiCash™</span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed mb-5">
                Solution de gestion commerciale &amp; financière pensée pour
                les entrepreneurs d&apos;Afrique.
              </p>
              {/* Badges réseaux */}
              <div className="flex gap-2.5">
                {[
                  { label: "𝕏", name: "Twitter / X" },
                  { label: "in", name: "LinkedIn" },
                  { label: "f", name: "Facebook" },
                  { label: "📱", name: "WhatsApp" },
                ].map((s) => (
                  <a
                    key={s.name}
                    href="#"
                    aria-label={s.name}
                    title={s.name}
                    className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 hover:bg-primary/20 hover:text-primary transition-colors"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {[
              {
                title: "Produit",
                links: [
                  ["Fonctionnalités", "#fonctionnalites"],
                  ["Tarifs", "#tarifs"],
                  ["Comment ça marche", "#comment-ca-marche"],
                  ["Se connecter", "/login"],
                ],
              },
              {
                title: "Entreprise",
                links: [
                  ["À propos", "#"],
                  ["Blog", "#"],
                  ["Nous contacter", "#"],
                  ["Carrières", "#"],
                ],
              },
              {
                title: "Légal",
                links: [
                  ["Conditions d'utilisation", "#"],
                  ["Politique de confidentialité", "#"],
                  ["Mentions légales", "#"],
                  ["RGPD", "#"],
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h6 className="font-semibold text-sm mb-4 text-white">{col.title}</h6>
                <ul className="space-y-2.5 text-sm text-zinc-400">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <a
                        href={href}
                        className="hover:text-white transition-colors"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
            <span>© 2026 GestiCash™. Tous droits réservés.</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Fait avec ❤️ pour l&apos;Afrique
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
