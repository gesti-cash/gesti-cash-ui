"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo/logo.png"
              alt="GestiCash Logo"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              GestiCash
            </span>
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;inscription
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="prose prose-neutral dark:prose-invert max-w-none"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight mt-0 mb-1">
                Politique de confidentialité
              </h1>
              <p className="text-sm text-muted-foreground m-0">
                Dernière mise à jour : mars 2026
              </p>
            </div>
          </div>

          <p className="lead text-muted-foreground">
            GestiCash s&apos;engage à protéger la vie privée des utilisateurs de sa plateforme.
            Cette politique décrit les données que nous collectons, comment nous les utilisons
            et les droits dont vous disposez.
          </p>

          <section>
            <h2>1. Données collectées</h2>
            <p>
              Nous collectons les informations que vous nous fournissez lors de l&apos;inscription
              et de l&apos;utilisation du service : nom, adresse e-mail, nom de l&apos;entreprise,
              et les données nécessaires à la gestion de votre activité (clients, produits,
              transactions, etc.).
            </p>
          </section>

          <section>
            <h2>2. Utilisation des données</h2>
            <p>
              Vos données sont utilisées pour fournir et améliorer nos services, personnaliser
              votre expérience, assurer la sécurité de la plateforme et nous conformer aux
              obligations légales. Nous ne vendons pas vos données personnelles à des tiers.
            </p>
          </section>

          <section>
            <h2>3. Conservation et sécurité</h2>
            <p>
              Nous conservons vos données tant que votre compte est actif et selon les durées
              prévues par la réglementation. Nous mettons en œuvre des mesures techniques et
              organisationnelles appropriées pour protéger vos données contre tout accès,
              modification ou divulgation non autorisés.
            </p>
          </section>

          <section>
            <h2>4. Vos droits (RGPD)</h2>
            <p>
              Conformément au Règlement général sur la protection des données (RGPD), vous
              disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de
              limitation du traitement, de portabilité et d&apos;opposition. Vous pouvez
              exercer ces droits en nous contactant ou depuis les paramètres de votre compte.
              Vous avez également le droit d&apos;introduire une réclamation auprès de l&apos;autorité
              de contrôle compétente.
            </p>
          </section>

          <section>
            <h2>5. Cookies et traceurs</h2>
            <p>
              Nous utilisons des cookies et technologies similaires pour le bon fonctionnement
              du service, l&apos;authentification et l&apos;analyse d&apos;usage. Vous pouvez
              gérer vos préférences dans les paramètres de votre navigateur.
            </p>
          </section>

          <section>
            <h2>6. Contact</h2>
            <p>
              Pour toute question relative à cette politique ou à vos données personnelles,
              vous pouvez nous contacter à l&apos;adresse indiquée sur notre site ou dans
              l&apos;application.
            </p>
          </section>
        </motion.article>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4"
        >
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;inscription
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Accueil
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
