"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import {
  Rocket,
  AlertCircle,
  Package,
  Receipt,
  DollarSign,
  Clock,
  CheckCircle2,
  BarChart3,
  Box,
  TrendingUp,
  Users,
  FileText,
  Building2,
  Smartphone,
  Lock,
  Zap,
  ShoppingCart,
  Mail,
  MessageSquare,
  ChevronRight,
  Star,
  Quote,
  ArrowRight,
  ArrowLeft,
  Monitor,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

// Animation component for scroll reveal
function FadeInWhenVisible({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// Testimonials Carousel Component
function TestimonialsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    });
  }, [emblaApi]);

  const testimonials = [
    {
      name: "Amadou Diallo",
      role: "E-commerce - Dakar",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amadou",
      text: "Avant GestiCash, je perdais facilement 200.000 FCFA par mois sans comprendre pourquoi. Maintenant, je sais exactement où va chaque franc. Mon chiffre d'affaires a augmenté de 40% en 3 mois !",
      rating: 5,
    },
    {
      name: "Fatou Ndiaye",
      role: "Boutique de mode - Abidjan",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatou",
      text: "Le suivi COD était un cauchemar avant. Maintenant avec GestiCash, je sais en temps réel combien de colis sont livrés et combien je dois récupérer. C'est magique !",
      rating: 5,
    },
    {
      name: "Moussa Koné",
      role: "Supérette - Bamako",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Moussa",
      text: "La gestion du stock en temps réel m'a sauvé. Plus de ruptures, plus de surstocks. Je commande juste ce qu'il faut, au bon moment.",
      rating: 5,
    },
    {
      name: "Aïcha Traoré",
      role: "Multimagasins - Cotonou",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aicha",
      text: "Avec 3 magasins, c'était impossible de tout suivre. GestiCash m'a donné une vision consolidée de tout mon business. Je gagne 10h par semaine !",
      rating: 5,
    },
  ];

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] min-w-0 pl-4">
              <Card className="h-full bg-card/50 backdrop-blur border-primary/10 hover:border-primary/30 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden bg-primary/10">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{testimonial.name}</CardTitle>
                      <CardDescription className="text-xs">{testimonial.role}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-primary/20 mb-2" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {testimonial.text}
                  </p>
                </CardHeader>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-2 justify-center mt-6">
        <Button
          variant="outline"
          size="icon"
          onClick={scrollPrev}
          className="rounded-full h-10 w-10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={scrollNext}
          className="rounded-full h-10 w-10"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex ? "w-8 bg-primary" : "w-2 bg-primary/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Screenshots Carousel Component
function ScreenshotsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const screenshots = [
    {
      title: "Dashboard intuitif",
      description: "Vue d'ensemble de votre business en un coup d'œil",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    },
    {
      title: "Gestion COD simplifiée",
      description: "Suivez tous vos colis en temps réel",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
    },
    {
      title: "Analytics avancés",
      description: "Rapports détaillés et insights pertinents",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    },
    {
      title: "Gestion de stock",
      description: "Stock en temps réel avec alertes automatiques",
      image: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80",
    },
  ];

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {screenshots.map((screenshot, index) => (
            <div key={index} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_40%] min-w-0 pl-4">
              <Card className="overflow-hidden group cursor-pointer border-2 hover:border-primary/50 transition-all duration-300">
                <div className="relative h-64 overflow-hidden bg-muted">
                  <Image
                    src={screenshot.image}
                    alt={screenshot.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h4 className="text-white font-bold text-lg mb-1 drop-shadow-md">{screenshot.title}</h4>
                    <p className="text-white/90 text-sm drop-shadow-md">{screenshot.description}</p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-2 justify-center mt-6">
        <Button
          variant="outline"
          size="icon"
          onClick={scrollPrev}
          className="rounded-full h-10 w-10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={scrollNext}
          className="rounded-full h-10 w-10"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Animated Counter Component
function AnimatedCounter({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, end]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/logo/logo.png"
                alt="GestiCash Logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">GestiCash™</h1>
                <p className="text-[10px] text-muted-foreground">Votre argent, enfin sous contrôle.</p>
              </div>
            </div>
            <nav className="hidden gap-6 md:flex">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Fonctionnalités</a>
              <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Tarifs</a>
              <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">Comment ça marche</a>
              <a href="#faq" className="text-sm font-medium hover:text-primary transition-colors">FAQ</a>
            </nav>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Connexion</Link>
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90 font-semibold" asChild>
                <Link href="/register">S'inscrire</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-4 text-xs font-semibold">
                <Rocket className="mr-1 h-3 w-3" />
                SaaS de gestion commerciale & financière
              </Badge>
            </motion.div>
            
            <motion.h2
              className="mb-6 text-4xl font-extrabold leading-tight md:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Votre argent,{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                enfin sous contrôle
              </span>
            </motion.h2>
            
            <motion.p
              className="mb-8 text-lg text-muted-foreground md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              GestiCash est la solution SaaS tout-en-un qui permet aux e-commerces, commerces physiques et PME d'Afrique de maîtriser totalement leurs flux d'argent, ventes, stock et opérations — <strong>sans perte invisible</strong>.
            </motion.p>
            
            <motion.div
              className="mb-10 flex flex-col gap-4 sm:flex-row sm:justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Button size="lg" className="bg-primary hover:bg-primary/90 font-semibold text-lg group" asChild>
                <Link href="/register">
                  S'inscrire gratuitement
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="font-semibold text-lg">
                Voir une démo
              </Button>
            </motion.div>
            <motion.div
              className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Sans carte bancaire</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Installation en 5 min</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Support en français</span>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Decorative gradient */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Social Proof Stats Section */}
      <section className="py-16 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: 500, suffix: "+", label: "Entrepreneurs satisfaits" },
              { value: 2, suffix: "M+", label: "FCFA gérés par mois" },
              { value: 10, suffix: "K+", label: "Transactions traitées" },
              { value: 99, suffix: "%", label: "Taux de satisfaction" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeInWhenVisible>
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h3 className="mb-4 text-3xl font-bold md:text-4xl">
                Les problèmes que vous rencontrez <span className="text-destructive">chaque jour</span>
              </h3>
              <p className="text-lg text-muted-foreground">
                Nous comprenons les défis spécifiques des entrepreneurs en Afrique
              </p>
            </div>
          </FadeInWhenVisible>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <AlertCircle className="h-10 w-10 text-destructive" />,
                title: "Argent qui disparaît",
                description: "Vous ne savez jamais exactement combien vous avez gagné, encaissé, ou ce qu'il vous reste réellement."
              },
              {
                icon: <Package className="h-10 w-10 text-destructive" />,
                title: "Stock désordonné",
                description: "Ruptures de stock, surstocks, marchandises perdues... impossible de suivre vos produits."
              },
              {
                icon: <Receipt className="h-10 w-10 text-destructive" />,
                title: "COD non maîtrisé",
                description: "En e-commerce COD : combien de colis envoyés ? Combien livrés ? Combien encaissés ? Aucune visibilité."
              },
              {
                icon: <DollarSign className="h-10 w-10 text-destructive" />,
                title: "Pertes invisibles",
                description: "Vol, erreurs de caisse, frais cachés... Vous perdez de l'argent sans même le savoir."
              },
              {
                icon: <FileText className="h-10 w-10 text-destructive" />,
                title: "Gestion manuelle",
                description: "Cahiers, Excel, WhatsApp... tout est dispersé et vous passez des heures à tout recalculer."
              },
              {
                icon: <Clock className="h-10 w-10 text-destructive" />,
                title: "Pas de vision claire",
                description: "Impossible de savoir si vous êtes rentable, quels produits marchent, ou où va votre argent."
              }
            ].map((problem, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-destructive/20 bg-card hover:shadow-lg transition-all duration-300 h-full hover:-translate-y-1">
                  <CardHeader>
                    <div className="mb-3">{problem.icon}</div>
                    <CardTitle className="text-lg">{problem.title}</CardTitle>
                    <CardDescription className="text-sm">{problem.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <FadeInWhenVisible>
              <div className="text-center mb-16">
                <Badge variant="default" className="mb-4">La Solution</Badge>
                <h3 className="mb-4 text-3xl font-bold md:text-4xl">
                  GestiCash : <span className="text-primary">La maîtrise totale</span>
                </h3>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  À tout moment, vous savez <strong>exactement combien vous avez gagné, combien vous avez encaissé, et combien il vous reste.</strong>
                </p>
              </div>
            </FadeInWhenVisible>

            <div className="grid gap-8 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="border-2 border-primary/30 bg-primary/5 h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl">Flux d'argent transparent</CardTitle>
                  <CardDescription>
                    Suivez chaque euro/franc qui entre et sort. Réconciliation automatique entre ventes, encaissements et soldes.
                  </CardDescription>
                </CardHeader>
              </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
              <Card className="border-2 border-secondary/30 bg-secondary/5 h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl">Gestion COD complète</CardTitle>
                  <CardDescription>
                    Suivi colis par colis : envoyés, livrés, retournés, encaissés. Plus jamais de colis perdu ou d'argent non récupéré.
                  </CardDescription>
                </CardHeader>
              </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
              <Card className="border-2 border-accent/30 bg-accent/5 h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Box className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl">Stock intelligent</CardTitle>
                  <CardDescription>
                    Stock en temps réel, alertes automatiques, mouvements tracés. Vous savez toujours ce que vous avez en magasin.
                  </CardDescription>
                </CardHeader>
              </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
              <Card className="border-2 border-primary/30 bg-primary/5 h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl">Décisions éclairées</CardTitle>
                  <CardDescription>
                    Rapports instantanés, analytics en temps réel. Prenez les bonnes décisions au bon moment.
                  </CardDescription>
                </CardHeader>
              </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4">
          <FadeInWhenVisible>
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Star className="mr-1 h-3 w-3 fill-current" />
                Témoignages
              </Badge>
              <h3 className="mb-4 text-3xl font-bold md:text-4xl">
                Ils ont repris le contrôle de leur business
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Découvrez comment GestiCash transforme la gestion de centaines d'entrepreneurs à travers l'Afrique
              </p>
            </div>
          </FadeInWhenVisible>

          <TestimonialsCarousel />
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeInWhenVisible>
            <div className="text-center mb-12">
              <Badge variant="default" className="mb-4">
                <Monitor className="mr-1 h-3 w-3" />
                Interface
              </Badge>
              <h3 className="mb-4 text-3xl font-bold md:text-4xl">
                Une interface moderne et intuitive
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Conçue pour être simple à utiliser, même sans formation technique
              </p>
            </div>
          </FadeInWhenVisible>

          <ScreenshotsCarousel />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <h3 className="mb-4 text-3xl font-bold md:text-4xl">
                Fonctionnalités clés
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tout ce dont vous avez besoin pour gérer votre entreprise, en un seul endroit
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <DollarSign className="h-10 w-10 text-primary" />,
                title: "Gestion financière",
                features: ["Suivi trésorerie en temps réel", "Revenus & dépenses", "Rapprochement bancaire", "Budgets & prévisions"]
              },
              {
                icon: <ShoppingCart className="h-10 w-10 text-primary" />,
                title: "Ventes & COD",
                features: ["Gestion commandes COD", "Suivi livraisons", "Statuts colis détaillés", "Retours & remboursements"]
              },
              {
                icon: <Package className="h-10 w-10 text-primary" />,
                title: "Gestion de stock",
                features: ["Stock en temps réel", "Alertes seuils min/max", "Mouvements tracés", "Inventaires simplifiés"]
              },
              {
                icon: <BarChart3 className="h-10 w-10 text-primary" />,
                title: "Reporting & Analytics",
                features: ["Tableaux de bord personnalisés", "Rapports financiers", "Analyses de ventes", "Export Excel/PDF"]
              },
              {
                icon: <Receipt className="h-10 w-10 text-primary" />,
                title: "Facturation",
                features: ["Factures professionnelles", "Devis & bons de commande", "Gestion clients", "Paiements multiples"]
              },
              {
                icon: <Users className="h-10 w-10 text-primary" />,
                title: "Multi-utilisateurs",
                features: ["Gestion des rôles", "Permissions granulaires", "Activité tracée", "Collaboration équipe"]
              },
              {
                icon: <Building2 className="h-10 w-10 text-primary" />,
                title: "Multi-magasins",
                features: ["Gestion centralisée", "Stocks par magasin", "Transferts inter-magasins", "Rapports consolidés"]
              },
              {
                icon: <Smartphone className="h-10 w-10 text-primary" />,
                title: "Mobile & Web",
                features: ["Interface responsive", "Accessible partout", "Hors-ligne (bientôt)", "Application mobile (bientôt)"]
              },
              {
                icon: <Lock className="h-10 w-10 text-primary" />,
                title: "Sécurité & Sauvegarde",
                features: ["Données chiffrées", "Backups automatiques", "Historique complet", "Conformité RGPD"]
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 h-full hover:-translate-y-1 border-primary/10 hover:border-primary/30">
                  <CardHeader>
                    <div className="mb-3">{feature.icon}</div>
                    <CardTitle className="text-lg mb-3">{feature.title}</CardTitle>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {feature.features.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-muted/30 via-background to-muted/10">
        <div className="container mx-auto px-4">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <h3 className="mb-4 text-3xl font-bold md:text-4xl">
                Tarifs simples et transparents
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choisissez le plan qui correspond à vos besoins. Changez à tout moment.
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Standard Plan */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
            <Card className="border-2 hover:shadow-xl transition-all duration-300 h-full hover:-translate-y-2">
              <CardHeader className="text-center pb-8">
                <div className="mb-4">
                  <Badge variant="secondary">Standard</Badge>
                </div>
                <CardTitle className="text-2xl mb-2">Plan Standard</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold">9.900 FCFA</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <CardDescription>
                  Pour les petites entreprises et entrepreneurs solo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {[
                    "1 magasin/point de vente",
                    "3 utilisateurs max",
                    "Gestion financière complète",
                    "Ventes & COD (100 commandes/mois)",
                    "Stock en temps réel",
                    "Facturation illimitée",
                    "Rapports standard",
                    "Support email"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/register?plan=standard">Commencer</Link>
                </Button>
              </CardContent>
            </Card>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
            <Card className="border-2 border-primary bg-primary/5 hover:shadow-xl transition-all duration-300 relative h-full hover:-translate-y-2">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  <Zap className="mr-1 h-3 w-3" />
                  Populaire
                </Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <div className="mb-4">
                  <Badge variant="default">Pro</Badge>
                </div>
                <CardTitle className="text-2xl mb-2">Plan Pro</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold">24.900 FCFA</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <CardDescription>
                  Pour les PME en croissance et multi-magasins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {[
                    "Magasins illimités",
                    "Utilisateurs illimités",
                    "Tout du plan Standard",
                    "COD illimité",
                    "Multi-magasins & transferts",
                    "Analytics avancés",
                    "Exports personnalisés",
                    "API d'intégration",
                    "Support prioritaire (WhatsApp)",
                    "Formation personnalisée"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                  <Link href="/register?plan=pro">Commencer</Link>
                </Button>
              </CardContent>
            </Card>
            </motion.div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-2 text-sm">
              <Zap className="h-4 w-4 text-accent" />
              <span><strong>Offre de lancement :</strong> 30 jours d'essai gratuit sur tous les plans, sans carte bancaire</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <h3 className="mb-4 text-3xl font-bold md:text-4xl">
                Comment ça marche ?
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Démarrez en quelques minutes et prenez le contrôle de votre business
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="max-w-4xl mx-auto">
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Inscrivez-vous",
                  description: "Créez votre compte en 2 minutes. Aucune carte bancaire requise pour l'essai gratuit.",
                  icon: <FileText className="h-12 w-12 text-primary" />
                },
                {
                  step: "2",
                  title: "Configurez votre entreprise",
                  description: "Ajoutez vos produits, vos magasins, invitez votre équipe. Notre assistant vous guide pas à pas.",
                  icon: <Building2 className="h-12 w-12 text-primary" />
                },
                {
                  step: "3",
                  title: "Gérez en toute sérénité",
                  description: "Enregistrez vos ventes, suivez vos COD, consultez vos rapports. Tout est automatisé.",
                  icon: <Rocket className="h-12 w-12 text-primary" />
                }
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <motion.div
                    className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {step.step}
                  </motion.div>
                  <div className="mb-3 mx-auto w-fit">{step.icon}</div>
                  <h4 className="mb-2 text-xl font-bold">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <h3 className="mb-4 text-3xl font-bold md:text-4xl">
                Questions fréquentes
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tout ce que vous devez savoir sur GestiCash
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "GestiCash fonctionne-t-il hors ligne ?",
                a: "Actuellement, GestiCash nécessite une connexion internet. Le mode hors-ligne avec synchronisation est prévu pour une prochaine version."
              },
              {
                q: "Puis-je changer de plan à tout moment ?",
                a: "Oui, absolument ! Vous pouvez passer du plan Standard au plan Pro (ou inversement) à tout moment. Les changements sont effectifs immédiatement."
              },
              {
                q: "Mes données sont-elles sécurisées ?",
                a: "Oui. Nous utilisons un chiffrement de niveau bancaire (SSL/TLS), des backups automatiques quotidiens, et vos données sont hébergées sur des serveurs sécurisés conformes aux normes internationales."
              },
              {
                q: "Puis-je importer mes données existantes ?",
                a: "Oui, vous pouvez importer vos produits, clients et transactions via Excel/CSV. Notre équipe support peut vous accompagner dans la migration."
              },
              {
                q: "Y a-t-il des frais cachés ?",
                a: "Non. Le prix affiché est le prix final. Pas de frais de configuration, pas de frais par transaction, pas de surprises."
              },
              {
                q: "Comment fonctionne l'essai gratuit ?",
                a: "30 jours d'accès complet sans engagement et sans carte bancaire. Vous pouvez annuler à tout moment."
              },
              {
                q: "Quel support proposez-vous ?",
                a: "Plan Standard : support par email (réponse sous 24h). Plan Pro : support prioritaire par WhatsApp + email (réponse sous 2h) + formation personnalisée."
              },
              {
                q: "GestiCash est-il adapté à mon pays ?",
                a: "Oui ! GestiCash est conçu spécifiquement pour l'Afrique. Nous supportons plusieurs devises (FCFA, Euro, Dollar, etc.) et nous adaptons aux réalités locales (COD, mobile money, etc.)."
              }
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-base">{faq.q}</CardTitle>
                    <CardDescription className="text-sm mt-2">{faq.a}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/5 relative overflow-hidden">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
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
          className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
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
        
        <div className="container mx-auto px-4 relative z-10">
          <FadeInWhenVisible>
            <div className="mx-auto max-w-3xl text-center">
              <h3 className="mb-6 text-3xl font-bold md:text-5xl">
                Prêt à reprendre le contrôle de votre argent ?
              </h3>
              <p className="mb-8 text-lg text-muted-foreground">
                Rejoignez les centaines d'entrepreneurs africains qui utilisent GestiCash pour gérer leur business en toute sérénité.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center mb-6">
                <Button size="lg" className="bg-primary hover:bg-primary/90 font-semibold text-lg group" asChild>
                  <Link href="/register">
                    Commencer gratuitement
                    <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="font-semibold text-lg">
                  Planifier une démo
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>30 jours d'essai gratuit</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Sans engagement</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Support en français</span>
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo/logo.png"
                  alt="GestiCash Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
                <div>
                  <h4 className="font-bold">GestiCash™</h4>
                  <p className="text-[10px] text-muted-foreground">Votre argent, enfin sous contrôle.</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                SaaS de gestion commerciale & financière pour l'Afrique.
              </p>
            </div>

            {/* Product */}
            <div>
              <h5 className="font-semibold mb-4">Produit</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Tarifs</a></li>
                <li><a href="#how-it-works" className="hover:text-primary transition-colors">Comment ça marche</a></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Se connecter</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h5 className="font-semibold mb-4">Entreprise</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Nous contacter</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Carrières</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h5 className="font-semibold mb-4">Légal</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Mentions légales</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">RGPD</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center">
            <p className="text-sm text-muted-foreground">
              © 2026 GestiCash™. Tous droits réservés. Fait avec ❤️ pour l'Afrique.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
